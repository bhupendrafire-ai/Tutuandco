import React, { useState } from 'react';
import { 
    ShoppingCart, X, Printer, Truck, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop, getProductImage } from '../../context/ShopContext';

const AdminOrders = () => {
    const { orders, media, shipOrder, settings } = useShop();

    if (!settings) return null; // Safe guard for initial data hydration

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [shippingForm, setShippingForm] = useState({ tracking_number: '', carrier: '' });

    const statusColors = {
        'Pending': 'bg-brand-rose/10 text-brand-rose',
        'Shipped': 'bg-blue-100 text-blue-700',
        'Delivered': 'bg-green-100 text-green-700',
        'Cancelled': 'bg-gray-100 text-gray-500'
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-10 rounded-sm shadow-sm border border-brand-charcoal/5">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-medium">Customer Transactions</h2>
                    <div className="flex items-center space-x-2 text-brand-charcoal/40 text-[11px] font-bold uppercase tracking-widest">
                        <ShoppingCart size={14} />
                        <span>{orders.length} Total Orders</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-[0.2em] border-b border-brand-charcoal/5">
                                <th className="pb-6 pr-6">Order ID</th>
                                <th className="pb-6 pr-6">Customer</th>
                                <th className="pb-6 pr-6">Status</th>
                                <th className="pb-6 pr-6">Date</th>
                                <th className="pb-6 pr-6">Amount</th>
                                <th className="pb-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-charcoal/5">
                            {orders.map((order) => (
                                <tr key={order.id} className="group hover:bg-brand-sage/5 transition-colors">
                                    <td className="py-6 pr-6 font-bold text-[13px]">
                                        #{String(order.id).padStart(4, '0')}
                                    </td>
                                    <td className="py-6 pr-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-brand-charcoal">{order.customer_name || 'Guest User'}</span>
                                            <span className="text-[11px] text-brand-charcoal/40">{order.customer_email}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 pr-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColors[order.status] || 'bg-gray-100'}`}>
                                            {order.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="py-6 pr-6 text-sm text-brand-charcoal/60">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="py-6 pr-6 text-lg font-medium">
                                        ₹{parseFloat(order.total_amount || 0).toFixed(2)}
                                    </td>
                                    <td className="py-6 text-right">
                                        <button 
                                            onClick={() => setSelectedOrder(order)}
                                            className="px-6 py-2 bg-brand-charcoal text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-brand-rose transition-all shadow-md group-hover:scale-105"
                                        >
                                            Inspect
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center text-brand-charcoal/20 font-bold uppercase tracking-widest">
                                        No orders found in database.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-12 overflow-hidden">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-brand-charcoal/90 backdrop-blur-md" />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                            className="relative bg-white w-full max-w-5xl h-[90vh] rounded-sm overflow-hidden shadow-2xl flex flex-col"
                        >
                            <div className="p-8 border-b border-brand-charcoal/10 flex justify-between items-center bg-brand-cream/30">
                                <div>
                                    <h3 className="text-2xl font-medium text-brand-charcoal">Order Details</h3>
                                    <p className="text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-widest mt-1">Order ID: #{String(selectedOrder.id).padStart(4, '0')} • Internal Record</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button onClick={() => window.print()} className="p-3 bg-brand-sage/20 rounded-full hover:bg-brand-sage transition-all text-brand-charcoal"><Printer size={20} /></button>
                                    <button onClick={() => setSelectedOrder(null)} className="p-3 bg-brand-charcoal text-white rounded-full hover:scale-110 transition-all shadow-xl"><X size={20} /></button>
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto p-12 space-y-12 print:p-0">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Customer Info</h4>
                                        <div className="space-y-1">
                                            <p className="font-bold text-lg">{selectedOrder.customer_name}</p>
                                            <p className="text-sm opacity-60 font-medium">{selectedOrder.customer_email}</p>
                                            <p className="text-sm opacity-60 font-medium">{selectedOrder.customer_phone}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Shipping Address</h4>
                                        <div className="space-y-1 text-sm font-medium opacity-80 leading-relaxed uppercase tracking-tight">
                                            <p>{selectedOrder.shipping_address?.address}</p>
                                            <p>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}</p>
                                            <p>{selectedOrder.shipping_address?.zip}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Order Status</h4>
                                        <div className="flex flex-col gap-2">
                                            <span className={`px-4 py-2 rounded-sm text-[11px] font-bold uppercase tracking-widest text-center ${selectedOrder.status === 'Shipped' ? 'bg-blue-600 text-white' : 'bg-brand-rose text-brand-charcoal'}`}>
                                                {selectedOrder.status}
                                            </span>
                                            <p className="text-[10px] text-center font-bold opacity-30 uppercase tracking-[0.2em]">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Line Items</h4>
                                    <div className="border border-brand-charcoal/5 rounded-sm overflow-hidden">
                                        {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, i) => (
                                            <div key={i} className="flex items-center gap-6 p-6 border-b border-brand-charcoal/5 last:border-0 bg-brand-cream/5">
                                                <div className="w-20 h-24 bg-white rounded-sm overflow-hidden shadow-sm flex-shrink-0">
                                                    <img src={getProductImage(Array.isArray(item.images) ? item.images[0]?.url : item.imageName, media)} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div className="flex-grow">
                                                    <h5 className="font-bold text-brand-charcoal">{item.name}</h5>
                                                    <p className="text-[11px] text-brand-charcoal/40 font-medium uppercase tracking-widest">{item.category} • SKU: {String(item.id).substring(0, 8)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-widest mb-1">Qty {item.quantity || 1}</p>
                                                    <p className="font-bold text-brand-charcoal">₹{(parseFloat(item.discountPrice || item.price) || 0).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-brand-cream/20 p-10 rounded-sm">
                                    <div className="space-y-8">
                                        <h4 className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-widest flex items-center gap-2">
                                            <Truck size={14} /> 
                                            Shipping Management
                                        </h4>
                                        {selectedOrder.status === 'Pending' ? (
                                            <div className="space-y-6">
                                                <div className="space-y-4">
                                                    <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">Logistics Carrier</label>
                                                    <input 
                                                        list="carriers-list"
                                                        value={shippingForm.carrier}
                                                        onChange={e => setShippingForm({ ...shippingForm, carrier: e.target.value })}
                                                        placeholder="Enter or select carrier..."
                                                        className="w-full p-4 bg-white border border-brand-charcoal/10 rounded-sm text-sm focus:border-brand-rose outline-none font-bold"
                                                    />
                                                    <datalist id="carriers-list">
                                                        {(settings.carriers || ["FedEx", "Delhivery", "BlueDart", "DTDC"]).map(c => <option key={c} value={c} />)}
                                                    </datalist>
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">AWB / Tracking Number</label>
                                                    <input 
                                                        value={shippingForm.tracking_number}
                                                        onChange={e => setShippingForm({ ...shippingForm, tracking_number: e.target.value })}
                                                        placeholder="Paste tracking number here..."
                                                        className="w-full p-4 bg-white border border-brand-charcoal/10 rounded-sm text-sm focus:border-brand-rose outline-none font-bold"
                                                    />
                                                </div>
                                                <button 
                                                    onClick={async () => {
                                                        if (!shippingForm.carrier || !shippingForm.tracking_number) return alert("Please enter carrier and tracking info");
                                                        const res = await shipOrder(selectedOrder.id, shippingForm);
                                                        if (res) {
                                                            setSelectedOrder(null);
                                                            alert(`Order #${selectedOrder.id} dispatched! Notification sent to customer.`);
                                                        }
                                                    }}
                                                    className="w-full bg-brand-charcoal text-white py-5 rounded-sm font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all shadow-xl"
                                                >
                                                    Dispatch Order & Notify Customer
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="p-6 bg-blue-600/5 border border-blue-600/20 rounded-sm space-y-3">
                                                <p className="text-blue-700 text-sm font-bold">This shipment is currently in transit.</p>
                                                <div className="text-[11px] font-medium text-blue-600 space-y-1">
                                                    <p>Carrier: <span className="font-bold">{selectedOrder.carrier}</span></p>
                                                    <p>Tracking: <span className="font-bold">{selectedOrder.tracking_number}</span></p>
                                                    <p>Dispatched: <span className="font-bold">{new Date(selectedOrder.shipped_at).toLocaleString()}</span></p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-white p-8 rounded-sm shadow-sm h-fit">
                                        <h4 className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-widest mb-6 border-b border-brand-charcoal/5 pb-4">Financial Summary</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-sm opacity-60 font-medium"><span>Subtotal</span><span>₹{parseFloat(selectedOrder.total_amount - selectedOrder.shipping_cost).toFixed(2)}</span></div>
                                            <div className="flex justify-between text-sm opacity-60 font-medium"><span>Shipping</span><span>₹{parseFloat(selectedOrder.shipping_cost).toFixed(2)}</span></div>
                                            <div className="flex justify-between text-lg font-bold text-brand-charcoal pt-4 border-t border-brand-charcoal/10"><span>Total Paid</span><span>₹{parseFloat(selectedOrder.total_amount).toFixed(2)}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * { visibility: hidden; }
                    .print\\:hidden { display: none !important; }
                    .fixed { position: static !important; }
                    .relative { position: static !important; }
                    .shadow-2xl, .shadow-xl, .shadow-sm { box-shadow: none !important; }
                    .bg-white { background: white !important; }
                    .bg-brand-cream\\/30, .bg-brand-cream\\/20, .bg-brand-cream\\/5 { background: transparent !important; }
                    .p-4, .p-8, .p-12 { padding: 0 !important; }
                    .max-w-5xl { max-width: 100% !important; }
                    .h-\\[90vh\\] { height: auto !important; }
                    .relative.bg-white { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; border: none !important; }
                    .relative.bg-white * { visibility: visible; }
                }
            `}} />
        </div>
    );
};

export default AdminOrders;
