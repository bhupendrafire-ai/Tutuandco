import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Updated mock credentials
        if (username === 'sneha@tutuandco.in' && password === 'Black@5353') {
            navigate('/admin/dashboard');
        } else {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-[#EADED0] flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-10">
                <div className="flex flex-col items-center mb-10">
                    <div className="bg-[#95714F] p-4 rounded-full mb-4">
                        <Lock className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-serif text-black">Tutu & Co Admin</h1>
                    <p className="text-[#95714F]/60 mt-2 text-sm">Please sign in to access the dashboard</p>
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
                        <label className="block text-xs font-bold text-[#95714F] uppercase tracking-wider mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-[#F5F5F3] border border-[#C7AF94]/30 rounded-md py-3 px-4 focus:outline-none focus:border-[#95714F] text-[#1A1A1A] transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#95714F] uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#F5F5F3] border border-[#C7AF94]/30 rounded-md py-3 px-4 focus:outline-none focus:border-[#95714F] text-[#1A1A1A] transition-colors"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#95714F] text-white py-4 rounded-md font-medium hover:bg-[#8C916C] transition-colors uppercase tracking-widest text-sm"
                    >
                        Enter Dashboard
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-[#95714F]/40 hover:text-[#95714F] cursor-pointer">
                    Forgot Password?
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
