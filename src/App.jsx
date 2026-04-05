import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Blogs from './pages/Blogs';
import BlogPost from './pages/BlogPost';
import Collab from './pages/Collab';
import Policy from './pages/Policy';
import Moments from './pages/Moments';
import { ShopProvider } from './context/ShopContext';
import ScrollToTop from './components/ScrollToTop';

function App() {
    return (
        <Router>
            <ScrollToTop />
                <Routes>
                    <Route path="/" element={<Layout><Home /></Layout>} />
                    <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
                    <Route path="/cart" element={<Layout><Cart /></Layout>} />
                    <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
                    <Route path="/blogs" element={<Layout><Blogs /></Layout>} />
                    <Route path="/blogs/:id" element={<Layout><BlogPost /></Layout>} />
                    <Route path="/collab" element={<Layout><Collab /></Layout>} />
                    <Route path="/policy/:section" element={<Layout><Policy /></Layout>} />
                    <Route path="/policies/:section" element={<Layout><Policy /></Layout>} />
                    <Route path="/terms" element={<Navigate to="/policies/terms" replace />} />
                    <Route path="/moments" element={<Layout><Moments /></Layout>} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route 
                        path="/admin/dashboard/*" 
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        } 
                    />
                </Routes>
        </Router>
    );
}

export default App;
