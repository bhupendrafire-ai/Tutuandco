import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Triggers a scroll to the top of the viewport whenever the URL pathname changes.
 * This ensures that navigation between different pages/policies always starts at the top.
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Reset scroll position to top whenever pathname changes
        window.scrollTo(0, 0);
    }, [pathname]);

    // This component only handles logic and doesn't render any UI
    return null;
};

export default ScrollToTop;
