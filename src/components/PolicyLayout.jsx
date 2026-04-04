import React from 'react';
import PolicySidebar from './PolicySidebar';

/**
 * Shared Policy Layout Component
 * Features:
 * - Persistent Sidebar across all policy states
 * - Consistent 1440px max-width container
 * - Responsive Grid (LG: 12 cols, content spans 8, sidebar spawns 4/fixed width)
 */
const PolicyLayout = ({ activeKey, children }) => {
    return (
        <div className="bg-brand-sage min-h-screen pt-32 pb-32">
            <div className="max-w-[1440px] mx-auto px-3 flex flex-col lg:flex-row gap-20">
                {/* Sidebar Column - Persistent Width */}
                <aside className="lg:w-[320px] flex-shrink-0">
                    <PolicySidebar activeKey={activeKey} />
                </aside>

                {/* Content Area Column - Dynamically sized */}
                <main className="flex-grow bg-brand-cream p-12 lg:p-20 rounded-sm shadow-sm transition-all duration-500">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default PolicyLayout;
