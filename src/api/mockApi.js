
// Mock API Service for TutuAndCo
// This service simulates backend calls using localStorage for persistence.
// It is designed to be easily replaced with real fetch calls.

const STORAGE_KEYS = {
    PRODUCTS: 'tutu_products',
    ORDERS: 'tutu_orders',
    REVIEWS: 'tutu_reviews',
    BLOGS: 'tutu_blogs',
    COUPONS: 'tutu_coupons',
    TESTIMONIALS: 'tutu_testimonials',
    MOMENTS: 'tutu_moments',
    BANNERS: 'tutu_banners',
    MEDIA: 'tutu_media'
};

const getInitialBanners = () => [
    {
        id: 1,
        title: "Organic & Premium Comfort",
        subtitle: "Eco-friendly apparel for your best friends.",
        cta: "Shop the Collection",
        image: 'IMG_6135',
        color: "bg-[#8C916C]"
    },
    {
        id: 2,
        title: "MVP: The Signature Harness",
        subtitle: "Durable, stylish, and pet-approved.",
        cta: "View MVP Items",
        image: 'IMG_6137',
        color: "bg-[#95714F]"
    },
    {
        id: 3,
        title: "New Arrivals: Sage Collection",
        subtitle: "Minimalist designs in our favorite hues.",
        cta: "Expose Style",
        image: 'IMG_6144',
        color: "bg-[#ACB087]"
    }
];

const delay = (ms = 500) => new Promise(res => setTimeout(res, ms));

const getInitialProducts = () => {
    // We would ideally import images here, but for the API level, we'll use IDs 
    // and let the frontend map them to assets or provide the paths.
    return [
        { 
            id: "orange", 
            name: "Sunset Sage Bandana", 
            price: 28.00, 
            stock: 15,
            rating: 5, 
            category: "The Orange Collection",
            description: "A vibrant burst of autumn hues, the Sunset Sage Bandana features an intricate earthy pattern.",
            details: ["100% Organic Cotton", "Hand-stitched in small batches"],
            imageName: 'IMG_6154'
        },
        { 
            id: "pink", 
            name: "Blossom Heart Bandana", 
            price: 32.00, 
            stock: 8,
            rating: 5, 
            category: "The Pink Collection",
            description: "Soft, sweet, and perfectly charming. This pink checkered bandana is adorned with delicate white hearts.",
            details: ["Premium Linen Blend", "Signature Heart Pattern"],
            imageName: 'IMG_6169'
        },
        { 
            id: "blue", 
            name: "Azure Adventure Bandana", 
            price: 35.00, 
            stock: 20,
            rating: 5, 
            category: "The Blue Collection",
            description: "Deep azure tones meet modern geometric patterns. Built for durability and style.",
            details: ["Utility Grade Fabric", "Reflective Accents"],
            imageName: 'IMG_6214'
        },
        { 
            id: "nano-banana", 
            name: "The Nano Banana", 
            price: 30.00, 
            stock: 12,
            rating: 5, 
            category: "Limited Edition",
            description: "A quirky and minimalist take on the classic banana print.",
            details: ["Custom Illustration Print", "Eco-Friendly Dyes"],
            imageName: 'nano_banana'
        }
    ];
};

const getInitialBlogs = () => [
    {
        id: '1',
        title: 'Training Your Pet for the Outdoors',
        excerpt: 'Tips and tricks for a happy adventure dog. From lead training to environmental awareness.',
        content: `Training your pet for outdoor adventures is a journey of patience and rewards. Start with short walks in familiar territory, gradually introducing more stimulant-rich environments. The key is to ensure they are comfortable with their gear. Our Utility Grade bandanas and harnesses are designed to provide that comfort without restricting movement. 
        
        Always keep a steady supply of treats and hydration. Environmental awareness is also crucial—always check the terrain and weather conditions before heading out for a long hike. Your pet's safety is the priority.`,
        date: 'March 10, 2024',
        author: 'Sarah J.',
        imageName: 'IMG_6144'
    },
    {
        id: '2',
        title: 'Why Organic Cotton Matters for Pets',
        excerpt: 'Understanding the benefits of natural fabrics over synthetic alternatives for skin health.',
        content: `Natural fibers like organic cotton and linen aren't just a luxury—they're a choice for your pet's wellness. Synthetic fabrics can often trap heat and cause skin irritations, especially in pets with sensitive skin or thick fur. 
        
        Organic cotton allows the skin to breathe, regulating body temperature naturally across seasons. At Tutu & Co, we source only the finest organic materials to ensure that every piece that touches your pet's skin is free from harsh chemicals and synthetic dyes. Softness meets sustainability in every stitch.`,
        date: 'March 15, 2024',
        author: 'Mark T.',
        imageName: 'IMG_6135'
    }
];

const mockApi = {
    // Generic local storage helpers
    _get: (key, initialValue) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : initialValue;
    },
    _set: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
        return value;
    },

    // Products & Inventory
    getProducts: async () => {
        await delay();
        return mockApi._get(STORAGE_KEYS.PRODUCTS, getInitialProducts());
    },
    updateProduct: async (id, updates) => {
        await delay();
        const products = await mockApi.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index > -1) {
            products[index] = { ...products[index], ...updates };
            mockApi._set(STORAGE_KEYS.PRODUCTS, products);
            return products[index];
        }
        throw new Error('Product not found');
    },
    addProduct: async (product) => {
        await delay();
        const products = await mockApi.getProducts();
        const newProduct = { ...product, id: product.id || `P-${Date.now()}` };
        products.push(newProduct);
        mockApi._set(STORAGE_KEYS.PRODUCTS, products);
        return newProduct;
    },
    deleteProduct: async (id) => {
        await delay();
        const products = await mockApi.getProducts();
        const filtered = products.filter(p => p.id !== id);
        mockApi._set(STORAGE_KEYS.PRODUCTS, filtered);
        return true;
    },

    // Banners
    getBanners: async () => {
        await delay();
        return mockApi._get(STORAGE_KEYS.BANNERS, getInitialBanners());
    },
    updateBanners: async (banners) => {
        await delay();
        return mockApi._set(STORAGE_KEYS.BANNERS, banners);
    },

    // Media Library
    getMedia: async () => {
        await delay();
        return mockApi._get(STORAGE_KEYS.MEDIA, []);
    },
    uploadMedia: async (base64, name) => {
        await delay();
        const media = await mockApi.getMedia();
        const newMedia = { id: Date.now(), name, url: base64 };
        media.push(newMedia);
        mockApi._set(STORAGE_KEYS.MEDIA, media);
        return newMedia;
    },

    // Orders & Trends
    getOrders: async () => {
        await delay();
        return mockApi._get(STORAGE_KEYS.ORDERS, []);
    },
    placeOrder: async (order) => {
        await delay();
        const orders = await mockApi.getOrders();
        const newOrder = { 
            ...order, 
            id: `ORD-${Date.now()}`, 
            createdAt: new Date().toISOString(),
            status: 'Processing' 
        };
        orders.push(newOrder);
        mockApi._set(STORAGE_KEYS.ORDERS, orders);

        // Update Inventory
        const products = await mockApi.getProducts();
        order.items.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) product.stock -= item.quantity;
        });
        mockApi._set(STORAGE_KEYS.PRODUCTS, products);

        return newOrder;
    },

    // Reviews
    getReviews: async (productId) => {
        await delay();
        const allReviews = mockApi._get(STORAGE_KEYS.REVIEWS, []);
        return productId ? allReviews.filter(r => r.productId === productId) : allReviews;
    },
    addReview: async (review) => {
        await delay();
        const reviews = mockApi._get(STORAGE_KEYS.REVIEWS, []);
        const newReview = { ...review, id: Date.now(), createdAt: new Date().toISOString() };
        reviews.push(newReview);
        mockApi._set(STORAGE_KEYS.REVIEWS, reviews);

        // Update Product Rating
        const productReviews = reviews.filter(r => r.productId === review.productId);
        const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
        await mockApi.updateProduct(review.productId, { rating: avgRating });

        return newReview;
    },

    // Coupons
    getCoupons: async () => {
        await delay();
        return mockApi._get(STORAGE_KEYS.COUPONS, [
            { code: 'TUTU10', discount: 0.10, minSpend: 500 },
            { code: 'WELCOME20', discount: 0.20, minSpend: 1500 }
        ]);
    },

    // Blogs
    getBlogs: async () => {
        await delay();
        return mockApi._get(STORAGE_KEYS.BLOGS, getInitialBlogs());
    },

    // Testimonials (Admin pushed)
    getTestimonials: async () => {
        await delay();
        return mockApi._get(STORAGE_KEYS.TESTIMONIALS, [
            { id: 1, name: 'Jessica Miller', text: 'The Azure bandana is so soft!', status: 'Published' }
        ]);
    },

    // Moments (User photos)
    getMoments: async () => {
        await delay();
        return mockApi._get(STORAGE_KEYS.MOMENTS, [
            { id: 1, imageUrl: 'IMG_6197', petName: 'Luna', approved: true }
        ]);
    },
    uploadMoment: async (moment) => {
        await delay();
        const moments = await mockApi.getMoments();
        const newMoment = { ...moment, id: Date.now(), approved: false }; // Staff approval required
        moments.push(newMoment);
        mockApi._set(STORAGE_KEYS.MOMENTS, moments);
        return newMoment;
    }
};

export default mockApi;
