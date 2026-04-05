const express = require('express');
const cors = require('cors');
const crypto = require('crypto'); // Used for generating auth tokens
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { handleUpload } = require('@vercel/blob/client');
const db = require('./db');
const NotificationService = require('./NotificationService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- CORS: Restrict access to known origins only ---
const allowedOrigins = [
  'http://localhost:5180',
  'http://127.0.0.1:5180',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (server-to-server, curl, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('CORS BLOCKED:', origin);
      return callback(null, false);
    }
  }
}));

app.use(bodyParser.json({ limit: '50mb' }));

// --- SIMPLE TOKEN AUTH ---
// In-memory token store (resets on server restart, which forces re-login)
const activeAdminTokens = new Set();

// Middleware: Verifies admin token from Authorization header
const requireAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // Expect format: "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    const token = authHeader.split(' ')[1];
    if (!activeAdminTokens.has(token)) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    next();
};

// --- DATABASE MIGRATION TRIGGER ---
// We will call migrate.js separately or on startup if needed.
// For now, assume migration is handled via Railway deployment.

// --- API HELPERS ---
const getProducts = async () => {
    console.log("Fetching products from DB...");
    const result = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    if (!result || !Array.isArray(result.rows)) {
        console.log("No result rows found in DB");
        return [];
    }
    
    return result.rows.map(p => {
        // Safe parsing for variants
        let variants = [];
        try {
            if (p.variants) {
                variants = typeof p.variants === 'string' ? JSON.parse(p.variants) : p.variants;
            }
        } catch (e) {
            console.error(`Error parsing variants for product ${p.id}:`, e);
        }
        if (!Array.isArray(variants)) variants = [];

        // Safe parsing for description blocks
        let descriptionBlocks = [];
        try {
            if (p.description_blocks) {
                descriptionBlocks = typeof p.description_blocks === 'string' ? JSON.parse(p.description_blocks) : p.description_blocks;
            }
        } catch (e) {
            console.error(`Error parsing description blocks for product ${p.id}:`, e);
        }
        if (!Array.isArray(descriptionBlocks)) descriptionBlocks = [];

        return {
            ...p,
            price: parseFloat(p.price) || 0,
            discountPrice: p.discount_price ? parseFloat(p.discount_price) : null,
            rating: p.rating ? parseFloat(p.rating) : 5,
            variants: variants,
            imageName: p.image_name,
            descriptionBlocks: descriptionBlocks
        };
    });
};

// --- API ROUTES ---

// Products
app.get('/api/products', async (req, res) => {
    try {
        console.log("GET /api/products called");
        const products = await getProducts();
        console.log("Products fetched successfully:", products?.length || 0);
        res.json(products);
    } catch (err) {
        console.error("🔥 PRODUCTS CRASH:", err);
        res.status(500).json({
            error: err.message,
            stack: err.stack
        });
    }
});

app.post('/api/products', requireAdmin, async (req, res) => {
    const p = req.body;
    // Basic validation: name and price are required
    if (!p.name || typeof p.name !== 'string' || !p.name.trim()) {
        return res.status(400).json({ error: 'Product name is required' });
    }
    if (p.price === undefined || p.price === null || isNaN(Number(p.price)) || Number(p.price) < 0) {
        return res.status(400).json({ error: 'Valid product price is required' });
    }
    const id = p.id || `prod_${Date.now()}`;
    try {
        const result = await db.query(
            `INSERT INTO products (id, name, category, price, discount_price, rating, stock, variants, image_name, images, description, details, description_blocks)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
            [id, p.name.trim(), p.category, Number(p.price), p.discountPrice, p.rating, p.stock, JSON.stringify(p.variants || []), p.imageName, JSON.stringify(p.images), p.description, JSON.stringify(p.details), JSON.stringify(p.descriptionBlocks)]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/products/:id', requireAdmin, async (req, res) => {
    const p = req.body;
    // Basic validation: name and price are required for updates
    if (!p.name || typeof p.name !== 'string' || !p.name.trim()) {
        return res.status(400).json({ error: 'Product name is required' });
    }
    if (p.price === undefined || p.price === null || isNaN(Number(p.price)) || Number(p.price) < 0) {
        return res.status(400).json({ error: 'Valid product price is required' });
    }
    try {
        const result = await db.query(
            `UPDATE products SET name=$1, category=$2, price=$3, discount_price=$4, rating=$5, stock=$6, variants=$7, image_name=$8, images=$9, description=$10, details=$11, description_blocks=$12
             WHERE id=$13 RETURNING *`,
            [p.name.trim(), p.category, Number(p.price), p.discountPrice, p.rating, p.stock, JSON.stringify(p.variants || []), p.imageName, JSON.stringify(p.images), p.description, JSON.stringify(p.details), JSON.stringify(p.descriptionBlocks), req.params.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: "Product not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
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
        console.log("Fetching banners...");
        const result = await db.query('SELECT * FROM banners ORDER BY id ASC');
        if (!result || !Array.isArray(result.rows)) return res.json([]);

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
        console.log("Banners fetched:", formatted.length);
        res.json(formatted);
    } catch (err) {
        console.error("BANNERS ERROR:", err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

app.put('/api/banners', requireAdmin, async (req, res) => {
    // Basic validation: body must be an array
    if (!Array.isArray(req.body)) {
        return res.status(400).json({ error: 'Banners data must be an array' });
    }
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
        console.log("Fetching media...");
        const result = await db.query('SELECT data FROM settings WHERE id=$1', ['media']);
        const media = result.rows[0]?.data || [];
        console.log("Media fetched:", media.length);
        res.json(media);
    } catch (err) {
        console.error("MEDIA ERROR:", err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

app.post('/api/media', requireAdmin, async (req, res) => {
    // Basic validation: url and name are required for media entries
    if (!req.body.url || !req.body.name) {
        return res.status(400).json({ error: 'Media url and name are required' });
    }
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
// Orders list is admin-only (customers don't browse all orders)
app.get('/api/orders', requireAdmin, async (req, res) => {
    try {
        console.log("Fetching orders...");
        const result = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
        console.log("Orders fetched:", result.rowCount || result.rows?.length || 0);
        res.json(result.rows || []);
    } catch (err) {
        console.error("ORDERS FETCH ERROR:", err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

app.post('/api/orders', async (req, res) => {
    const o = req.body;

    // Basic validation: orders need items and customer info
    if (!o.items || !Array.isArray(o.items) || o.items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    if (!o.firstName || typeof o.firstName !== 'string' || !o.firstName.trim()) {
        return res.status(400).json({ error: 'Customer first name is required' });
    }
    if (!o.email || typeof o.email !== 'string' || !o.email.trim()) {
        return res.status(400).json({ error: 'Customer email is required' });
    }

    const { idempotencyKey } = o;
    
    let client;
    try {
        client = await db.pool.connect();
        await client.query('BEGIN');

        // 1. Idempotency Check
        if (idempotencyKey) {
            const existing = await client.query('SELECT * FROM orders WHERE idempotency_key = $1', [idempotencyKey]);
            if (existing.rowCount > 0) {
                await client.query('ROLLBACK');
                return res.json(existing.rows[0]);
            }
        }

        const settingsRes = await client.query('SELECT data FROM settings WHERE id=$1', ['global']);
        const globalSettings = settingsRes.rows[0]?.data || {};
        const globalDiscountPercent = globalSettings.globalDiscount || 0;

        let serverSubtotal = 0;
        const verifiedItems = [];

        // 3. Strict Validation (Independent per item)
        for (const item of o.items) {
            console.log("ITEM:", item);
            
            const productRes = await client.query('SELECT * FROM products WHERE id = $1', [item.id]);
            const product = productRes.rows[0];
            console.log("PRODUCT:", product);

            if (!product) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: `Product not found: ${item.id}` });
            }

            if (!Array.isArray(product.variants)) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: `Invalid variants for product: ${item.id}` });
            }

            if (!item.size) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: `Missing size for ${product.name}` });
            }

            const variant = product.variants.find(
                v => v.size.toLowerCase() === item.size.toLowerCase()
            );
            
            console.log("Matched variant:", variant);

            if (!variant) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: `Variant not found: ${item.size}` });
            }

            if ((Number(variant.stock) || 0) < item.quantity) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: `Insufficient stock for size: ${item.size}` });
            }

            const serverPrice = variant.price !== undefined ? parseFloat(variant.price) : 
                              (product.discount_price ? parseFloat(product.discount_price) : parseFloat(product.price));
            
            const lineTotal = serverPrice * item.quantity;
            serverSubtotal += lineTotal;

            verifiedItems.push({
                ...item,
                unitPrice: serverPrice,
                lineTotal: lineTotal,
                price: serverPrice,
                size: variant.size
            });
        }

        // 4. Calculate Financials
        const serverDiscountAmount = (serverSubtotal * (globalDiscountPercent / 100));
        const finalSubtotal = serverSubtotal - serverDiscountAmount;
        const serverShippingCost = finalSubtotal >= 999 ? 0 : 89;
        const serverTotal = finalSubtotal + serverShippingCost;

        // 5. Create Order (Status: Payment Pending)
        const result = await client.query(
            `INSERT INTO orders (
                data, status, customer_name, customer_email, customer_phone, 
                total_amount, shipping_cost, discount_amount, items, shipping_address,
                idempotency_key
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [
                JSON.stringify({ ...o, items: verifiedItems, total: serverTotal, subtotal: serverSubtotal, discountAmount: serverDiscountAmount }), 
                'Payment Pending', 
                `${o.firstName} ${o.lastName}`, 
                o.email, 
                o.phone, 
                serverTotal, 
                serverShippingCost, 
                serverDiscountAmount, 
                JSON.stringify(verifiedItems), 
                JSON.stringify({ address: o.address, city: o.city, state: o.state, zip: o.zip }),
                idempotencyKey
            ]
        );
        
        await client.query('COMMIT');
        return res.status(201).json(result.rows[0]);
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error("ORDER CRASH:", err);
        return res.status(500).json({ message: err.message });
    } finally {
        if (client) client.release();
        if (!res.headersSent) {
            return res.status(500).json({ message: "Unhandled server error" });
        }
    }
});

// Order Confirmation (Stock Deduction Stage)
app.post('/api/orders/:id/confirm', async (req, res) => {
    const { id } = req.params;
    const { confirmationKey } = req.body;

    let client;
    try {
        client = await db.pool.connect();
        // --- 1. ATOMIC TRANSACTION START ---
        await client.query('BEGIN');

        // Fetch order with intent to update status
        const orderRes = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [id]);
        if (orderRes.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Order not found", code: 'ORDER_NOT_FOUND' });
        }

        const order = orderRes.rows[0];

        // GUARD: Confirmation Idempotency
        if (order.status === 'Confirmed' || (confirmationKey && order.confirmation_key === confirmationKey)) {
            await client.query('ROLLBACK');
            return res.json(order);
        }

        const items = order.items || [];

        // --- PHASE 1: VALIDATE ONLY ---
        for (const item of items) {
            console.log("ITEM:", item);
            const productRes = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [item.id]);
            const product = productRes.rows[0];
            console.log("PRODUCT:", product);

            if (!product) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: `Product not found: ${item.id}` });
            }

            if (!Array.isArray(product.variants)) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: `Invalid variants for product: ${item.id}` });
            }

            if (!item.size) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: `Missing size for ${product.id}` });
            }

            const variant = product.variants.find(
                v => v.size.toLowerCase() === item.size.toLowerCase()
            );
            
            console.log("Matched variant:", variant);

            if (!variant) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: `Variant not found: ${item.size}` });
            }

            if ((Number(variant.stock) || 0) < item.quantity) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: `Insufficient stock for size: ${item.size}` });
            }
        }

        // --- PHASE 2: UPDATE STOCK (After ALL validation passes) ---
        for (const item of items) {
            console.log("UPDATE ITEM:", item);
            const productRes = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [item.id]);
            const product = productRes.rows[0];
            const variants = product.variants || [];
            const variant = variants.find(v => (v.size || "").toLowerCase() === (item.size || "").toLowerCase());

            // Deduct stock
            variant.stock -= item.quantity;
            
            // Persist changes
            await client.query(
                'UPDATE products SET variants = $1 WHERE id = $2',
                [JSON.stringify(product.variants), item.id]
            );
        }

        // --- 5. UPDATE ORDER STATUS ---
        const finalResult = await client.query(
            `UPDATE orders SET status = $1, confirmation_key = $2 WHERE id = $3 RETURNING *`,
            ['Confirmed', confirmationKey, id]
        );

        // --- 6. ATOMIC TRANSACTION COMMIT ---
        await client.query('COMMIT');

        const confirmedOrder = finalResult.rows[0];
        NotificationService.notifyOrdered(confirmedOrder).catch(err => console.error("Notification fail:", err));
        
        return res.json(confirmedOrder);
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error("ORDER CRASH:", err);
        return res.status(500).json({ message: err.message });
    } finally {
        if (client) client.release();
        if (!res.headersSent) {
            return res.status(500).json({ message: "Unhandled server error" });
        }
    }
});

// Patch Order Shipping Status (admin-only)
app.patch('/api/orders/:id/ship', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { tracking_number, carrier } = req.body;

    // Basic validation: tracking_number and carrier are required
    if (!tracking_number || !carrier) {
        return res.status(400).json({ error: 'Tracking number and carrier are required' });
    }

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
        console.log("Fetching settings...");
        const result = await db.query('SELECT data FROM settings WHERE id=$1', ['global']);
        const data = result.rows[0]?.data || {};
        console.log("Settings fetched successfully");
        res.json(data);
    } catch (err) {
        console.error("SETTINGS ERROR:", err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

app.put('/api/settings', requireAdmin, async (req, res) => {
    // Basic validation: body must be a non-null object
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        return res.status(400).json({ error: 'Settings must be a valid JSON object' });
    }
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
// Upload endpoint — auth verified via clientPayload (Vercel Blob SDK doesn't send custom headers)
app.post('/api/upload', async (request, response) => {
    const body = request.body;
    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            token: process.env.BLOB_READ_WRITE_TOKEN,
            onBeforeGenerateToken: async (pathname, clientPayload) => {
                // Verify admin token passed from client via clientPayload
                if (!clientPayload || !activeAdminTokens.has(clientPayload)) {
                    throw new Error('Unauthorized: valid admin token required for uploads');
                }
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

// Admin Auth — credentials loaded from environment variables
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    // Validate required fields
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    // Check credentials from env vars (no hardcoded secrets in source code)
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        // Generate a random token for this session
        const token = crypto.randomBytes(32).toString('hex');
        activeAdminTokens.add(token);
        res.json({ authenticated: true, token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Tutu & Co Backend running on port ${PORT}`);
});
setInterval(() => {}, 1000);