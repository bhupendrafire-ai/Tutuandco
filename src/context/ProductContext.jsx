import React, { createContext, useContext } from 'react';
import { FINAL_API_URL, getAdminHeaders } from './apiConfig';

/**
 * ProductContext
 * Manages product listing and admin CRUD operations.
 * Separated from ShopContext for cleaner domain isolation.
 */
const ProductContext = createContext();

export { ProductContext };

// Direct hook for components that only need product data
export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) throw new Error("useProducts must be used within a ProductProvider");
    return context;
};

/**
 * ProductProvider
 * @param {Array} products - Product list (state managed by parent ShopProvider via loadData)
 * @param {Function} onMutate - Callback to refresh all data after a product is created/updated/deleted
 */
export const ProductProvider = ({ children, products, onMutate }) => {

    // Create a new product (admin-only)
    const addProduct = async (product) => {
        if (!FINAL_API_URL) {
            console.error("❌ API_URL is not configured. Cannot add product.");
            return;
        }
        try {
            const res = await fetch(`${FINAL_API_URL}/api/products`, {
                method: 'POST',
                headers: getAdminHeaders(), // Auth token required for admin route
                body: JSON.stringify(product)
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`API returned ${res.status}: ${errorData.message || 'Unknown error'}`);
            }
            const newProduct = await res.json();
            await onMutate?.(); // Refresh all data from server
            return newProduct;
        } catch (err) {
            console.error("❌ Failed to add product:", err.message);
            throw err; // Re-throw to allow caller to handle
        }
    };

    // Delete a product by ID (admin-only)
    const deleteProduct = async (id) => {
        if (!FINAL_API_URL) return;
        try {
            await fetch(`${FINAL_API_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: getAdminHeaders() // Auth token required for admin route
            });
            await onMutate?.(); // Refresh all data from server
        } catch (err) {
            console.error("Delete product failed", err);
        }
    };

    // Update a product by ID (admin-only)
    const updateProduct = async (id, updates) => {
        if (!FINAL_API_URL) return;
        try {
            await fetch(`${FINAL_API_URL}/api/products/${id}`, {
                method: 'PUT',
                headers: getAdminHeaders(), // Auth token required for admin route
                body: JSON.stringify(updates)
            });
            await onMutate?.(); // Refresh all data from server
        } catch (err) {
            console.error("Update product failed", err);
        }
    };

    const value = {
        products,
        addProduct,
        deleteProduct,
        updateProduct
    };

    return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};
