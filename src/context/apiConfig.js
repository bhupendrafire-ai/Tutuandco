// Shared API configuration — extracted to prevent circular imports
// between ShopContext, ProductContext, and CartContext

// Harden environment access with optional chaining to prevent top-level module failure
const VITE_API_URL = import.meta?.env?.VITE_API_URL;
const IS_PROD = import.meta?.env?.PROD;
const FALLBACK_URL = 'https://tutuandco-production.up.railway.app'; // Stable production fallback

// Auto-detect or use hardcoded fallback
let resolvedUrl = VITE_API_URL || FALLBACK_URL;

if (resolvedUrl && !resolvedUrl.startsWith('http')) {
    resolvedUrl = `https://${resolvedUrl}`;
}

// Final resolved API URL used by all contexts
export const FINAL_API_URL = resolvedUrl?.replace(/\/$/, "");

if (IS_PROD) {
    if (!VITE_API_URL) {
        console.warn("🛡️ API FALLBACK: VITE_API_URL was undefined. Using hardcoded production URL.");
    }
    console.log("🛠️ Build Connectivity:", { 
        has_api_url: !!VITE_API_URL, 
        resolved_url: FINAL_API_URL 
    });
}

// Helper: Builds headers with admin auth token for protected API calls
export const getAdminHeaders = () => {
    const token = sessionStorage.getItem('adminToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};
