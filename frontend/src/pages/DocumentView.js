import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentAPI } from '../utils/api';
import { useWeb3 } from '../contexts/Web3Context';
import PageBackground from '../components/PageBackground';

const DocumentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account } = useWeb3();
  
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const result = await documentAPI.getDocument(id);
        
        if (result.success) {
          setDocument(result.data);
        } else {
          setError('Failed to load document');
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        setError('An error occurred while loading the document');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocument();
  }, [id]);
  
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([document.content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${document.title || 'document'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };
  
  if (loading) {
    return (
      <PageBackground>
        <div className="min-h-screen flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </PageBackground>
    );
  }
  
  if (error) {
    return (
      <PageBackground>
        <div className="min-h-screen flex flex-col justify-center items-center px-4">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">Error</h2>
            <p className="text-gray-700 dark:text-gray-300">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </PageBackground>
    );
  }
  
  if (!document) {
    return (
      <PageBackground>
        <div className="min-h-screen flex flex-col justify-center items-center px-4">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Document Not Found</h2>
            <p className="text-gray-700 dark:text-gray-300">The document you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </PageBackground>
    );
  }
  
  return (
    <PageBackground>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{document.title}</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  {document.documentType.charAt(0).toUpperCase() + document.documentType.slice(1)} Document
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Download
                </button>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Share
                </button>
              </div>
            </div>
            
            {/* Document Metadata */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created by</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {document.createdBy === account ? 'You' : document.createdBy}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created at</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {new Date(document.createdAt).toLocaleString()}
                  </dd>
                </div>
                {document.ipfsHash && (
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">IPFS Hash</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                      <a 
                        href={`https://ipfs.io/ipfs/${document.ipfsHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        {document.ipfsHash}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
            
            {/* Document Content */}
            <div className="px-4 py-5 sm:p-6">
              <div className="prose dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-md text-sm">
                  {document.content}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
};

export default DocumentView; 