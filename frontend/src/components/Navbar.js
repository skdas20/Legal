import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { account, connectWallet } = useWeb3();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if user has a dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-indigo-600 dark:bg-gray-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl">DigiLex</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Always show these links since we're bypassing auth for now */}
            <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 dark:hover:bg-gray-700">
              Dashboard
            </Link>
            <Link to="/document-generator" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 dark:hover:bg-gray-700">
              Document Generator
            </Link>
            <Link to="/contract-reviewer" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 dark:hover:bg-gray-700">
              Contract Reviewer
            </Link>
            <Link to="/dao-creator" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 dark:hover:bg-gray-700">
              DAO Creator
            </Link>
            <Link to="/legal-chatbot" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 dark:hover:bg-gray-700">
              Legal Chatbot
            </Link>
            
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="px-3 py-2 rounded-md text-sm font-medium bg-indigo-700 dark:bg-gray-700 hover:bg-indigo-800 dark:hover:bg-gray-600"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>

            {/* Commenting out auth-related UI */}
            {/* {isAuthenticated ? (
              <div className="ml-4 relative">
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium bg-indigo-700 hover:bg-indigo-800"
                >
                  Logout
                </button>
              </div>
            ) : ( */}
              <>
                <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500">
                  Login
                </Link>
                <Link to="/register" className="px-3 py-2 rounded-md text-sm font-medium bg-white text-indigo-600 hover:bg-gray-100">
                  Register
                </Link>
              </>
            {/* )} */}
            
            {/* Always show wallet connection */}
            <div className="ml-4">
              {account ? (
                <div className="px-3 py-2 rounded-md text-sm font-medium bg-green-600 dark:bg-green-700">
                  {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="px-3 py-2 rounded-md text-sm font-medium bg-orange-500 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 dark:text-gray-300 hover:text-white hover:bg-indigo-500 dark:hover:bg-gray-700 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Always show these links since we're bypassing auth for now */}
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500 dark:hover:bg-gray-700"
              onClick={toggleMenu}
            >
              Dashboard
            </Link>
            <Link
              to="/document-generator"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500 dark:hover:bg-gray-700"
              onClick={toggleMenu}
            >
              Document Generator
            </Link>
            <Link
              to="/contract-reviewer"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500 dark:hover:bg-gray-700"
              onClick={toggleMenu}
            >
              Contract Reviewer
            </Link>
            <Link
              to="/dao-creator"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500 dark:hover:bg-gray-700"
              onClick={toggleMenu}
            >
              DAO Creator
            </Link>
            <Link
              to="/legal-chatbot"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500 dark:hover:bg-gray-700"
              onClick={toggleMenu}
            >
              Legal Chatbot
            </Link>
            
            {/* Dark mode toggle */}
            <button
              onClick={() => {
                toggleDarkMode();
                toggleMenu();
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-indigo-700 dark:bg-gray-700 hover:bg-indigo-800 dark:hover:bg-gray-600"
            >
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>

            {/* Commenting out auth-related UI */}
            {/* {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-indigo-700 hover:bg-indigo-800"
                >
                  Logout
                </button>
              </>
            ) : ( */}
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-white text-indigo-600 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  Register
                </Link>
              </>
            {/* )} */}
            
            {/* Always show wallet connection */}
            {account ? (
              <div className="px-3 py-2 rounded-md text-sm font-medium bg-green-600 dark:bg-green-700">
                {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
              </div>
            ) : (
              <button
                onClick={() => {
                  connectWallet();
                  toggleMenu();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-orange-500 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 