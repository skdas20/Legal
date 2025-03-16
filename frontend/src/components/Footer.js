import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">DigiLex</h3>
            <p className="text-gray-400 text-sm">
              A comprehensive platform that combines AI and blockchain technology to provide legal document generation, 
              smart contract review, DAO creation, and legal advice.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/document-generator" className="text-gray-400 hover:text-white text-sm">
                  Document Generator
                </Link>
              </li>
              <li>
                <Link to="/contract-reviewer" className="text-gray-400 hover:text-white text-sm">
                  Contract Reviewer
                </Link>
              </li>
              <li>
                <Link to="/dao-creator" className="text-gray-400 hover:text-white text-sm">
                  DAO Creator
                </Link>
              </li>
              <li>
                <Link to="/legal-chatbot" className="text-gray-400 hover:text-white text-sm">
                  Legal Chatbot
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-gray-400 hover:text-white text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white text-sm">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} DigiLex. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 