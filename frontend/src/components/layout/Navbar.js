import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWeb3 } from '../../contexts/Web3Context';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { account, connectWallet, getShortAddress } = useWeb3();
  const navigate = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <nav className="bg-indigo-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="ml-2 text-xl font-bold text-white">DigiLex</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/" className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                
                {isAuthenticated && (
                  <>
                    <Link to="/dashboard" className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium">
                      Dashboard
                    </Link>
                    <Link to="/document-generator" className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium">
                      Document Generator
                    </Link>
                    <Link to="/contract-reviewer" className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium">
                      Contract Reviewer
                    </Link>
                    <Link to="/dao-creator" className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium">
                      DAO Creator
                    </Link>
                    <Link to="/legal-chatbot" className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium">
                      Legal Chatbot
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {account ? (
                    <span className="text-white bg-indigo-700 px-3 py-1 rounded-full text-sm">
                      {getShortAddress(account)}
                    </span>
                  ) : (
                    <button
                      onClick={connectWallet}
                      className="bg-white text-indigo-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-100"
                    >
                      Connect Wallet
                    </button>
                  )}
                  
                  <div className="relative ml-3">
                    <div className="flex items-center">
                      <span className="text-white mr-2">{user?.username}</span>
                      <button
                        onClick={handleLogout}
                        className="bg-indigo-700 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-indigo-800"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="bg-white text-indigo-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-indigo-700 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-indigo-800"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
            >
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          
          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/document-generator"
                className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Document Generator
              </Link>
              <Link
                to="/contract-reviewer"
                className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contract Reviewer
              </Link>
              <Link
                to="/dao-creator"
                className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                DAO Creator
              </Link>
              <Link
                to="/legal-chatbot"
                className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Legal Chatbot
              </Link>
            </>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-indigo-700">
          {isAuthenticated ? (
            <div className="px-2 space-y-1">
              {account ? (
                <div className="px-3 py-2 text-white">
                  Wallet: {getShortAddress(account)}
                </div>
              ) : (
                <button
                  onClick={() => {
                    connectWallet();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-500"
                >
                  Connect Wallet
                </button>
              )}
              
              <div className="px-3 py-2 text-white">
                Logged in as: {user?.username}
              </div>
              
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-500"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="px-2 space-y-1">
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 