import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { aiAPI, documentAPI } from '../utils/api';
import html2pdf from 'html2pdf.js';
import PageBackground from '../components/PageBackground';

const documentTypes = [
  { id: 'nda', name: 'Non-Disclosure Agreement (NDA)', description: 'A confidentiality agreement under Indian contract law' },
  { id: 'employment', name: 'Employment Contract', description: 'Employment agreement compliant with Indian labor laws' },
  { id: 'lease', name: 'Rental/Lease Agreement', description: 'Property rental agreement following Indian tenancy laws' },
  { id: 'terms', name: 'Terms of Service', description: 'Website/app terms of service under Indian IT Act' },
  { id: 'privacy', name: 'Privacy Policy', description: 'Privacy policy compliant with Indian data protection regulations' },
  { id: 'partnership', name: 'Partnership Deed', description: 'Partnership agreement under Indian Partnership Act, 1932' },
  { id: 'company', name: 'Memorandum of Association', description: 'For company incorporation under Companies Act, 2013' },
  { id: 'service', name: 'Service Agreement', description: 'General service contract under Indian contract law' },
  { id: 'will', name: 'Last Will & Testament', description: 'Will document according to Indian succession laws' },
  { id: 'consultancy', name: 'Consultancy Agreement', description: 'Contract for consulting services under Indian law' }
];

const DocumentGenerator = () => {
  const navigate = useNavigate();
  const { connected, account, connectWallet } = useWeb3();
  const documentRef = useRef(null);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    documentType: '',
    parameters: {}
  });
  
  const [generatedDocument, setGeneratedDocument] = useState({
    content: '',
    html: ''
  });

  // Handle document type selection
  const handleDocumentTypeSelect = (documentType) => {
    setFormData({
      ...formData,
      documentType,
      parameters: getDefaultParameters(documentType)
    });
    setStep(2);
  };
  
  // Get default parameters for document type
  const getDefaultParameters = (documentType) => {
    switch (documentType) {
      case 'nda':
        return {
          partyOne: '',
          partyTwo: '',
          effectiveDate: '',
          duration: '',
          state: '',
          confidentialInfo: '',
          purpose: ''
        };
      case 'employment':
        return {
          employerName: '',
          employeeName: '',
          position: '',
          startDate: '',
          salary: '',
          workHours: '',
          location: '',
          benefits: ''
        };
      case 'lease':
        return {
          landlordName: '',
          tenantName: '',
          propertyAddress: '',
          term: '',
          rent: '',
          securityDeposit: '',
          startDate: '',
          utilities: ''
        };
      default:
        return {};
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet. Please try again.');
    }
  };
  
  // Handle document preview
  const handlePreview = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await aiAPI.generateDocument(
        formData.documentType,
        formData.parameters
      );
      
      if (response.data && response.data.success) {
        // Format the content with proper legal styling
        const formattedContent = formatLegalDocument(response.data.data.content);
        
        setGeneratedDocument({
          content: response.data.data.content,
          html: formattedContent
        });
        setStep(3);
      } else {
        setError((response.data && response.data.message) || 'Failed to generate document. Please try again.');
      }
    } catch (err) {
      console.error('Error generating document:', err);
      setError('An error occurred while generating the document. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format legal document with proper styling
  const formatLegalDocument = (content) => {
    // Replace ** headings with proper HTML headings
    let formatted = content
      // Replace **Heading** with proper h2 headings
      .replace(/\*\*(.*?)\*\*/g, '<h2 class="text-xl font-bold my-4 text-gray-900 dark:text-gray-100">$1</h2>')
      // Replace section numbers (e.g., "1. Title") with proper styling
      .replace(/^(\d+\.\s+)(.*)$/gm, '<h3 class="text-lg font-semibold my-3 text-gray-900 dark:text-gray-100">$1$2</h3>')
      // Replace subsections (e.g., "a. Subtitle") with proper styling
      .replace(/^([a-z]\.\s+)(.*)$/gm, '<p class="font-medium my-2 text-gray-900 dark:text-gray-100">$1$2</p>')
      // Replace newlines with <br> tags
      .replace(/\n/g, '<br>');
    
    // Wrap the content in a div with legal document styling
    return `
      <div class="document-content text-gray-900 dark:text-gray-100 font-serif">
        <h1 class="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">${formData.title || `${formData.documentType.toUpperCase()} DOCUMENT`}</h1>
        <div class="legal-content">
          ${formatted}
        </div>
      </div>
    `;
  };
  
  // Handle document save
  const handleSave = async () => {
    setLoading(true);
    setError('');
    
    try {
      const documentData = {
        title: formData.title || `${formData.documentType.toUpperCase()} Document`,
        content: generatedDocument.content,
        documentType: formData.documentType,
        parameters: formData.parameters
      };
      
      const response = await documentAPI.createDocument(documentData);
      
      if (response.data && response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError((response.data && response.data.message) || 'Failed to save document. Please try again.');
      }
    } catch (err) {
      console.error('Error saving document:', err);
      setError('An error occurred while saving the document. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle PDF download
  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;
    
    const element = documentRef.current;
    const opt = {
      margin: [15, 15],
      filename: `${formData.title || 'legal-document'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    try {
      setLoading(true);
      await html2pdf().set(opt).from(element).save();
      setLoading(false);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle Word document download
  const handleDownloadWord = () => {
    if (!generatedDocument.content) return;
    
    // Create a blob with the document content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${formData.title || `${formData.documentType.toUpperCase()} DOCUMENT`}</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; }
          h1 { font-size: 16pt; text-align: center; margin-bottom: 20pt; }
          h2 { font-size: 14pt; margin-top: 15pt; margin-bottom: 10pt; }
          h3 { font-size: 12pt; font-weight: bold; margin-top: 10pt; margin-bottom: 5pt; }
          p { margin: 5pt 0; }
        </style>
      </head>
      <body>
        <h1>${formData.title || `${formData.documentType.toUpperCase()} DOCUMENT`}</h1>
        ${generatedDocument.content.replace(/\n/g, '<br>')}
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.title || 'legal-document'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Render document type selection
  const renderDocumentTypeSelection = () => {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Select Document Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documentTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => handleDocumentTypeSelect(type.id)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer transition-colors"
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{type.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{type.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render parameter form
  const renderParameterForm = () => {
    const parameters = formData.parameters;
    
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Document Details</h2>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm"
          >
            Change Document Type
          </button>
        </div>
        
        <form onSubmit={handlePreview}>
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
              Document Title
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 sm:text-sm sm:leading-6"
                placeholder="Enter a title for your document"
              />
            </div>
          </div>
          
          <div className="space-y-6">
            {Object.keys(parameters).map((key) => (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name={`parameters.${key}`}
                    id={key}
                    value={parameters[key]}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 sm:text-sm sm:leading-6"
                    placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {error && (
            <div className="mt-6 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate Document'}
            </button>
          </div>
        </form>
      </div>
    );
  };
  
  // Render document preview
  const renderDocumentPreview = () => {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Document Preview</h2>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm"
          >
            Edit Parameters
          </button>
        </div>
        
        <div 
          ref={documentRef}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6 prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100"
          dangerouslySetInnerHTML={{ __html: generatedDocument.html }}
        />
        
        {error && (
          <div className="mt-6 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mt-6 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md">
            Document saved successfully! Redirecting to dashboard...
          </div>
        )}
        
        <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={loading}
            className="inline-flex justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download PDF
          </button>
          
          <button
            type="button"
            onClick={handleDownloadWord}
            disabled={loading}
            className="inline-flex justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download Word
          </button>
          
          {connected ? (
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Document'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConnectWallet}
              className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Connect Wallet to Save
            </button>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <PageBackground>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Document Generator</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Generate legally compliant documents tailored to Indian law with our AI-powered document generator.
        </p>
        
        <div className="mb-8">
          <ol role="list" className="flex items-center">
            <li className="relative flex flex-col items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'} text-white`}>
                <span>1</span>
              </div>
              <div className={`mt-2 text-sm font-medium ${step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                Select Type
              </div>
              <div className="absolute top-4 left-full w-12 h-0.5 bg-gray-300 dark:bg-gray-700"></div>
            </li>
            <li className="relative flex flex-col items-center mx-16">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'} text-white`}>
                <span>2</span>
              </div>
              <div className={`mt-2 text-sm font-medium ${step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                Enter Details
              </div>
              <div className="absolute top-4 left-full w-12 h-0.5 bg-gray-300 dark:bg-gray-700"></div>
              <div className="absolute top-4 right-full w-12 h-0.5 bg-gray-300 dark:bg-gray-700"></div>
            </li>
            <li className="relative flex flex-col items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'} text-white`}>
                <span>3</span>
              </div>
              <div className={`mt-2 text-sm font-medium ${step >= 3 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                Review & Save
              </div>
              <div className="absolute top-4 right-full w-12 h-0.5 bg-gray-300 dark:bg-gray-700"></div>
            </li>
          </ol>
        </div>
        
        {step === 1 && renderDocumentTypeSelection()}
        {step === 2 && renderParameterForm()}
        {step === 3 && renderDocumentPreview()}
      </div>
    </PageBackground>
  );
};

export default DocumentGenerator; 