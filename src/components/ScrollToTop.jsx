import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * This component listens for route changes using useLocation from react-router-dom.
 * Whenever the pathname changes, it instantly scrolls the window to the top (0, 0).
 * It returns null as it doesn't render any UI elements.
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Only trigger scroll to top for storefront routes
        // Exclude all administration/dashboard routes
        if (pathname.startsWith('/admin')) return;

        // Instant scroll to top on storefront route changes
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
