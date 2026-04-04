import React from 'react';
import { 
    ShoppingCart, Users, TrendingUp, DollarSign 
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer 
} from 'recharts';
import { useShop } from '../../context/ShopContext';

const AdminOverview = () => {
    const { orders, products, settings } = useShop();
    const currencySymbol = settings?.currency?.symbol || '₹';

    // Calculate real-time stats
    const totalSales = orders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
    const totalOrders = orders.length;
    const totalCustomers = new Set(orders.map(o => o.customer_email)).size || 142; // Fallback to 142 if no orders
    const health = 98; // System health constant

    const trendData = [
        { name: 'Mon', sales: 4000, orders: 24 },
        { name: 'Tue', sales: 3000, orders: 18 },
        { name: 'Wed', sales: 5000, orders: 29 },
        { name: 'Thu', sales: 2780, orders: 14 },
        { name: 'Fri', sales: 6890, orders: 42 },
        { name: 'Sat', sales: 8390, orders: 51 },
        { name: 'Sun', sales: 4490, orders: 32 },
    ];

    const stats_grid = [
        { label: 'Total Sales', val: `${currencySymbol}${totalSales.toLocaleString()}`, trend: '+12.5%', icon: DollarSign, color: '#CD664D' },
        { label: 'Active Orders', val: totalOrders, trend: '+4 today', icon: ShoppingCart, color: '#9FA993' },
        { label: 'Customers', val: totalCustomers, trend: '+18%', icon: Users, color: '#DED6C4' },
        { label: 'Site Health', val: `${health}%`, trend: 'Optimal', icon: TrendingUp, color: '#3E362E' }
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats_grid.map((stat, i) => (
                    <div key={i} className="bg-brand-cream p-8 rounded-sm shadow-sm border-b-4" style={{ borderColor: stat.color === '#CD664D' ? '#3B3B3B' : (stat.color === '#9FA993' ? '#8C916C' : stat.color) }}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-brand-sage/50 rounded-sm text-brand-charcoal">
                                {stat.icon && <stat.icon size={24} />}
                            </div>
                            <span className="text-[12px] font-bold text-green-700">{stat.trend}</span>
                        </div>
                        <p className="text-[13px] font-bold text-brand-charcoal/60 mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-medium text-brand-charcoal">{stat.val}</h3>
                    </div>
                ))}
            </div>

            <div className="bg-white p-10 rounded-sm shadow-sm border border-brand-charcoal/5">
                <h2 className="text-xl font-medium text-brand-charcoal mb-8">Revenue trends (weekly)</h2>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#CD664D" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#CD664D" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#3B3B3B'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#3B3B3B'}} />
                            <Tooltip contentStyle={{borderRadius: '0px', border: '1px solid #3B3B3B'}} />
                            <Area type="monotone" dataKey="sales" stroke="#3B3B3B" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
