import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import PageBackground from '../components/PageBackground';

const walletTypes = [
  { id: 'metamask', name: 'MetaMask', description: 'Connect using MetaMask browser extension', icon: 'metamask.svg' },
  { id: 'walletconnect', name: 'WalletConnect', description: 'Scan with WalletConnect to connect', icon: 'walletconnect.svg' },
  { id: 'coinbase', name: 'Coinbase Wallet', description: 'Connect using Coinbase Wallet', icon: 'coinbase.svg' },
  { id: 'fortmatic', name: 'Fortmatic', description: 'Connect using Fortmatic', icon: 'fortmatic.svg' },
  { id: 'torus', name: 'Torus', description: 'Connect using Torus', icon: 'torus.svg' },
  { id: 'ledger', name: 'Ledger', description: 'Connect using Ledger hardware wallet', icon: 'ledger.svg' }
];

const AddWallet = () => {
  const navigate = useNavigate();
  const { connectWallet, connected, account } = useWeb3();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  
  // Handle wallet type selection
  const handleWalletSelect = async (walletType) => {
    setSelectedWallet(walletType);
    setLoading(true);
    setError('');
    
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Connect wallet
      await connectWallet(walletType.id);
      setSuccess(true);
      setStep(2);
      
      // Redirect to dashboard after successful connection
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Render wallet selection
  const renderWalletSelection = () => {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6 animate-fade-in">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Select Wallet Provider</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {walletTypes.map((wallet) => (
            <div
              key={wallet.id}
              onClick={() => handleWalletSelect(wallet)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer transition-colors flex items-center"
            >
              <div className="flex-shrink-0 h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-4">
                <img 
                  src={`/images/wallets/${wallet.icon}`} 
                  alt={wallet.name}
                  className="h-8 w-8"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/placeholder.svg';
                  }}
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{wallet.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{wallet.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {error && (
          <div className="mt-6 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md">
            {error}
          </div>
        )}
      </div>
    );
  };
  
  // Render connection status
  const renderConnectionStatus = () => {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6 animate-fade-in">
        <div className="flex flex-col items-center justify-center py-6">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Connecting to {selectedWallet?.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">Please approve the connection request in your wallet...</p>
            </>
          ) : success ? (
            <>
              <div className="rounded-full h-16 w-16 bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Wallet Connected Successfully</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-2">Your wallet has been connected to DigiLex.</p>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-md px-4 py-2 font-mono text-sm break-all">
                {account}
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">Redirecting to dashboard...</p>
            </>
          ) : (
            <>
              <div className="rounded-full h-16 w-16 bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Connection Failed</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">{error || 'Failed to connect wallet. Please try again.'}</p>
              <button
                onClick={() => setStep(1)}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <PageBackground>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Connect Wallet</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Connect your wallet to access DigiLex's blockchain-powered legal services, including document verification and DAO governance.
        </p>
        
        <div className="mb-8">
          <ol role="list" className="flex items-center">
            <li className="relative flex flex-col items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'} text-white`}>
                <span>1</span>
              </div>
              <div className={`mt-2 text-sm font-medium ${step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                Select Wallet
              </div>
              <div className="absolute top-4 left-full w-12 h-0.5 bg-gray-300 dark:bg-gray-700"></div>
            </li>
            <li className="relative flex flex-col items-center mx-16">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'} text-white`}>
                <span>2</span>
              </div>
              <div className={`mt-2 text-sm font-medium ${step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                Connect
              </div>
              <div className="absolute top-4 right-full w-12 h-0.5 bg-gray-300 dark:bg-gray-700"></div>
            </li>
          </ol>
        </div>
        
        {step === 1 && renderWalletSelection()}
        {step === 2 && renderConnectionStatus()}
        
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Security Notice</h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
                <p>
                  Always verify you're on digilex.io before connecting your wallet. We will never ask for your seed phrase or private keys.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
};

export default AddWallet; 