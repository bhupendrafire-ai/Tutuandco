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

        // 1. DETERMINISTIC LOCKING: Unique, sorted product IDs
        const productIds = [...new Set(o.items.map(i => i.id))].sort();
        
        // Execute batch lock in deterministic order (ASC) to prevent deadlocks
        const productsRes = await client.query(
            `SELECT * FROM products WHERE id = ANY($1) ORDER BY id ASC FOR UPDATE`,
            [productIds]
        );
        
        const productsFromDb = {};
        productsRes.rows.forEach(p => { productsFromDb[p.id] = p; });

        // 2. SERVER-ONLY PRICING & LOGIC (Post-Lock)
        const settingsRes = await client.query('SELECT data FROM settings WHERE id=$1', ['global']);
        const globalSettings = settingsRes.rows[0]?.data || {};
        const globalDiscountPercent = globalSettings.globalDiscount || 0;

        let serverSubtotal = 0;
        const verifiedItems = [];

        // Validate stock and verify prices AFTER the lock
        for (const item of o.items) {
            const product = productsFromDb[item.id];
            if (!product) throw new Error(`Product ${item.id} no longer available`);

            const variants = product.variants || [];
            // Match using variant size (or ID if we wanted to be even stricter)
            const variant = variants.find(v => v.size.toLowerCase() === (item.size || '').toLowerCase());
            
            if (!variant) throw new Error(`Size "${item.size}" not found for ${product.name}`);
            if (variant.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name} (${item.size}). Requested: ${item.quantity}, Available: ${variant.stock}`);
            }

            // Price Priority: Variant Specific -> Discount -> Base
            const serverPrice = variant.price !== undefined ? parseFloat(variant.price) : 
                              (product.discount_price ? parseFloat(product.discount_price) : parseFloat(product.price));
            
            const lineTotal = serverPrice * item.quantity;
            serverSubtotal += lineTotal;

            // Update local stock for subsequent items in same order if they share product
            variant.stock -= item.quantity;

            verifiedItems.push({
                ...item,
                unitPrice: serverPrice,
                lineTotal: lineTotal,
                price: serverPrice // for UI consistency in order history
            });
        }

        // 3. Persist Stock Deductions
        for (const pid of productIds) {
            await client.query(
                'UPDATE products SET variants = $1 WHERE id = $2',
                [JSON.stringify(productsFromDb[pid].variants), pid]
            );
        }

        // 4. Calculate Final Financials
        const serverDiscountAmount = (serverSubtotal * (globalDiscountPercent / 100));
        const finalSubtotal = serverSubtotal - serverDiscountAmount;
        const serverShippingCost = finalSubtotal >= 999 ? 0 : 89;
        const serverTotal = finalSubtotal + serverShippingCost;

        // 5. Create Order Record (Snapshotting all verified values)
        const result = await client.query(
            `INSERT INTO orders (
                data, status, customer_name, customer_email, customer_phone, 
                total_amount, shipping_cost, discount_amount, items, shipping_address
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [
                JSON.stringify({ ...o, items: verifiedItems, total: serverTotal, subtotal: serverSubtotal, discountAmount: serverDiscountAmount }), 
                'Pending', 
                `${o.firstName} ${o.lastName}`, 
                o.email, 
                o.phone, 
                serverTotal, 
                serverShippingCost, 
                serverDiscountAmount, 
                JSON.stringify(verifiedItems), 
                JSON.stringify({ address: o.address, city: o.city, state: o.state, zip: o.zip })
            ]
        );
        
        await client.query('COMMIT');
        
        const newOrder = result.rows[0];
        NotificationService.notifyOrdered(newOrder).catch(err => console.error("Notification fail:", err));
        
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
