const db = require('./db');

const migrateVariantIds = async () => {
    console.log('🚀 Starting Variant Identity Migration...');

    try {
        const result = await db.query('SELECT id, variants FROM products');
        const products = result.rows;

        console.log(`📦 Processing ${products.length} products...`);

        let updatedCount = 0;

        for (const product of products) {
            let variants = product.variants || [];
            if (!Array.isArray(variants)) continue;

            let needsUpdate = false;
            const updatedVariants = variants.map(v => {
                if (!v.id) {
                    needsUpdate = true;
                    // Generate a unique short ID for the variant
                    const variantId = `v_${Math.random().toString(36).substring(2, 7)}`;
                    return { ...v, id: variantId };
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

        console.log(`✅ Migration complete. Updated ${updatedCount} products with variant IDs.`);
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await db.pool.end();
    }
};

migrateVariantIds();
