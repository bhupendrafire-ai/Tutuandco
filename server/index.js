const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { handleUpload } = require('@vercel/blob/client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Initial Data Structure
const initialData = {
    products: [
        { id: 1, name: "The Blue Bandana", category: "Apparel", price: 12.00, rating: 5, imageName: "IMG_6135", description: "Premium organic cotton bandana in a deep sky blue." },
        { id: 2, name: "Terracotta Harness", category: "Safety", price: 45.00, rating: 5, imageName: "IMG_6137", description: "Durable and stylish harness for daily adventures." },
        { id: 3, name: "Sage Walking Set", category: "Safety", price: 89.00, rating: 5, imageName: "IMG_6144", description: "Complete set with leash and harness in our signature sage." }
    ],
    banners: [
        { id: 1, title: "Organic & Premium Comfort", subtitle: "Eco-friendly apparel for your best friends.", cta: "Shop the Collection", image: "IMG_6135" },
        { id: 2, title: "MVP: The Signature Harness", subtitle: "Durable, stylish, and pet-approved.", cta: "View MVP Items", image: "IMG_6137" },
        { id: 3, title: "New Arrivals: Sage Collection", subtitle: "Minimalist designs in our favorite hues.", cta: "Expose Style", image: "IMG_6144" }
    ],
    media: [],
    orders: [],
    reviews: []
};

// Helper to read data
const readData = () => {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
};

// Helper to write data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// --- API ROUTES ---

// Products
app.get('/api/products', (req, res) => {
    const data = readData();
    res.json(data.products);
});

app.post('/api/products', (req, res) => {
    const data = readData();
    const newProduct = { ...req.body, id: Date.now() };
    data.products.push(newProduct);
    writeData(data);
    res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
    const data = readData();
    const index = data.products.findIndex(p => p.id == req.params.id);
    if (index !== -1) {
        data.products[index] = { ...data.products[index], ...req.body };
        writeData(data);
        res.json(data.products[index]);
    } else {
        res.status(404).json({ error: "Product not found" });
    }
});

app.delete('/api/products/:id', (req, res) => {
    const data = readData();
    data.products = data.products.filter(p => p.id != req.params.id);
    writeData(data);
    res.status(204).send();
});

// Banners
app.get('/api/banners', (req, res) => {
    const data = readData();
    res.json(data.banners);
});

app.put('/api/banners', (req, res) => {
    const data = readData();
    data.banners = req.body;
    writeData(data);
    res.json(data.banners);
});

// Media
app.get('/api/media', (req, res) => {
    const data = readData();
    res.json(data.media);
});

app.post('/api/media', (req, res) => {
    const data = readData();
    const newMedia = { ...req.body, id: Date.now() };
    data.media.push(newMedia);
    writeData(data);
    res.status(201).json(newMedia);
});

// Orders
app.get('/api/orders', (req, res) => {
    const data = readData();
    res.json(data.orders);
});

app.post('/api/orders', (req, res) => {
    const data = readData();
    const newOrder = { ...req.body, id: Date.now(), status: 'Pending' };
    data.orders.push(newOrder);
    writeData(data);
    res.status(201).json(newOrder);
});

// Vercel Blob Signature Route
app.post('/api/upload', async (request, response) => {
    const body = request.body;
    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname) => {
                // In a real app, verify admin session here
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
app.get('/api/reviews/:productId', (req, res) => {
    const data = readData();
    const productReviews = data.reviews.filter(r => r.productId == req.params.productId);
    res.json(productReviews);
});

app.post('/api/reviews', (req, res) => {
    const data = readData();
    const newReview = { ...req.body, id: Date.now(), date: new Date().toISOString().split('T')[0] };
    data.reviews.push(newReview);
    writeData(data);
    res.status(201).json(newReview);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Tutu & Co Backend running on port ${PORT}`);
});
