import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Web3Provider } from './contexts/Web3Context';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter basename="/Legal">
      <AuthProvider>
        <Web3Provider>
          <App />
        </Web3Provider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
); 