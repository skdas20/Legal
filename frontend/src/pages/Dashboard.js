import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { documentAPI, daoAPI } from '../utils/api';
import PageBackground from '../components/PageBackground';
import ThreeDChart from '../components/ThreeDChart';
import StatsCard from '../components/StatsCard';
import ActivityTimeline from '../components/ActivityTimeline';

const Dashboard = () => {
  const { user } = useAuth();
  const { connected, account, connectWallet } = useWeb3();
  
  const [documents, setDocuments] = useState([]);
  const [daos, setDaos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [activities, setActivities] = useState([]);
  
  // Fetch user documents and DAOs
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch documents
        const documentsResult = await documentAPI.getUserDocuments();
        if (documentsResult.success) {
          setDocuments(documentsResult.data);
        }
        
        // Fetch DAOs
        const daosResult = await daoAPI.getUserDAOs();
        if (daosResult.success) {
          setDaos(daosResult.data);
        }
        
        // Generate mock activities
        generateMockActivities();
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Generate mock activities for demo purposes
  const generateMockActivities = () => {
    const mockActivities = [
      {
        id: 1,
        type: 'document',
        title: 'Created a new NDA document',
        time: '2 hours ago',
        description: 'Non-Disclosure Agreement for Project Alpha',
        action: {
          label: 'View',
          onClick: () => console.log('View document')
        }
      },
      {
        id: 2,
        type: 'dao',
        title: 'Joined LegalTech DAO',
        time: 'Yesterday',
        description: 'A decentralized organization focused on legal technology innovation'
      },
      {
        id: 3,
        type: 'proposal',
        title: 'Created a new proposal',
        time: '3 days ago',
        description: 'Proposal to update the governance rules for better decision making'
      },
      {
        id: 4,
        type: 'vote',
        title: 'Voted on proposal #42',
        time: '1 week ago'
      },
      {
        id: 5,
        type: 'document',
        title: 'Updated Employment Contract',
        time: '2 weeks ago',
        description: 'Added new clauses for remote work arrangements'
      }
    ];
    
    setActivities(mockActivities);
  };
  
  // Chart data for documents by type
  const documentsByTypeData = [
    { label: 'NDA', value: documents.filter(doc => doc.documentType === 'nda').length || 2 },
    { label: 'Employment', value: documents.filter(doc => doc.documentType === 'employment').length || 1 },
    { label: 'Lease', value: documents.filter(doc => doc.documentType === 'lease').length || 3 },
    { label: 'Terms', value: documents.filter(doc => doc.documentType === 'terms').length || 1 },
    { label: 'Privacy', value: documents.filter(doc => doc.documentType === 'privacy').length || 2 }
  ];
  
  // Chart data for DAO participation
  const daoParticipationData = [
    { label: 'Owner', value: daos.filter(dao => dao.role === 'owner').length || 1 },
    { label: 'Member', value: daos.filter(dao => dao.role === 'member').length || 2 },
    { label: 'Contributor', value: daos.filter(dao => dao.role === 'contributor').length || 1 }
  ];
  
  // Render stats cards
  const renderStatsCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
        <StatsCard
          title="Total Documents"
          value={documents.length || 9}
          change="12%"
          changeType="increase"
          color="indigo"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          isLoading={loading}
        />
        
        <StatsCard
          title="DAOs Joined"
          value={daos.length || 4}
          change="25%"
          changeType="increase"
          color="emerald"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          isLoading={loading}
        />
        
        <StatsCard
          title="Proposals Created"
          value={7}
          change="5%"
          changeType="increase"
          color="amber"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          isLoading={loading}
        />
        
        <StatsCard
          title="Votes Cast"
          value={12}
          change="8%"
          changeType="decrease"
          color="blue"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
          isLoading={loading}
        />
      </div>
    );
  };
  
  // Render tab navigation
  const renderTabs = () => {
    const tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'documents', label: 'Documents' },
      { id: 'daos', label: 'DAOs' },
      { id: 'activity', label: 'Activity' }
    ];
    
    return (
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    );
  };
  
  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'documents':
        return renderDocumentsTab();
      case 'daos':
        return renderDaosTab();
      case 'activity':
        return renderActivityTab();
      default:
        return renderOverviewTab();
    }
  };
  
  // Render overview tab content
  const renderOverviewTab = () => {
  return (
      <div className="animate-fade-in">
        {renderStatsCards()}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 mt-48">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Documents by Type</h3>
            <div className="h-80">
              <ThreeDChart data={documentsByTypeData} type="bar" height={300} />
                </div>
              </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">DAO Participation</h3>
            <div className="h-80">
              <ThreeDChart data={daoParticipationData} type="pie" height={300} />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <ActivityTimeline activities={activities.slice(0, 3)} isLoading={loading} />
            {activities.length > 3 && (
              <div className="mt-4 text-center">
              <button
                  onClick={() => setActiveTab('activity')}
                  className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
              >
                  View all activity
              </button>
            </div>
          )}
        </div>
        
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-4">
            <Link
              to="/document-generator"
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 text-center"
              >
                Create Document
            </Link>
            <Link
              to="/contract-reviewer"
                className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 text-center"
            >
                Review Contract
            </Link>
            <Link
              to="/dao-creator"
                className="block w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 text-center"
            >
                Create DAO
            </Link>
            <Link
              to="/legal-chatbot"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 text-center"
              >
                Legal Assistant
            </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render documents tab content
  const renderDocumentsTab = () => {
    return (
      <div className="animate-fade-in">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your Documents</h3>
            <Link
              to="/document-generator"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create New
            </Link>
          </div>
          
          {loading ? (
            <div className="px-4 py-5 sm:p-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="rounded-md bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : documents && documents.length > 0 ? (
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {documents.map((document, index) => (
                  <li 
                    key={document._id || index} 
                    className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                  >
                    <Link to={`/document/${document._id}`} className="flex items-center">
                      <div className="min-w-0 flex-1 flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-md bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 px-4">
                          <div>
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{document.title}</p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                              {document.documentType.charAt(0).toUpperCase() + document.documentType.slice(1)} • Created on {new Date(document.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                        </Link>
                  </li>
                  ))}
              </ul>
            </div>
          ) : (
            <div className="px-4 py-5 sm:p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't created any documents yet.</p>
                <Link
                  to="/document-generator"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                Create Your First Document
                </Link>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render DAOs tab content
  const renderDaosTab = () => {
    return (
      <div className="animate-fade-in">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your DAOs</h3>
            <Link
              to="/dao-creator"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create New
            </Link>
          </div>
          
          {loading ? (
            <div className="px-4 py-5 sm:p-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : daos && daos.length > 0 ? (
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {daos.map((dao, index) => (
                  <li 
                    key={dao._id || index} 
                    className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                  >
                    <Link to={`/dao/${dao._id}`} className="flex items-center">
                      <div className="min-w-0 flex-1 flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 px-4">
                          <div>
                            <p className="text-sm font-medium text-purple-600 dark:text-purple-400 truncate">{dao.name}</p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                              {dao.memberCount || 'Multiple'} members • {dao.role && dao.role.charAt(0).toUpperCase() + dao.role.slice(1)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </Link>
                  </li>
              ))}
              </ul>
            </div>
          ) : (
            <div className="px-4 py-5 sm:p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't created or joined any DAOs yet.</p>
                <Link
                  to="/dao-creator"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                Create Your First DAO
                </Link>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render activity tab content
  const renderActivityTab = () => {
    return (
      <div className="animate-fade-in">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Activity Timeline</h3>
          <ActivityTimeline activities={activities} isLoading={loading} />
      </div>
    </div>
    );
  };
  
  return (
    <PageBackground>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Welcome to DigiLex, your AI-powered legal assistant platform
          </p>
        </div>
        
        {renderTabs()}
        {renderTabContent()}
      </div>
    </PageBackground>
  );
};

export default Dashboard; 