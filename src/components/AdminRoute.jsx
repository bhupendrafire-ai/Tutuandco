import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    // Check if admin is authenticated (using sessionStorage for extra security)
    const isAdminAuthenticated = sessionStorage.getItem('isAdminAuthenticated') === 'true';

    if (!isAdminAuthenticated) {
        // Redirect to admin login if not authenticated
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default AdminRoute;
