import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { daoAPI } from '../utils/api';
import { useWeb3 } from '../contexts/Web3Context';
import PageBackground from '../components/PageBackground';

const DAODashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, connectWallet } = useWeb3();
  
  const [dao, setDao] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New proposal form
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    title: '',
    description: '',
    actions: ''
  });
  
  useEffect(() => {
    const fetchDAOData = async () => {
      try {
        // Fetch DAO details
        const daoResult = await daoAPI.getDAO(id);
        
        if (daoResult.success) {
          setDao(daoResult.data);
          
          // Fetch proposals
          const proposalsResult = await daoAPI.getDAOProposals(id);
          if (proposalsResult.success) {
            setProposals(proposalsResult.data);
          }
          
          // Fetch members
          const membersResult = await daoAPI.getDAOMembers(id);
          if (membersResult.success) {
            setMembers(membersResult.data);
          }
        } else {
          setError('Failed to load DAO');
        }
      } catch (error) {
        console.error('Error fetching DAO data:', error);
        setError('An error occurred while loading the DAO');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDAOData();
  }, [id]);
  
  // Handle proposal form input changes
  const handleProposalInputChange = (e) => {
    const { name, value } = e.target;
    setProposalForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle proposal form submission
  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }
    
    try {
      const result = await daoAPI.createProposal(id, {
        ...proposalForm,
        creatorAddress: account
      });
      
      if (result.success) {
        // Add new proposal to the list
        setProposals(prev => [result.data, ...prev]);
        
        // Reset form and hide it
        setProposalForm({
          title: '',
          description: '',
          actions: ''
        });
        setShowProposalForm(false);
      } else {
        alert(result.message || 'Failed to create proposal');
      }
    } catch (error) {
      console.error('Error creating proposal:', error);
      alert('An error occurred while creating the proposal');
    }
  };
  
  // Handle vote on proposal
  const handleVote = async (proposalId, vote) => {
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }
    
    try {
      const result = await daoAPI.voteOnProposal(id, proposalId, {
        voterAddress: account,
        vote
      });
      
      if (result.success) {
        // Update the proposal in the list
        setProposals(prev => 
          prev.map(p => 
            p.id === proposalId ? result.data : p
          )
        );
      } else {
        alert(result.message || 'Failed to vote on proposal');
      }
    } catch (error) {
      console.error('Error voting on proposal:', error);
      alert('An error occurred while voting on the proposal');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white shadow rounded-lg p-6 max-w-lg w-full">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mt-2 text-xl font-semibold text-gray-900">Error Loading DAO</h2>
            <p className="mt-2 text-gray-500">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!dao) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white shadow rounded-lg p-6 max-w-lg w-full">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="mt-2 text-xl font-semibold text-gray-900">DAO Not Found</h2>
            <p className="mt-2 text-gray-500">The DAO you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Check if user is a member
  const isMember = members.some(member => member.address === account);
  
  return (
    <PageBackground>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        ) : dao ? (
          <div className="bg-gray-50 min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
              {/* DAO Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{dao.name}</h1>
                    <p className="mt-1 text-sm text-gray-500">
                      Created on {new Date(dao.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {!account ? (
                    <button
                      onClick={connectWallet}
                      className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Connect Wallet
                    </button>
                  ) : !isMember ? (
                    <div className="text-sm text-gray-500">
                      You are not a member of this DAO
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowProposalForm(true)}
                      className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New Proposal
                    </button>
                  )}
                </div>
                
                <div className="mt-4 bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">About</h2>
                  <p className="text-gray-500">{dao.description}</p>
                  
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Token</h3>
                      <p className="mt-1 text-sm text-gray-900">{dao.tokenName} ({dao.tokenSymbol})</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Voting Period</h3>
                      <p className="mt-1 text-sm text-gray-900">{dao.votingPeriod} days</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Quorum</h3>
                      <p className="mt-1 text-sm text-gray-900">{dao.quorumPercentage}%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* New Proposal Form */}
              {showProposalForm && (
                <div className="mb-8 bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Create New Proposal</h2>
                    <button
                      onClick={() => setShowProposalForm(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <form onSubmit={handleProposalSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                          Title
                        </label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={proposalForm.title}
                          onChange={handleProposalInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={3}
                          value={proposalForm.description}
                          onChange={handleProposalInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="actions" className="block text-sm font-medium text-gray-700">
                          Actions
                        </label>
                        <textarea
                          id="actions"
                          name="actions"
                          rows={3}
                          value={proposalForm.actions}
                          onChange={handleProposalInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="Describe the actions this proposal will take if passed"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowProposalForm(false)}
                        className="mr-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Create Proposal
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Proposals */}
                <div className="lg:col-span-2">
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900">Proposals</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Vote on proposals to govern the DAO
                      </p>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {proposals.length === 0 ? (
                        <div className="px-4 py-5 sm:px-6 text-center">
                          <p className="text-gray-500">No proposals yet</p>
                          {isMember && (
                            <button
                              onClick={() => setShowProposalForm(true)}
                              className="mt-2 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              Create the first proposal
                              <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ) : (
                        proposals.map((proposal) => (
                          <div key={proposal.id} className="px-4 py-5 sm:px-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-base font-medium text-gray-900">{proposal.title}</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  Proposed by {proposal.creatorAddress === account ? 'you' : proposal.creatorAddress}
                                </p>
                                <p className="mt-2 text-sm text-gray-500">{proposal.description}</p>
                                
                                <div className="mt-2">
                                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    proposal.status === 'active' ? 'bg-green-100 text-green-800' :
                                    proposal.status === 'passed' ? 'bg-blue-100 text-blue-800' :
                                    proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                                  </span>
                                </div>
                              </div>
                              
                              {proposal.status === 'active' && isMember && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleVote(proposal.id, 'for')}
                                    className="inline-flex items-center rounded-md border border-transparent bg-green-100 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                    For
                                  </button>
                                  <button
                                    onClick={() => handleVote(proposal.id, 'against')}
                                    className="inline-flex items-center rounded-md border border-transparent bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                    Against
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            {/* Voting Progress */}
                            {proposal.votesFor !== undefined && proposal.votesAgainst !== undefined && (
                              <div className="mt-4">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                  <span>For: {proposal.votesFor}</span>
                                  <span>Against: {proposal.votesAgainst}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="bg-indigo-600 h-2.5 rounded-full"
                                    style={{ width: `${proposal.votesFor / (proposal.votesFor + proposal.votesAgainst) * 100 || 0}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Members */}
                <div>
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900">Members</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {members.length} {members.length === 1 ? 'member' : 'members'}
                      </p>
                    </div>
                    
                    <ul className="divide-y divide-gray-200">
                      {members.map((member) => (
                        <li key={member.address} className="px-4 py-3 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="truncate">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {member.address === account ? 'You' : member.address}
                              </p>
                              <p className="text-xs text-gray-500">
                                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                              </p>
                            </div>
                            
                            {member.address === account && (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                You
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">DAO not found</p>
          </div>
        )}
      </div>
    </PageBackground>
  );
};

export default DAODashboard; 