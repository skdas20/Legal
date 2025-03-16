import React, { createContext, useContext, useState, useEffect } from 'react';

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setConnected(true);
            
            // Get chain ID
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            setChainId(parseInt(chainId, 16));
            
            // Get balance
            const balance = await window.ethereum.request({
              method: 'eth_getBalance',
              params: [accounts[0], 'latest']
            });
            setBalance(parseInt(balance, 16) / 1e18); // Convert from wei to ETH
          }
        } catch (err) {
          console.error('Error checking wallet connection:', err);
        }
      }
    };
    
    checkConnection();
  }, []);
  
  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // User disconnected
          setConnected(false);
          setAccount('');
          setBalance('0');
        } else {
          // Account changed
          setAccount(accounts[0]);
          setConnected(true);
          
          // Update balance
          window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
          }).then(balance => {
            setBalance(parseInt(balance, 16) / 1e18);
          });
        }
      };
      
      const handleChainChanged = (chainId) => {
        setChainId(parseInt(chainId, 16));
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);
  
  // Connect wallet
  const connectWallet = async (walletType) => {
    setLoading(true);
    setError('');
    
    try {
      if (walletType === 'metamask') {
        if (!window.ethereum) {
          throw new Error('MetaMask is not installed. Please install MetaMask to connect.');
        }
        
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setConnected(true);
        
        // Get chain ID
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(chainId, 16));
        
        // Get balance
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest']
        });
        setBalance(parseInt(balance, 16) / 1e18);
        
        return accounts[0];
      } else {
        // For demo purposes, simulate connection for other wallet types
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockAccount = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        setAccount(mockAccount);
        setConnected(true);
        setChainId(1); // Ethereum Mainnet
        setBalance(Math.random() * 10); // Random balance
        
        return mockAccount;
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Disconnect wallet
  const disconnectWallet = async () => {
    setConnected(false);
    setAccount('');
    setBalance('0');
    setChainId(null);
  };
  
  // Switch network
  const switchNetwork = async (targetChainId) => {
    if (!window.ethereum) {
      throw new Error('No Ethereum provider found');
    }
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }]
      });
    } catch (err) {
      // If the chain is not added to MetaMask
      if (err.code === 4902) {
        // Add the network (simplified, would need more parameters in a real app)
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${targetChainId.toString(16)}`,
              chainName: 'Custom Network',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://rpc-url.example'],
              blockExplorerUrls: ['https://explorer.example']
            }
          ]
        });
      } else {
        throw err;
      }
    }
  };
  
  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const value = {
    connected,
    account,
    chainId,
    balance,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    formatAddress
  };
  
  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context; 