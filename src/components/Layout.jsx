import Header from './Header';
import Footer from './Footer';
import Chatbot from './Chatbot';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col font-sans selection:bg-[#95714F] selection:text-white">
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
            <Chatbot />
        </div>
    );
};

export default Layout;
