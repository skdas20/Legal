import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { daoAPI } from '../utils/api';
import PageBackground from '../components/PageBackground';

const DAOCreator = () => {
  const navigate = useNavigate();
  const { account, connectWallet } = useWeb3();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tokenName: '',
    tokenSymbol: '',
    votingPeriod: 3,
    quorumPercentage: 51,
    proposalThreshold: 1
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: name === 'votingPeriod' || name === 'quorumPercentage' || name === 'proposalThreshold' 
        ? parseInt(value) 
        : value
    }));
  };
  
  const validateStep1 = () => {
    if (!formData.name.trim()) return "DAO name is required";
    if (!formData.description.trim()) return "Description is required";
    return "";
  };
  
  const validateStep2 = () => {
    if (!formData.tokenName.trim()) return "Token name is required";
    if (!formData.tokenSymbol.trim()) return "Token symbol is required";
    if (formData.tokenSymbol.length > 5) return "Token symbol should be 5 characters or less";
    return "";
  };
  
  const nextStep = () => {
    let error = '';
    
    if (step === 1) {
      error = validateStep1();
    } else if (step === 2) {
      error = validateStep2();
    }
    
    if (error) {
      setError(error);
      return;
    }
    
    setError('');
    setStep(prevStep => prevStep + 1);
  };
  
  const prevStep = () => {
    setError('');
    setStep(prevStep => prevStep - 1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Create DAO in database
      const response = await daoAPI.createDAO(formData);
      
      // Update with blockchain info (in a real app, this would interact with the blockchain)
      // For demo purposes, we're simulating this with a timeout
      setTimeout(async () => {
        const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
        setTransactionHash(mockTxHash);
        
        await daoAPI.updateDAOBlockchain(
          response.data._id, 
          {
            contractAddress: '0x' + Math.random().toString(16).substr(2, 40),
            transactionHash: mockTxHash,
            creatorAddress: account
          }
        );
        
        setSuccess(true);
        setLoading(false);
      }, 2000);
      
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to create DAO');
      console.error('Error creating DAO:', err);
    }
  };
  
  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">DAO Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="My Awesome DAO"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Describe the purpose of your DAO"
        />
      </div>
    </div>
  );
  
  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Token Name</label>
        <input
          type="text"
          name="tokenName"
          value={formData.tokenName}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="MyToken"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Token Symbol</label>
        <input
          type="text"
          name="tokenSymbol"
          value={formData.tokenSymbol}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="MTK"
        />
        <p className="mt-1 text-sm text-gray-500">Maximum 5 characters</p>
      </div>
    </div>
  );
  
  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Voting Period (days)</label>
        <input
          type="number"
          name="votingPeriod"
          value={formData.votingPeriod}
          onChange={handleChange}
          min={1}
          max={30}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Quorum Percentage</label>
        <input
          type="number"
          name="quorumPercentage"
          value={formData.quorumPercentage}
          onChange={handleChange}
          min={1}
          max={100}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        <p className="mt-1 text-sm text-gray-500">Percentage of token holders required to vote for a proposal to pass</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Proposal Threshold</label>
        <input
          type="number"
          name="proposalThreshold"
          value={formData.proposalThreshold}
          onChange={handleChange}
          min={1}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        <p className="mt-1 text-sm text-gray-500">Minimum number of tokens required to submit a proposal</p>
      </div>
    </div>
  );
  
  const renderStep4 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Review DAO Details</h3>
      
      <div className="bg-gray-50 p-4 rounded-md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">DAO Name</p>
            <p className="mt-1">{formData.name}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Token</p>
            <p className="mt-1">{formData.tokenName} ({formData.tokenSymbol})</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Voting Period</p>
            <p className="mt-1">{formData.votingPeriod} days</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Quorum</p>
            <p className="mt-1">{formData.quorumPercentage}%</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Proposal Threshold</p>
            <p className="mt-1">{formData.proposalThreshold} tokens</p>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-500">Description</p>
          <p className="mt-1">{formData.description}</p>
        </div>
      </div>
      
      {!account && (
        <div className="mt-4">
          <button
            type="button"
            onClick={connectWallet}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Connect Wallet to Continue
          </button>
        </div>
      )}
    </div>
  );
  
  const renderSuccess = () => (
    <div className="text-center py-8">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="mt-2 text-lg font-medium text-gray-900">DAO Created Successfully!</h3>
      <p className="mt-1 text-sm text-gray-500">
        Your DAO has been created and is being deployed to the blockchain.
      </p>
      
      {transactionHash && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700">Transaction Hash:</p>
          <p className="mt-1 text-xs text-gray-500 break-all">{transactionHash}</p>
        </div>
      )}
      
      <div className="mt-6 flex justify-center space-x-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Go to Dashboard
        </button>
        <button
          type="button"
          onClick={() => {
            setFormData({
              name: '',
              description: '',
              tokenName: '',
              tokenSymbol: '',
              votingPeriod: 3,
              quorumPercentage: 51,
              proposalThreshold: 1
            });
            setStep(1);
            setSuccess(false);
            setTransactionHash('');
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Another DAO
        </button>
      </div>
    </div>
  );
  
  const renderStepContent = () => {
    if (success) return renderSuccess();
    
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };
  
  const renderStepIndicator = () => {
    if (success) return null;
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-col items-center">
              <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
                step >= stepNumber ? 'bg-indigo-600' : 'bg-gray-200'
              }`}>
                <span className={`text-sm font-medium ${
                  step >= stepNumber ? 'text-white' : 'text-gray-500'
                }`}>
                  {stepNumber}
                </span>
              </div>
              <span className="mt-1 text-xs text-gray-500">
                {stepNumber === 1 && 'Basics'}
                {stepNumber === 2 && 'Token'}
                {stepNumber === 3 && 'Governance'}
                {stepNumber === 4 && 'Review'}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between">
          <div className="h-1 w-1/3 bg-indigo-600"></div>
          <div className={`h-1 w-1/3 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
          <div className={`h-1 w-1/3 ${step >= 4 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
        </div>
      </div>
    );
  };
  
  return (
    <PageBackground>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create a Legal DAO</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Set up a Decentralized Autonomous Organization for legal collaboration
            </p>
          </div>
          
          {renderStepIndicator()}
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow overflow-hidden sm:rounded-md p-6">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </PageBackground>
  );
};

export default DAOCreator; 