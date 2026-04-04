const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { handleUpload } = require('@vercel/blob/client');
const db = require('./db');
const NotificationService = require('./NotificationService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// --- DATABASE MIGRATION TRIGGER ---
// We will call migrate.js separately or on startup if needed.
// For now, assume migration is handled via Railway deployment.

// --- API ROUTES ---

// Products
app.get('/api/products', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM products ORDER BY created_at DESC');
        // Map decimal strings to numbers for frontend compatibility
        const products = result.rows.map(p => ({
            ...p,
            price: parseFloat(p.price),
            discountPrice: p.discount_price ? parseFloat(p.discount_price) : null,
            rating: p.rating ? parseFloat(p.rating) : 5,
            variants: p.variants || [],
            imageName: p.image_name,
            descriptionBlocks: p.description_blocks
        }));
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    const p = req.body;
    const id = p.id || `prod_${Date.now()}`;
    try {
        const result = await db.query(
            `INSERT INTO products (id, name, category, price, discount_price, rating, stock, variants, image_name, images, description, details, description_blocks)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
            [id, p.name, p.category, p.price, p.discountPrice, p.rating, p.stock, JSON.stringify(p.variants || []), p.imageName, JSON.stringify(p.images), p.description, JSON.stringify(p.details), JSON.stringify(p.descriptionBlocks)]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    const p = req.body;
    try {
        const result = await db.query(
            `UPDATE products SET name=$1, category=$2, price=$3, discount_price=$4, rating=$5, stock=$6, variants=$7, image_name=$8, images=$9, description=$10, details=$11, description_blocks=$12
             WHERE id=$13 RETURNING *`,
            [p.name, p.category, p.price, p.discountPrice, p.rating, p.stock, JSON.stringify(p.variants || []), p.imageName, JSON.stringify(p.images), p.description, JSON.stringify(p.details), JSON.stringify(p.descriptionBlocks), req.params.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: "Product not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE id=$1', [req.params.id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Banners
app.get('/api/banners', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM banners ORDER BY id ASC');
        const formatted = result.rows.map(b => ({
            ...b,
            contentPosition: b.content_position || 'center',
            focalPoint: b.focal_point || { x: 50, y: 50 },
            fitMode: b.fit_mode || 'cover',
            translateX: parseFloat(b.translate_x || 0),
            translateY: parseFloat(b.translate_y || 0),
            zoom: parseFloat(b.zoom || 1),
            refWidth: b.ref_width,
            refHeight: b.ref_height,
            link: b.link
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/banners', async (req, res) => {
    try {
        await db.query('DELETE FROM banners');
        for (const b of req.body) {
            await db.query(
                `INSERT INTO banners (title, subtitle, cta, image, content_position, focal_point, fit_mode, translate_x, translate_y, zoom, ref_width, ref_height, link) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                [
                    b.title, b.subtitle, b.cta, b.image, b.contentPosition || 'center', 
                    JSON.stringify(b.focalPoint || {x: 50, y: 50}), b.fitMode || 'cover',
                    b.translateX || 0, b.translateY || 0, b.zoom || 1, b.refWidth || null, b.refHeight || null,
                    b.link || ''
                ]
            );
        }
        const result = await db.query('SELECT * FROM banners ORDER BY id ASC');
        const formatted = result.rows.map(b => ({
            ...b,
            contentPosition: b.content_position || 'center',
            focalPoint: b.focal_point || { x: 50, y: 50 },
            fitMode: b.fit_mode || 'cover',
            translateX: parseFloat(b.translate_x || 0),
            translateY: parseFloat(b.translate_y || 0),
            zoom: parseFloat(b.zoom || 1),
            refWidth: b.ref_width,
            refHeight: b.ref_height,
            link: b.link
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Media
app.get('/api/media', async (req, res) => {
    try {
        const result = await db.query('SELECT data FROM settings WHERE id=$1', ['media']);
        res.json(result.rows[0]?.data || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/media', async (req, res) => {
    try {
        const result = await db.query('SELECT data FROM settings WHERE id=$1', ['media']);
        let media = result.rows[0]?.data || [];
        const newMedia = { ...req.body, id: Date.now() };
        media.push(newMedia);
        await db.query('INSERT INTO settings (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data', ['media', JSON.stringify(media)]);
        res.status(201).json(newMedia);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Orders
app.get('/api/orders', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    const o = req.body;
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Validate and Deduct Stock
        for (const item of o.items) {
            const productRes = await client.query('SELECT variants, name FROM products WHERE id = $1 FOR UPDATE', [item.id]);
            if (productRes.rowCount === 0) throw new Error(`Product ${item.id} not found`);

            const product = productRes.rows[0];
            let variants = product.variants || [];
            const variantIdx = variants.findIndex(v => v.size === item.size);

            if (variantIdx === -1) throw new Error(`Size ${item.size} not found for product ${product.name}`);
            
            if (variants[variantIdx].stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name} (Size: ${item.size}). Available: ${variants[variantIdx].stock}, Requested: ${item.quantity}`);
            }

            // Deduct stock
            variants[variantIdx].stock -= item.quantity;
            
            // Also update the global 'stock' field for backward compatibility/legacy views
            const newGlobalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

            await client.query(
                'UPDATE products SET variants = $1, stock = $2 WHERE id = $3',
                [JSON.stringify(variants), newGlobalStock, item.id]
            );
        }

        // 2. Create Order
        const result = await client.query(
            `INSERT INTO orders (
                data, status, customer_name, customer_email, customer_phone, 
                total_amount, shipping_cost, discount_amount, items, shipping_address
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [
                JSON.stringify(o), 
                'Pending', 
                `${o.firstName} ${o.lastName}`, 
                o.email, 
                o.phone, 
                o.total, 
                o.shipping, 
                o.discountAmount, 
                JSON.stringify(o.items), 
                JSON.stringify({ address: o.address, city: o.city, state: o.state, zip: o.zip })
            ]
        );
        
        await client.query('COMMIT');
        
        const newOrder = result.rows[0];
        // Trigger async notification (non-blocking)
        NotificationService.notifyOrdered(newOrder).catch(err => console.error("Initial notification failed:", err));
        
        res.status(201).json(newOrder);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Order processing error:", err);
        res.status(400).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Patch Order Shipping Status
app.patch('/api/orders/:id/ship', async (req, res) => {
    const { id } = req.params;
    const { tracking_number, carrier } = req.body;

    try {
        // 1. Update Order
        const result = await db.query(
            `UPDATE orders SET 
                status = 'Shipped', 
                tracking_number = $1, 
                carrier = $2, 
                shipped_at = CURRENT_TIMESTAMP 
             WHERE id = $3 RETURNING *`,
            [tracking_number, carrier, id]
        );

        if (result.rowCount === 0) return res.status(404).json({ error: "Order not found" });
        const updatedOrder = result.rows[0];

        // 2. Dynamic Carrier Learning
        const settingsResult = await db.query('SELECT data FROM settings WHERE id=$1', ['global']);
        let settings = settingsResult.rows[0]?.data || {};
        let carriers = settings.carriers || ["FedEx", "Delhivery", "BlueDart", "DTDC"];
        
        if (!carriers.includes(carrier)) {
            carriers.push(carrier);
            await db.query(
                'INSERT INTO settings (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
                ['global', JSON.stringify({ ...settings, carriers })]
            );
            console.log(`📦 New carrier registered: ${carrier}`);
        }

        // 3. Trigger Notifications
        NotificationService.notifyShipped(updatedOrder, { tracking_number, carrier })
            .catch(err => console.error("Shipment notification failed:", err));

        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Settings Routes
app.get('/api/settings', async (req, res) => {
    try {
        const result = await db.query('SELECT data FROM settings WHERE id=$1', ['global']);
        res.json(result.rows[0]?.data || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/settings', async (req, res) => {
    try {
        await db.query(
            'INSERT INTO settings (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
            ['global', JSON.stringify(req.body)]
        );
        res.json(req.body);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Vercel Blob Signature Route
// Vercel Blob Signature Route
app.post('/api/upload', async (request, response) => {
    const body = request.body;
    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            token: process.env.BLOB_READ_WRITE_TOKEN,
            onBeforeGenerateToken: async (pathname) => {
                return {
                    allowedContentTypes: ['image/jpeg', 'image/png'],
                    tokenPayload: JSON.stringify({
                        role: 'admin',
                    }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log('Blob upload completed:', blob.url);
            },
        });
        return response.status(200).json(jsonResponse);
    } catch (error) {
        return response.status(400).json({ error: error.message });
    }
});

app.get('/api/reviews/:productId', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM reviews WHERE product_id=$1', [req.params.productId]);
        res.json(result.rows.map(r => r.data));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/reviews', async (req, res) => {
    try {
        const newReview = { ...req.body, id: Date.now(), date: new Date().toISOString().split('T')[0] };
        await db.query(
            'INSERT INTO reviews (product_id, data, date) VALUES ($1, $2, $3)',
            [req.body.productId, JSON.stringify(newReview), newReview.date]
        );
        res.status(201).json(newReview);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Auth
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    // Hardcoded credentials for now, as requested by user
    if (username === 'sneha@tutuandco.in' && password === 'Black@5353') {
        res.json({ authenticated: true });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Tutu & Co Backend running on port ${PORT}`);
});
