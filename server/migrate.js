const db = require('./db');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

const migrate = async () => {
    console.log('🚀 Starting PostgreSQL Migration...');

    try {
        // 1. Create Tables
        await db.query(`
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT,
                price DECIMAL NOT NULL,
                discount_price DECIMAL,
                rating DECIMAL,
                stock INTEGER,
                image_name TEXT,
                images JSONB,
                description TEXT,
                details JSONB,
                description_blocks JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS banners (
                id SERIAL PRIMARY KEY,
                title TEXT,
                subtitle TEXT,
                cta TEXT,
                image TEXT
            );

            CREATE TABLE IF NOT EXISTS settings (
                id TEXT PRIMARY KEY,
                data JSONB NOT NULL
            );

            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                data JSONB NOT NULL,
                status TEXT DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                product_id TEXT,
                data JSONB NOT NULL,
                date DATE DEFAULT CURRENT_DATE
            );
        `);
        console.log('✅ Tables created or already exist.');

        // 2. Import Data from JSON if tables are empty
        if (fs.existsSync(DATA_FILE)) {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

            // Check if products already exist
            const productCheck = await db.query('SELECT COUNT(*) FROM products');
            if (parseInt(productCheck.rows[0].count) === 0) {
                console.log('📦 Importing products...');
                for (const p of data.products) {
                    await db.query(
                        `INSERT INTO products (id, name, category, price, discount_price, rating, stock, image_name, images, description, details, description_blocks)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                        [p.id, p.name, p.category, p.price, p.discountPrice, p.rating, p.stock, p.imageName, JSON.stringify(p.images), p.description, JSON.stringify(p.details), JSON.stringify(p.descriptionBlocks)]
                    );
                }
            }

            // Banners
            const bannerCheck = await db.query('SELECT COUNT(*) FROM banners');
            if (parseInt(bannerCheck.rows[0].count) === 0) {
                console.log('🖼️ Importing banners...');
                for (const b of data.banners) {
                    await db.query(
                        `INSERT INTO banners (title, subtitle, cta, image) VALUES ($1, $2, $3, $4)`,
                        [b.title, b.subtitle, b.cta, b.image]
                    );
                }
            }

            // Settings
            const settingsCheck = await db.query('SELECT COUNT(*) FROM settings');
            if (parseInt(settingsCheck.rows[0].count) === 0) {
                console.log('⚙️ Importing settings...');
                await db.query(
                    `INSERT INTO settings (id, data) VALUES ($1, $2)`,
                    ['global', JSON.stringify(data.settings)]
                );
            }

            console.log('🎉 Migration successful!');
        } else {
            console.log('⚠️ No data.json found, skipped data import.');
        }

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await db.pool.end();
    }
};

migrate();
