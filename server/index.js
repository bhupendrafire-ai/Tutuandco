const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { handleUpload } = require('@vercel/blob/client');
const db = require('./db');
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
            `INSERT INTO products (id, name, category, price, discount_price, rating, stock, image_name, images, description, details, description_blocks)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [id, p.name, p.category, p.price, p.discountPrice, p.rating, p.stock, p.imageName, JSON.stringify(p.images), p.description, JSON.stringify(p.details), JSON.stringify(p.descriptionBlocks)]
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
            `UPDATE products SET name=$1, category=$2, price=$3, discount_price=$4, rating=$5, stock=$6, image_name=$7, images=$8, description=$9, details=$10, description_blocks=$11
             WHERE id=$12 RETURNING *`,
            [p.name, p.category, p.price, p.discountPrice, p.rating, p.stock, p.imageName, JSON.stringify(p.images), p.description, JSON.stringify(p.details), JSON.stringify(p.descriptionBlocks), req.params.id]
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
            fitMode: b.fit_mode || 'cover'
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
                'INSERT INTO banners (title, subtitle, cta, image, content_position, focal_point, fit_mode) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [b.title, b.subtitle, b.cta, b.image, b.contentPosition || 'center', JSON.stringify(b.focalPoint || {x: 50, y: 50}), b.fitMode || 'cover']
            );
        }
        const result = await db.query('SELECT * FROM banners ORDER BY id ASC');
        const formatted = result.rows.map(b => ({
            ...b,
            contentPosition: b.content_position || 'center',
            focalPoint: b.focal_point || { x: 50, y: 50 },
            fitMode: b.fit_mode || 'cover'
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
    try {
        const result = await db.query(
            'INSERT INTO orders (data, status) VALUES ($1, $2) RETURNING *',
            [JSON.stringify(req.body), 'Pending']
        );
        res.status(201).json(result.rows[0]);
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

// Start Server
app.listen(PORT, () => {
    console.log(`Tutu & Co Backend running on port ${PORT}`);
});
