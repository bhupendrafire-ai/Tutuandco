import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Blogs from './pages/Blogs';
import BlogPost from './pages/BlogPost';
import Collab from './pages/Collab';
import Sizing from './pages/Sizing';
import Policy from './pages/Policy';
import Moments from './pages/Moments';
import { ShopProvider } from './context/ShopContext';

function App() {
    return (
        <ShopProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Layout><Home /></Layout>} />
                    <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
                    <Route path="/cart" element={<Layout><Cart /></Layout>} />
                    <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
                    <Route path="/blogs" element={<Layout><Blogs /></Layout>} />
                    <Route path="/blogs/:id" element={<Layout><BlogPost /></Layout>} />
                    <Route path="/collab" element={<Layout><Collab /></Layout>} />
                    <Route path="/sizing" element={<Layout><Sizing /></Layout>} />
                    <Route path="/policy/:section" element={<Layout><Policy /></Layout>} />
                    <Route path="/moments" element={<Layout><Moments /></Layout>} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Routes>
            </Router>
        </ShopProvider>
    );
}

export default App;
