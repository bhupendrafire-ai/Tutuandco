const db = require('./db');

const migrateVariantPrices = async () => {
    console.log('🚀 Starting Variant Price Migration...');

    try {
        // 1. Fetch all products with variants
        const result = await db.query('SELECT id, price, variants FROM products');
        const products = result.rows;

        console.log(`📦 Found ${products.length} products to process.`);

        let updatedCount = 0;

        for (const product of products) {
            let variants = product.variants || [];
            if (!Array.isArray(variants)) {
                console.warn(`⚠️ Product ${product.id} has invalid variants format. Skipping.`);
                continue;
            }

            let needsUpdate = false;
            const updatedVariants = variants.map(v => {
                // Only set price if it does not already exist OR is 0 (assumed uninitialized)
                if (v.price === undefined || v.price === null || v.price === 0) {
                    needsUpdate = true;
                    return { ...v, price: parseFloat(product.price) };
                }
                return v;
            });

            if (needsUpdate) {
                await db.query(
                    'UPDATE products SET variants = $1 WHERE id = $2',
                    [JSON.stringify(updatedVariants), product.id]
                );
                updatedCount++;
            }
        }

        console.log(`✅ Migration complete. Updated ${updatedCount} products.`);
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await db.pool.end();
    }
};

migrateVariantPrices();
