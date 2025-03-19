// src/components/ContractReviewer.jsx

import React, { useState, useRef } from 'react';
import { aiAPI, directGeminiAPI, legalBertAPI } from '../utils/api';
import PageBackground from '../components/PageBackground';

const ContractReviewer = () => {
  const [contractText, setContractText] = useState('');
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [inputMethod, setInputMethod] = useState('text'); // 'text' or 'image'
  const [extractedText, setExtractedText] = useState('');
  const [showExtractedText, setShowExtractedText] = useState(false);
  const fileInputRef = useRef(null);

  // Handle contract text change
  const handleTextChange = (e) => {
    setContractText(e.target.value);
  };

  // Convert image to base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const base64String = reader.result;
          if (!base64String || typeof base64String !== 'string') {
            reject(new Error('Invalid image data'));
            return;
          }
          resolve(base64String);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }
    
    try {
      const base64Image = await convertImageToBase64(file);
      setUploadedImage(base64Image);
      setError('');
    } catch (err) {
      console.error('Error converting image:', err);
      setError('Failed to process the image. Please try again.');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setReview(null);
    setLoading(true);

    try {
      let response;

      if (inputMethod === 'text') {
        if (!contractText.trim()) {
          setError('Please enter contract text');
          setLoading(false);
          return;
        }
        
        try {
          // First try the backend API
          response = await aiAPI.reviewContract(contractText);
        } catch (backendError) {
          console.error('Backend API failed, trying direct Gemini API:', backendError);
          try {
            // If backend fails, try direct Gemini API
            response = await directGeminiAPI.reviewContractText(contractText);
          } catch (geminiError) {
            console.error('Direct Gemini API failed, trying Hugging Face API:', geminiError);
            // If Gemini API fails, try Hugging Face API
            response = await legalBertAPI.reviewContractText(contractText);
          }
        }
      } else {
        if (!uploadedImage) {
          setError('Please upload an image');
          setLoading(false);
          return;
        }
        
        try {
          // First try the backend API
          response = await aiAPI.reviewContractImage(uploadedImage);
        } catch (backendError) {
          console.error('Backend API failed, trying direct API:', backendError);
          // If backend fails, try direct API
          response = await directGeminiAPI.reviewContractImage(uploadedImage);
        }
      }

      if (response.data && response.data.success) {
        setReview(response.data.data);
        if (response.data.data.extractedText) {
          setExtractedText(response.data.data.extractedText);
        }
      } else {
        setError((response.data && response.data.message) || 'Failed to review contract. Please try again.');
      }
    } catch (err) {
      console.error('Error reviewing contract:', err);
      setError('An error occurred while reviewing the contract. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load sample contract
  const loadSampleContract = () => {
    const sampleContract = `RENTAL AGREEMENT

THIS RENTAL AGREEMENT (the "Agreement") is made and entered into this 15th day of March, 2023, by and between:

LANDLORD: Rajesh Kumar, residing at 123 Main Street, Delhi, India ("Landlord")

AND

TENANT: Amit Singh, residing at 456 Park Avenue, Delhi, India ("Tenant")

WITNESSETH:

WHEREAS, Landlord is the owner of certain real property being, lying and situated in Delhi, India, such real property having a street address of 789 Residential Complex, Apartment 4B, Delhi, India (the "Premises").

WHEREAS, Landlord desires to lease the Premises to Tenant upon the terms and conditions as contained herein; and

WHEREAS, Tenant desires to lease the Premises from Landlord on the terms and conditions as contained herein;

NOW, THEREFORE, for and in consideration of the covenants and obligations contained herein and other good and valuable consideration, the receipt and sufficiency of which is hereby acknowledged, the parties hereto agree as follows:

1. TERM. Landlord leases to Tenant and Tenant leases from Landlord the Premises for a term of 11 months, commencing on April 1, 2023, and ending on February 29, 2024.

2. RENT. The total rent for the term of this Agreement is INR 2,75,000 (Indian Rupees Two Lakh Seventy-Five Thousand Only), payable in monthly installments of INR 25,000 (Indian Rupees Twenty-Five Thousand Only). Rent shall be payable in advance on the 1st day of each month during the term of this Agreement.

3. SECURITY DEPOSIT. Upon the execution of this Agreement, Tenant shall deposit with Landlord the sum of INR 50,000 (Indian Rupees Fifty Thousand Only) as security for any damage caused to the Premises during the term hereof. Such deposit shall be returned to Tenant, without interest, and less any set-off for damages to the Premises, upon the termination of this Agreement.

4. USE OF PREMISES. The Premises shall be used and occupied by Tenant exclusively as a private residence and for no other purpose without the prior written consent of Landlord.

5. CONDITION OF PREMISES. Tenant stipulates, represents, and warrants that Tenant has examined the Premises, and that they are at the time of this Agreement in good order, repair, and in a safe, clean, and tenantable condition.

IN WITNESS WHEREOF, the parties have executed this Agreement on the date first above written.

________________________
LANDLORD: Rajesh Kumar

________________________
TENANT: Amit Singh`;
    
    setContractText(sampleContract);
    setInputMethod('text');
    setUploadedImage(null);
  };

  // Render review results
  const renderReview = () => {
    if (!review) return null;
  
    return (
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-xl p-6 mt-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contract Analysis</h2>
        
        {inputMethod === 'image' && review.ocrStatus && (
          <div className={`mb-6 p-4 rounded-md ${
            review.ocrStatus === 'complete' 
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
              : review.ocrStatus === 'partial'
              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
              : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
          }`}>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${
                review.ocrStatus === 'complete' 
                  ? 'text-green-500'
                  : review.ocrStatus === 'partial'
                  ? 'text-yellow-500'
                  : 'text-red-500'
              }`} viewBox="0 0 20 20" fill="currentColor">
                {review.ocrStatus === 'complete' ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                ) : review.ocrStatus === 'partial' ? (
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                )}
              </svg>
              <span className="font-medium">
                {review.ocrStatus === 'complete' 
                  ? 'Text extraction completed successfully'
                  : review.ocrStatus === 'partial'
                  ? 'Partial text extraction completed'
                  : 'Text extraction failed'}
              </span>
            </div>
            {review.ocrWarning && (
              <p className="mt-2 text-sm">{review.ocrWarning}</p>
            )}
          </div>
        )}
        
        {review.summary && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Summary</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{review.summary}</p>
          </div>
        )}
        
        {review.risks && review.risks.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Potential Risks</h3>
            <ul className="list-disc pl-5 space-y-2">
              {review.risks.map((risk, index) => (
                <li key={index} className="text-red-600 dark:text-red-400">
                  <span className="text-gray-700 dark:text-gray-300">{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {review.clarifications && review.clarifications.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Clarifications Needed</h3>
            <ul className="list-disc pl-5 space-y-2">
              {review.clarifications.map((item, index) => (
                <li key={index} className="text-yellow-600 dark:text-yellow-400">
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {review.bestPractices && review.bestPractices.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Best Practices</h3>
            <ul className="list-disc pl-5 space-y-2">
              {review.bestPractices.map((practice, index) => (
                <li key={index} className="text-green-600 dark:text-green-400">
                  <span className="text-gray-700 dark:text-gray-300">{practice}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {review.finalAdvice && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Final Advice</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{review.finalAdvice}</p>
          </div>
        )}
        
        {extractedText && inputMethod === 'image' && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Extracted Text</h3>
              <button
                onClick={() => setShowExtractedText(!showExtractedText)}
                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm"
              >
                {showExtractedText ? 'Hide' : 'Show'} Extracted Text
              </button>
            </div>
            {showExtractedText && (
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{extractedText}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <PageBackground>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Contract Reviewer</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Upload a contract or paste text to get an AI-powered legal analysis based on Indian law.
          </p>
          
          <div className="mb-6">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setInputMethod('text')}
                className={`px-4 py-2 rounded-md ${
                  inputMethod === 'text'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                Text Input
              </button>
              <button
                onClick={() => setInputMethod('image')}
                className={`px-4 py-2 rounded-md ${
                  inputMethod === 'image'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                Image Upload
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {inputMethod === 'text' ? (
                <div className="mb-4">
                  <textarea
                    value={contractText}
                    onChange={handleTextChange}
                    placeholder="Paste your contract text here..."
                    className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={loadSampleContract}
                      className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Load Sample Contract
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 text-center">
                    {uploadedImage ? (
                      <div className="relative w-full h-full">
                        <img
                          src={uploadedImage}
                          alt="Uploaded contract"
                          className="max-h-full max-w-full mx-auto object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setUploadedImage(null)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">Click or drag and drop to upload a contract image</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, or PDF up to 5MB</p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current.click()}
                          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Select File
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading || (inputMethod === 'text' && !contractText.trim()) || (inputMethod === 'image' && !uploadedImage)}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Analyzing...' : 'Review Contract'}
              </button>
            </form>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>
              Our AI will analyze your contract based on Indian legal principles and provide insights on potential risks, 
              clarifications needed, and best practices.
            </p>
          </div>
        </div>
        
        {loading && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6 mt-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Analyzing your contract...</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">This may take up to a minute for complex contracts.</p>
          </div>
        )}
        
        {!loading && renderReview()}
      </div>
    </PageBackground>
  );
};

export default ContractReviewer; 
