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
                variants JSONB DEFAULT '[]',
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
                image TEXT,
                content_position TEXT DEFAULT 'center',
                focal_point JSONB DEFAULT '{"x": 50, "y": 50}',
                fit_mode TEXT DEFAULT 'cover'
            );

            CREATE TABLE IF NOT EXISTS settings (
                id TEXT PRIMARY KEY,
                data JSONB NOT NULL
            );

            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                data JSONB NOT NULL,
                status TEXT DEFAULT 'Pending',
                customer_name TEXT,
                customer_email TEXT,
                customer_phone TEXT,
                total_amount DECIMAL DEFAULT 0,
                shipping_cost DECIMAL DEFAULT 0,
                discount_amount DECIMAL DEFAULT 0,
                items JSONB,
                shipping_address JSONB,
                tracking_number TEXT,
                carrier TEXT,
                shipped_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                product_id TEXT,
                data JSONB NOT NULL,
                date DATE DEFAULT CURRENT_DATE
            );

            -- Ensure banner columns exist for existing tables
            ALTER TABLE banners ADD COLUMN IF NOT EXISTS content_position TEXT DEFAULT 'center';
            ALTER TABLE banners ADD COLUMN IF NOT EXISTS focal_point JSONB DEFAULT '{"x": 50, "y": 50}';
            ALTER TABLE banners ADD COLUMN IF NOT EXISTS fit_mode TEXT DEFAULT 'cover';

            -- Ensure new order columns exist for existing tables
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL DEFAULT 0;
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL DEFAULT 0;
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL DEFAULT 0;
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB;
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier TEXT;
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP;

            -- Phase 2: Variant System Migration
            ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]';
            
            -- Initialize variants for products that have stock but no variants
            UPDATE products 
            SET variants = jsonb_build_array(jsonb_build_object('size', 'Standard', 'stock', stock))
            WHERE (variants IS NULL OR jsonb_array_length(variants) = 0) AND stock > 0;
        `);
        console.log('✅ Tables created or already exist.');

        // 2. Import Data from JSON if tables are empty
        if (fs.existsSync(DATA_FILE)) {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

            // Sync products from JSON
            console.log('📦 Synchronizing products...');
            for (const p of data.products) {
                await db.query(
                    `INSERT INTO products (id, name, category, price, discount_price, rating, stock, variants, image_name, images, description, details, description_blocks)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                     ON CONFLICT (id) DO UPDATE SET 
                        name = EXCLUDED.name,
                        category = EXCLUDED.category,
                        price = EXCLUDED.price,
                        discount_price = EXCLUDED.discount_price,
                        rating = EXCLUDED.rating,
                        stock = EXCLUDED.stock,
                        variants = COALESCE(products.variants, EXCLUDED.variants),
                        image_name = EXCLUDED.image_name,
                        images = EXCLUDED.images,
                        description = EXCLUDED.description,
                        details = EXCLUDED.details,
                        description_blocks = EXCLUDED.description_blocks`,
                    [p.id, p.name, p.category, p.price, p.discountPrice, p.rating, p.stock, JSON.stringify(p.variants || [{size: 'Standard', stock: p.stock}]), p.imageName, JSON.stringify(p.images), p.description, JSON.stringify(p.details), JSON.stringify(p.descriptionBlocks)]
                );
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
            // Sync settings
            if (data.settings) {
                console.log('⚙️ Synchronizing global settings...');
                const globalData = {
                    ...data.settings.global,
                    carriers: data.settings.global?.carriers || ["FedEx", "Delhivery", "BlueDart", "DTDC"]
                };
                await db.query(
                    'INSERT INTO settings (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
                    ['global', JSON.stringify(globalData)]
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
