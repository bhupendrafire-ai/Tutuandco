import React, { createContext, useContext, useState, useEffect } from 'react';
import { FINAL_API_URL, getAdminHeaders } from './apiConfig';
import { ProductProvider, ProductContext } from './ProductContext';
import { CartProvider, CartContext } from './CartContext';

// Re-export FINAL_API_URL for backward compatibility (many components import it from here)
export { FINAL_API_URL } from './apiConfig';

// Centralized Policy Defaults (Source of Truth for Fallbacks)
export const POLICY_DEFAULTS = {
    shipping: { 
        id: 'shipping',
        slug: 'shipping',
        title: 'Shipping Policy', 
        navLabel: 'Shipping Info',
        content: `<p>All orders are processed within 1–3 business days. Since each piece is carefully prepared, slight delays during high-demand periods may occur.</p>
<p>Once dispatched, orders typically arrive within:</p>
<ul>
  <li><strong>2–5 business days</strong> for metro cities</li>
  <li><strong>3–7 business days</strong> for other locations</li>
</ul>
<p>Delivery timelines may vary depending on your location and courier partner.</p>
<p>Shipping charges (if applicable) will be calculated at checkout.</p>
<p>Once your order is shipped, you'll receive a tracking link via email or SMS to follow its journey.</p>
<p>While we work with reliable delivery partners, delays can occasionally happen due to factors beyond our control. If your order is significantly delayed, feel free to reach out to us at <strong>hello.tutuandco@gmail.com</strong>.</p>
<p>Please ensure your shipping details are accurate at checkout. We are not responsible for delays or failed deliveries due to incorrect information.</p>`
    },
    returns: { 
        id: 'returns',
        slug: 'returns',
        title: 'Refund & Cancellation Policy', 
        navLabel: 'Refunds & Cancellations',
        content: `<p>As a small, made-with-care brand, we currently do not offer returns or refunds, unless the item received is damaged or incorrect.</p>
<p><strong>To be eligible for exchange:</strong></p>
<ul>
  <li>The product must be unused, unwashed, and in original condition</li>
  <li>Free from pet hair, odour, or any signs of wear</li>
  <li>All tags and packaging must be intact</li>
  </ul>
<p>Please note: Exchange shipping costs are to be borne by the customer. Check our size guide carefully before purchase for the best fit.</p>
<p>If you receive a damaged or wrong item, please contact us within 48 hours of delivery with photos, and we'll make it right.</p>
<p><strong>Exchange process:</strong> Once your request is approved, the product will need to be shipped back to us. The replacement will be processed after a quality check.</p>
<p>Each piece is handmade, so slight variations are natural and not considered defects.</p>`
    },
    privacy: { 
        id: 'privacy',
        slug: 'privacy',
        title: 'Privacy Policy', 
        navLabel: 'Privacy Policy',
        content: `<p><strong>1. Information We Collect</strong></p>
<p>We collect personal information that you voluntarily provide to us when you place an order, sign up for our newsletter, or contact us. This may include your name, email address, phone number, shipping and billing address, and payment details.</p>
<p><strong>2. How We Use Your Information</strong></p>
<ul>
  <li>Process and fulfill your orders</li>
  <li>Communicate with you regarding your purchases or inquiries</li>
  <li>Provide customer support</li>
  <li>Send updates, offers, or newsletters (only if you opt in)</li>
</ul>
<p>We only use your information for purposes that improve your experience with our brand.</p>
<p><strong>3. Information Sharing</strong></p>
<p>We respect your privacy. Your personal information is never sold, traded, or rented to third parties. We may share necessary details with trusted partners (payment processors, delivery services) strictly to fulfill your orders.</p>
<p><strong>4. Data Security</strong></p>
<p>We take appropriate measures to protect your personal information. All payment transactions are processed through secure, encrypted gateways.</p>
<p><strong>5. Cookies</strong></p>
<p>Our website uses cookies to enhance your browsing experience. These help us understand how you interact with our site and improve functionality.</p>`
    },
    terms: {
        id: 'terms',
        slug: 'terms',
        title: 'Terms & Conditions',
        navLabel: 'Terms & Conditions',
        content: `<p><strong>1. Introduction</strong></p>
<p>Welcome to Tutu & Co. By accessing our website and purchasing our products, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.</p>
<p><strong>2. Use of the Website</strong></p>
<p>This website is provided for your personal, non-commercial use. You may not use this site for any purpose that is unlawful or prohibited by these terms.</p>
<p><strong>3. Product Information</strong></p>
<p>We strive to provide accurate descriptions and images of our products. However, due to the handmade nature of our items and variations in screen displays, slight differences may occur. Prices and availability are subject to change without notice.</p>
<p><strong>4. Orders & Payments</strong></p>
<p>All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order. Payments are processed securely through our authorized payment gateways.</p>
<p><strong>5. Intellectual Property</strong></p>
<p>All content on this website, including designs, text, and images, is the property of Tutu & Co and is protected by copyright and intellectual property laws.</p>
<p><strong>6. Limitation of Liability</strong></p>
<p>Tutu & Co shall not be liable for any direct, indirect, or consequential damages resulting from the use of our products or website.</p>`
    },
    sizing_guide: {
        id: 'sizing_guide',
        slug: 'sizing',
        title: 'Sizing Guide',
        navLabel: 'Sizing Help',
        content: `<h2>Measurement Guide</h2>
<p>To ensure the perfect fit for your companion, please refer to our measurement chart below. We recommend measuring your pet while they are standing.</p>
<table>
    <thead>
        <tr>
            <th>Size</th>
            <th>Neck (cm)</th>
            <th>Length (cm)</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Small</td>
            <td>20-30</td>
            <td>15</td>
        </tr>
        <tr>
            <td>Medium</td>
            <td>30-40</td>
            <td>20</td>
        </tr>
    </tbody>
</table>
<p><em>Note: If your pet's measurements fall between two sizes, we recommend choosing the larger size for comfort.</em></p>`
    }
};

// Kept for backward compatibility but derived from new source
export const DEFAULT_POLICIES = Object.keys(POLICY_DEFAULTS).reduce((acc, key) => {
    acc[key] = POLICY_DEFAULTS[key].content;
    return acc;
}, { refund: POLICY_DEFAULTS.returns.content });

export const CORE_POLICY_METADATA = Object.values(POLICY_DEFAULTS).map(p => ({
    id: p.id,
    slug: p.slug,
    defaultTitle: p.title
}));

/**
 * Resolves a policy's display label using a single source of truth:
 * 1. Settings object navLabel/title
 * 2. System hardcoded defaults
 */
export const resolvePolicyLabel = (key, settings) => {
    const policy = settings?.policies?.[key];

    // Temporary debug safeguard 
    console.log("Resolved Label:", key, policy?.navLabel || policy?.title || POLICY_DEFAULTS[key]?.navLabel || POLICY_DEFAULTS[key]?.title || "Policy");

    return (
        policy?.navLabel ||
        policy?.title ||
        POLICY_DEFAULTS[key]?.navLabel ||
        POLICY_DEFAULTS[key]?.title ||
        "Policy"
    );
};

/**
 * processDualUnits(html)
 * Post-processes HTML to insert Inch columns for CM values.
 * Result: Separate columns (Size | Neck (cm) | Neck (inches))
 */
export const processDualUnits = (html) => {
    if (!html) return "";
    const temp = document.createElement('div');
    temp.innerHTML = html;

    const tables = temp.querySelectorAll('table');
    tables.forEach(table => {
        const rows = Array.from(table.querySelectorAll('tr'));
        if (rows.length === 0) return;

        const headerRow = rows[0];
        const headers = Array.from(headerRow.querySelectorAll('th, td'));
        const headerTexts = headers.map(h => h.innerText.toLowerCase());
        
        // Find CM columns that don't already have an adjacent Inch column
        const cmColumns = [];
        headerTexts.forEach((text, i) => {
            if (text.includes('(cm)')) {
                const nextText = headerTexts[i + 1] || "";
                if (!nextText.includes('inch')) {
                    cmColumns.push(i);
                }
            }
        });

        if (cmColumns.length === 0) return;

        // Process in reverse to avoid index shifting when inserting after
        cmColumns.reverse().forEach(idx => {
            // 1. Insert header cell
            const headerCell = headers[idx];
            const newHeader = document.createElement(headerCell.tagName);
            newHeader.innerText = headerCell.innerText.replace('(cm)', '(inches)');
            headerCell.after(newHeader);

            // 2. Insert data cells for each row
            rows.slice(1).forEach(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                const cell = cells[idx];
                if (cell) {
                    const text = cell.innerText.trim();
                    const rangeMatch = text.match(/^(\d+)\s*-\s*(\d+)$/);
                    let inchVal = "-";
                    
                    if (rangeMatch) {
                        const low = Math.round(parseFloat(rangeMatch[1]) * 0.393701);
                        const high = Math.round(parseFloat(rangeMatch[2]) * 0.393701);
                        inchVal = `${low}-${high}`;
                    } else {
                        const val = parseFloat(text);
                        if (!isNaN(val)) {
                            inchVal = Math.round(val * 0.393701).toString();
                        } else if (text === "-" || text === "") {
                            inchVal = "-";
                        }
                    }
                    
                    const newCell = document.createElement('td');
                    newCell.innerText = inchVal;
                    cell.after(newCell);
                }
            });
        });
    });

    return temp.innerHTML;
};

/**
 * htmlToReadableText(html)
 * Converts HTML to clean text for Chatbot with Dual Unit Support.
 * Intelligently combines separate CM and Inch columns for conversational flow.
 */
export const htmlToReadableText = (html) => {
    if (!html) return "";
    const temp = document.createElement('div');
    temp.innerHTML = html;

    const tables = temp.querySelectorAll('table');
    tables.forEach(table => {
        let tableText = "\n";
        const rows = Array.from(table.querySelectorAll('tr'));
        if (rows.length === 0) return;

        const headerTexts = Array.from(rows[0].querySelectorAll('th, td')).map(h => h.innerText.toLowerCase());
        
        // Find adjacent CM/Inch column pairs to combine
        const combineIndices = [];
        headerTexts.forEach((text, i) => {
            if (text.includes('(cm)')) {
                const nextText = headerTexts[i + 1] || "";
                if (nextText.includes('inch')) {
                    combineIndices.push(i);
                }
            }
        });

        // Convert each data row to text
        rows.slice(1).forEach(row => {
            const allCells = Array.from(row.querySelectorAll('td'));
            const cellsToKeep = [];
            
            allCells.forEach((cell, i) => {
                const text = cell.innerText.trim();
                // If this is a CM column that should be combined with the next
                if (combineIndices.includes(i)) {
                    const inchCell = allCells[i + 1];
                    if (inchCell) {
                        const inchText = inchCell.innerText.trim();
                        cellsToKeep.push(`${text} cm (${inchText} inches)`);
                    } else {
                        cellsToKeep.push(`${text} cm`);
                    }
                } 
                // If this is an Inch column that was just combined, skip it
                else if (combineIndices.includes(i - 1)) {
                    // skip
                } 
                else {
                    cellsToKeep.push(text);
                }
            });

            if (cellsToKeep.length > 0) {
                tableText += cellsToKeep.join(': ') + "\n";
            }
        });

        table.replaceWith(document.createTextNode(tableText));
    });

    return temp.innerText.trim().replace(/\n\s*\n/g, '\n\n');
};

// --- Core Shop Context (banners, media, settings, orders, loading) ---
const ShopCoreContext = createContext();

/**
 * useShop — unified facade hook
 * Merges core shop state, product state, and cart state into a single object.
 * All existing consumers continue to work without any changes.
 */
export const useShop = () => {
    const core = useContext(ShopCoreContext);
    const productCtx = useContext(ProductContext);
    const cartCtx = useContext(CartContext);
    if (!core) throw new Error("useShop must be used within a ShopProvider");
    return { ...core, ...productCtx, ...cartCtx };
};

/**
 * usePolicy(key)
 * Optimized hook for consuming policy data with minimal re-renders.
 */
export const usePolicy = (key) => {
    const { settings, loading } = useShop();
    const policy = settings?.policies?.[key];
    return {
        policy,
        loading,
        exists: !!policy
    };
};

// Image Mapper - Resolves imageName from API to actual asset
const imageModules = import.meta.glob('../assets/heroshots/*.{jpg,png,jpeg}', { eager: true });
// Helper to find image by part of name
export const getProductImage = (namePart, customMedia = []) => {
    const segment = String(namePart || '');
    if (!segment) return '';
    
    // Check if it's already a full URL (Vercel Blob)
    if (segment.startsWith('http')) return segment;

    // Check custom media first (uploaded via CMS)
    const safeMedia = Array.isArray(customMedia) ? customMedia : [];
    const uploaded = safeMedia.find(m => m.name === segment || m.url === segment);
    if (uploaded) return uploaded.url;

    // Build resolution pool from local assets
    const images = Object.values(imageModules)
        .map(m => m.default)
        .filter(img => typeof img === 'string');

    if (images.length === 0) return '';

    const found = images.find(img => img.includes(segment));
    if (found) return found;

    // Last resort fallback: Stable fallback based on name hash
    try {
        const index = Math.abs(segment.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)) % images.length;
        return images[index] || images[0];
    } catch (e) {
        return images[0] || '';
    }
};

export const formatPrice = (amount, settings) => {
    const val = Number(amount) || 0;
    if (!settings || !settings.currency) return `₹${val.toFixed(2)}`;
    const { symbol, rate } = settings.currency;
    const safeRate = Number(rate) || 1;
    return `${symbol || '₹'}${(val * safeRate).toFixed(2)}`;
};

/**
 * ShopProvider — orchestrator
 * Manages banners, media, settings, orders, and loading state.
 * Wraps ProductProvider and CartProvider to compose the full context tree.
 */
export const ShopProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [media, setMedia] = useState([]);
    const [settings, setSettings] = useState({
        currency: { code: 'INR', symbol: '₹', rate: 1 },
        globalDiscount: 0,
        shopName: 'Tutu & Co',
        categories: ['Accessories', 'Toys', 'Beds'],
        policies: {}, // Hardened normalized structure
        customPolicies: []
    });
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    // Central data loader — fetches all data from the API
    const loadData = async () => {
        if (!FINAL_API_URL) {
            console.error("API_URL is not configured for this environment.");
            setLoading(false);
            return;
        }

        try {
            // Fetch public data (accessible to all users)
            const publicFetches = [
                fetch(`${FINAL_API_URL}/api/products`),
                fetch(`${FINAL_API_URL}/api/banners`),
                fetch(`${FINAL_API_URL}/api/media`),
                fetch(`${FINAL_API_URL}/api/settings`)
            ];

            // Orders are admin-only — only fetch when admin token exists
            const adminToken = sessionStorage.getItem('adminToken');
            const orderFetch = adminToken
                ? fetch(`${FINAL_API_URL}/api/orders`, { headers: { 'Authorization': `Bearer ${adminToken}` } })
                : Promise.resolve(null);

            const [productRes, bannerRes, mediaRes, settingsRes, orderRes] = await Promise.all([
                ...publicFetches,
                orderFetch
            ]);
            
            const rawProducts = productRes.ok ? await productRes.json() : [];
            const p = rawProducts.map(prod => ({
                ...prod,
                price: Number(prod.price) || 0,
                discountPrice: prod.discountPrice ? Number(prod.discountPrice) : null,
                rating: Number(prod.rating) || 5,
                variants: (prod.variants || []).map((v) => ({
                    ...v,
                    price: v.price !== undefined ? Number(v.price) : (prod.discountPrice ? Number(prod.discountPrice) : Number(prod.price))
                }))
            }));
            const b = bannerRes.ok ? await bannerRes.json() : [];
            const m = mediaRes.ok ? await mediaRes.json() : [];
            const o = (orderRes && orderRes.ok) ? await orderRes.json() : []; // Gracefully handle null response
            const s = settingsRes.ok ? await settingsRes.json() : {};
            
            // DEBUG: Trace Policy Data Sources
            console.log("🛠️ POLICY SYNC START:", { 
                has_policies_obj: !!s.policies, 
                policies_count: s.policies ? Object.keys(s.policies).length : 0,
                legacy_keys: Object.keys(s).filter(k => k.endsWith('Policy') || k.includes('_title'))
            });

            // --- HARDENED POLICY MIGRATION & NORMALIZATION ---
            const normalizedPolicies = { ...(s.policies || {}) };
            
            Object.keys(POLICY_DEFAULTS).forEach(key => {
                const meta = POLICY_DEFAULTS[key];
                const current = normalizedPolicies[key];

                if (!current) {
                    // Create from scratch if completely missing
                    normalizedPolicies[key] = {
                        title: meta.title,
                        navLabel: meta.navLabel,
                        content: DEFAULT_POLICIES[key] || ''
                    };
                } else {
                    // Normalize existing entries
                    const normalized = {
                        title: current.title || meta.title,
                        navLabel: current.navLabel || current.title || meta.navLabel,
                        content: (typeof current === 'string' ? current : current.content) || DEFAULT_POLICIES[key] || ''
                    };
                    normalizedPolicies[key] = normalized;
                }
            });

            const mergedSettings = {
                currency: { code: 'INR', symbol: '₹', rate: 1 },
                globalDiscount: 0,
                shopName: 'Tutu & Co',
                ...s,
                policies: normalizedPolicies,
                customPolicies: s.customPolicies || []
            };

            // Set all state
            setProducts(p || []);
            setBanners(b || []);
            setMedia(m || []);
            setOrders(Array.isArray(o) ? o : []);
            setSettings(mergedSettings);
        } catch (error) {
            console.error("Failed to load shop data from server", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Admin functions for banners, settings, media, orders ---

    const updateSettings = async (newSettings) => {
        if (!FINAL_API_URL) return;
        try {
            const res = await fetch(`${FINAL_API_URL}/api/settings`, {
                method: 'PUT',
                headers: getAdminHeaders(), // Auth token required for admin route
                body: JSON.stringify(newSettings)
            });
            const data = await res.json();
            if (data && typeof data === 'object') setSettings(data);
            return data;
        } catch (err) {
            console.error("Settings update failed", err);
        }
    };

    const updateBanners = async (newBanners, immediate = false) => {
        setBanners(newBanners); // Optimistic Update for instant UI feedback
        if (!FINAL_API_URL) return;

        // Clear existing debounce
        if (window._bannerDebounce) {
            clearTimeout(window._bannerDebounce);
            window._bannerDebounce = null;
        }

        const sync = async () => {
            try {
                const res = await fetch(`${FINAL_API_URL}/api/banners`, {
                    method: 'PUT',
                    headers: getAdminHeaders(), // Auth token required for admin route
                    body: JSON.stringify(newBanners)
                });
                const result = await res.json();
                console.log("SAVED BANNERS (DB SUCCESS):", result);
                return result;
            } catch (err) {
                console.error("Banner synchronization failed", err);
                throw err;
            }
        };

        if (immediate) {
            return sync();
        } else {
            // Schedule new persistence
            return new Promise((resolve) => {
                window._bannerDebounce = setTimeout(async () => {
                    const result = await sync();
                    window._bannerDebounce = null;
                    resolve(result);
                }, 500); // Wait 500ms before sending to server
            });
        }
    };

    const uploadMedia = async (url, name) => {
        if (!FINAL_API_URL) return;
        try {
            const res = await fetch(`${FINAL_API_URL}/api/media`, {
                method: 'POST',
                headers: getAdminHeaders(), // Auth token required for admin route
                body: JSON.stringify({ url, name })
            });
            const newMedia = await res.json();
            await loadData();
            return newMedia;
        } catch (err) {
            console.error("Media upload reference failed", err);
        }
    };

    const shipOrder = async (id, shippingDetails) => {
        if (!FINAL_API_URL) return;
        try {
            const res = await fetch(`${FINAL_API_URL}/api/orders/${id}/ship`, {
                method: 'PATCH',
                headers: getAdminHeaders(), // Auth token required for admin route
                body: JSON.stringify(shippingDetails)
            });
            const result = await res.json();
            await loadData();
            return result;
        } catch (err) {
            console.error("Ship order failed", err);
        }
    };

    // Core shop value — banners, media, settings, orders, loading + admin functions
    const coreValue = {
        banners,
        media,
        orders,
        loading,
        settings,
        updateSettings,
        updateBanners,
        uploadMedia,
        shipOrder,
        formatPrice: (amt) => formatPrice(amt, settings),
        refreshData: loadData
    };

    return (
        <ShopCoreContext.Provider value={coreValue}>
            <ProductProvider products={products} onMutate={loadData}>
                <CartProvider settings={settings} products={products}>
                    {children}
                </CartProvider>
            </ProductProvider>
        </ShopCoreContext.Provider>
    );
};
