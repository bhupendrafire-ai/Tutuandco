
import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, Package, ShoppingCart, BarChart3, 
    Settings, LogOut, Search, Filter, Download, 
    TrendingUp, Users, DollarSign, AlertCircle, Eye, Printer, FileText, CheckCircle
} from 'lucide-react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, AreaChart, Area, BarChart, Bar 
} from 'recharts';
import mockApi from '../api/mockApi';
import { getProductImage } from '../context/ShopContext';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, totalCustomers: 0, health: 98 });
    const [loading, setLoading] = useState(true);

    const trendData = [
        { name: 'Mon', sales: 4000, orders: 24 },
        { name: 'Tue', sales: 3000, orders: 18 },
        { name: 'Wed', sales: 5000, orders: 29 },
        { name: 'Thu', sales: 2780, orders: 14 },
        { name: 'Fri', sales: 6890, orders: 42 },
        { name: 'Sat', sales: 8390, orders: 51 },
        { name: 'Sun', sales: 4490, orders: 32 },
    ];

    useEffect(() => {
        const loadData = async () => {
            const [o, i] = await Promise.all([mockApi.getOrders(), mockApi.getProducts()]);
            setOrders(o);
            setInventory(i);
            
            const total = o.reduce((sum, order) => sum + order.total, 0);
            setStats({
                totalSales: total,
                totalOrders: o.length,
                totalCustomers: 142,
                health: 98
            });
            setLoading(false);
        };
        loadData();
    }, []);

    const updateStock = async (id, change) => {
        // Mock update
        const updated = inventory.map(item => 
            item.id === id ? { ...item, stock: Math.max(0, item.stock + change) } : item
        );
        setInventory(updated);
        alert("Stock updated successfully.");
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-serif">Accessing Secured Dashboard...</div>;

    const SidebarItem = ({ id, icon: Icon, label }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center space-x-4 p-4 rounded-sm transition-all ${activeTab === id ? 'bg-[#95714F] text-white shadow-lg' : 'text-[#95714F] hover:bg-[#F8F4F0]'}`}
        >
            <Icon size={20} />
            <span className="text-[10px] uppercase font-bold tracking-widest">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-[#F8F4F0] flex">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-[#C7AF94]/30 p-8 flex flex-col pt-32">
                <div className="flex-grow space-y-2">
                    <SidebarItem id="overview" icon={LayoutDashboard} label="Overview" />
                    <SidebarItem id="inventory" icon={Package} label="Inventory" />
                    <SidebarItem id="orders" icon={ShoppingCart} label="Orders" />
                    <SidebarItem id="analytics" icon={BarChart3} label="Analytics" />
                </div>
                <button className="flex items-center space-x-4 p-4 text-red-500 hover:bg-red-50 transition-all rounded-sm">
                    <LogOut size={20} />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-12 pt-32 overflow-y-auto">
                {/* Header */}
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-serif text-black mb-2 lowercase italic capitalize">{activeTab}</h1>
                        <p className="text-[#95714F] text-sm">System status: All systems operational.</p>
                    </div>
                    <div className="flex space-x-4">
                        <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#95714F]/40" />
                            <input className="bg-white border border-[#C7AF94]/30 pl-12 pr-6 py-3 rounded-sm text-sm focus:outline-none" placeholder="Search data..." />
                        </div>
                        <button className="bg-black text-white px-6 py-3 rounded-sm flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest">
                            <Download size={16} />
                            <span>Export</span>
                        </button>
                    </div>
                </header>

                {activeTab === 'overview' && (
                    <div className="space-y-12">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { label: 'Total Sales', val: `$${stats.totalSales.toLocaleString()}`, trend: '+12.5%', icon: DollarSign, color: '#8C916C' },
                                { label: 'Active Orders', val: stats.totalOrders, trend: '+4 today', icon: ShoppingCart, color: '#95714F' },
                                { label: 'Customers', val: stats.totalCustomers, trend: '+18%', icon: Users, color: '#C7AF94' },
                                { label: 'Site Health', val: `${stats.health}%`, trend: 'Optimal', icon: TrendingUp, color: '#EADED0' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-8 rounded-sm shadow-sm border-b-4" style={{ borderColor: stat.color }}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-[#F8F4F0] rounded-sm text-[#95714F]"><stat.icon size={24} /></div>
                                        <span className="text-[10px] font-bold text-green-600">{stat.trend}</span>
                                    </div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#95714F] mb-1">{stat.label}</p>
                                    <h3 className="text-3xl font-serif text-black">{stat.val}</h3>
                                </div>
                            ))}
                        </div>

                        {/* Chart */}
                        <div className="bg-white p-10 rounded-sm shadow-sm">
                            <h2 className="text-xl font-serif text-black mb-8">Revenue Trends (Weekly)</h2>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#95714F" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#95714F" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EADED0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#95714F'}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#95714F'}} />
                                        <Tooltip contentStyle={{borderRadius: '0px', border: '1px solid #C7AF94'}} />
                                        <Area type="monotone" dataKey="sales" stroke="#95714F" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="bg-white rounded-sm shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-[#F8F4F0]">
                                <tr className="text-[10px] uppercase font-bold tracking-widest text-[#95714F]">
                                    <th className="p-6">Product</th>
                                    <th className="p-6">Category</th>
                                    <th className="p-6">Stock</th>
                                    <th className="p-6">Price</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F8F4F0]">
                                {inventory.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#F8F4F0]/30 transition-colors">
                                        <td className="p-6 flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-[#F8F4F0] rounded-sm overflow-hidden">
                                                <img src={getProductImage(item.imageName)} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-serif text-black">{item.name}</span>
                                        </td>
                                        <td className="p-6 text-sm text-[#95714F]">{item.category}</td>
                                        <td className="p-6">
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-3 py-1 text-[10px] font-bold rounded-full ${item.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                    {item.stock} in stock
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-sm font-bold text-black">${item.price.toFixed(2)}</td>
                                        <td className="p-6 text-right space-x-2">
                                            <button onClick={() => updateStock(item.id, 5)} className="text-[#95714F] hover:text-black transition-colors"><Package size={18} /></button>
                                            <button className="text-[#95714F] hover:text-black transition-colors"><Eye size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white p-8 rounded-sm shadow-sm border border-[#C7AF94]/10 flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="flex items-center space-x-6">
                                    <div className="w-16 h-16 bg-[#8C916C]/10 rounded-full flex items-center justify-center text-[#8C916C]">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-black text-xl">Order #{order.id.slice(-6).toUpperCase()}</h3>
                                        <p className="text-xs text-[#95714F] uppercase tracking-widest mt-1">{order.customerName} • {new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-12">
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold text-[#95714F] tracking-widest mb-1">Status</p>
                                        <div className="flex items-center text-green-600 text-[10px] font-bold uppercase tracking-widest">
                                            <CheckCircle size={14} className="mr-2" /> {order.status}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold text-[#95714F] tracking-widest mb-1">Total</p>
                                        <p className="font-serif text-black text-xl">${order.total.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-4">
                                    <button 
                                        onClick={() => {
                                            alert(`Generating Tax Invoice for Order #${order.id}... Download starting.`);
                                        }}
                                        className="p-4 bg-[#F8F4F0] text-[#95714F] hover:bg-black hover:text-white transition-all rounded-sm flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest"
                                    >
                                        <Printer size={16} />
                                        <span>Invoice</span>
                                    </button>
                                    <button 
                                        className="p-4 bg-black text-white px-8 rounded-sm text-[10px] uppercase font-bold tracking-widest hover:opacity-80"
                                    >
                                        Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
