import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Web3Provider } from './contexts/Web3Context';

// Pages
import Dashboard from './pages/Dashboard';
import DocumentGenerator from './pages/DocumentGenerator';
import ContractReviewer from './pages/ContractReviewer';
import DAOCreator from './pages/DAOCreator';
import LegalChatbot from './pages/LegalChatbot';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateAccount from './pages/CreateAccount';
import Home from './pages/Home';
import AddWallet from './pages/AddWallet';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [showContent, setShowContent] = useState(false);

  // Force loading screen to show on initial load
  useEffect(() => {
    // Prevent scrolling during loading screen
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      // Reset overflow when component unmounts
      document.documentElement.style.overflow = 'auto';
    };
  }, []);

  const handleLoadingComplete = () => {
    console.log('Loading complete, showing content');
    setShowContent(true);
    document.documentElement.style.overflow = 'auto';
  };

  return (
    <AuthProvider>
      <Web3Provider>
        {!showContent && (
          <LoadingScreen onLoadingComplete={handleLoadingComplete} />
        )}
        
        {showContent && (
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/create-account" element={<CreateAccount />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/document-generator" element={<DocumentGenerator />} />
                <Route path="/contract-reviewer" element={<ContractReviewer />} />
                <Route path="/dao-creator" element={<DAOCreator />} />
                <Route path="/legal-chatbot" element={<LegalChatbot />} />
                <Route path="/add-wallet" element={<AddWallet />} />
                <Route path="/" element={<Home />} />
              </Routes>
            </main>
            <Footer />
          </div>
        )}
      </Web3Provider>
    </AuthProvider>
  );
}

export default App; 