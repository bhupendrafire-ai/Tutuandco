const db = require('./db');

const migrateBanners = async () => {
    console.log('🚀 Updating Banners Table Schema...');
    try {
        await db.query(`
            ALTER TABLE banners ADD COLUMN IF NOT EXISTS content_position TEXT DEFAULT 'center';
            ALTER TABLE banners ADD COLUMN IF NOT EXISTS focal_point JSONB DEFAULT '{"x": 50, "y": 50}';
            ALTER TABLE banners ADD COLUMN IF NOT EXISTS fit_mode TEXT DEFAULT 'cover';
        `);
        console.log('✅ Banners table updated successfully.');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        await db.pool.end();
    }
};

migrateBanners();
