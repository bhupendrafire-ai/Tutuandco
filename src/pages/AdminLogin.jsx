import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import logo from '../assets/logo.png';
import logoWhite from '../assets/logo-white.png';


const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            // Determine API URL (using a fallback if context isn't ready)
            const apiUrl = 'https://tutuandco-production.up.railway.app'; // Final confirmed API
            
            const response = await fetch(`${apiUrl}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.authenticated) {
                sessionStorage.setItem('isAdminAuthenticated', 'true');
                navigate('/admin/dashboard');
            } else {
                setError(data.error || 'Invalid credentials. Please try again.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Could not connect to the authentication server.');
        }
    };

    return (
        <div className="min-h-screen bg-brand-sage flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-brand-cream rounded-lg shadow-xl p-10 border border-brand-charcoal/5">
                <div className="flex flex-col items-center mb-10">
                    <div className="bg-brand-rose text-brand-charcoal p-4 rounded-full mb-4 shadow-lg">
                        <Lock size={24} />
                    </div>
                    <div className="flex flex-col items-center">
                        <img src={logo} alt="Tutu & Co" className="h-12 w-auto mb-2" />
                        <span className="text-xl font-medium text-brand-charcoal">Admin portal</span>
                    </div>

                    <p className="text-brand-charcoal/40 mt-2 text-sm italic">Please sign in to access the dashboard</p>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-md text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-[11px] font-medium text-brand-charcoal/40 mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-brand-sage/20 border border-brand-charcoal/10 rounded-md py-3 px-4 focus:outline-none focus:border-brand-charcoal text-brand-charcoal transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-medium text-brand-charcoal/40 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-brand-sage/20 border border-brand-charcoal/10 rounded-md py-3 px-4 focus:outline-none focus:border-brand-charcoal text-brand-charcoal transition-colors"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-brand-rose text-brand-charcoal py-5 rounded-md font-medium hover:bg-white transition-colors text-[18px] shadow-lg"
                    >
                        Enter dashboard
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-brand-charcoal/40 hover:text-brand-charcoal cursor-pointer transition-colors">
                    Forgot Password?
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
