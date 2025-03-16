import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';
import { useAuth } from './AuthContext';
import { authAPI } from '../utils/api';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize Web3
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        let web3Instance;

        // Check if MetaMask is installed
        if (window.ethereum) {
          web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          // Get network ID
          const networkId = await web3Instance.eth.net.getId();
          setNetworkId(networkId);

          // Check if already connected
          const accounts = await web3Instance.eth.getAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            
            // Update user's wallet address in the database if logged in
            if (isAuthenticated && accounts[0] !== user?.walletAddress) {
              updateUserWallet(accounts[0]);
            }
          }

          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
              setAccount(accounts[0]);
              // Update user's wallet address in the database if logged in
              if (isAuthenticated && accounts[0] !== user?.walletAddress) {
                updateUserWallet(accounts[0]);
              }
            } else {
              setAccount(null);
            }
          });

          // Listen for network changes
          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          });
        } else {
          // If MetaMask is not installed, use a read-only provider
          const provider = new Web3.providers.HttpProvider(
            process.env.REACT_APP_WEB3_PROVIDER_URL
          );
          web3Instance = new Web3(provider);
          setWeb3(web3Instance);
          setNetworkId(await web3Instance.eth.net.getId());
          console.log('MetaMask not installed. Using read-only mode.');
        }
      } catch (error) {
        console.error('Error initializing Web3:', error);
        setError('Failed to initialize Web3. Please refresh the page and try again.');
      }
    };

    initWeb3();

    // Cleanup function
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [isAuthenticated, user]);

  // Update user's wallet address in the database
  const updateUserWallet = async (address) => {
    try {
      await authAPI.updateWallet(address);
    } catch (error) {
      console.error('Error updating wallet address:', error);
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!web3) {
      setError('Web3 not initialized. Please refresh the page and try again.');
      return;
    }

    if (!window.ethereum) {
      setError('MetaMask not installed. Please install MetaMask to connect your wallet.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        
        // Update user's wallet address in the database if logged in
        if (isAuthenticated && accounts[0] !== user?.walletAddress) {
          await updateUserWallet(accounts[0]);
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
  };

  const value = {
    web3,
    account,
    networkId,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}; 