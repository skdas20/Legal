import React from 'react';
import TypingEffect from './TypingEffect';

const ReasoningDisplay = ({ query, isVisible }) => {
  if (!isVisible) return null;
  
  // Generate reasoning steps based on the query
  const generateReasoningSteps = (query) => {
    const cleanQuery = query.toLowerCase().trim();
    
    // Default reasoning steps
    let steps = [
      "Analyzing user query...",
      "Identifying legal context and jurisdiction (India)...",
      "Searching relevant Indian legal statutes and case law...",
      "Formulating response based on Indian legal framework..."
    ];
    
    // Add specific reasoning based on query content
    if (cleanQuery.includes("arrest") || cleanQuery.includes("police")) {
      steps.splice(2, 0, "Referencing Criminal Procedure Code, 1973 and relevant Supreme Court judgments...");
    } else if (cleanQuery.includes("divorce") || cleanQuery.includes("marriage")) {
      steps.splice(2, 0, "Analyzing applicable personal laws (Hindu Marriage Act/Muslim Personal Law/Special Marriage Act)...");
    } else if (cleanQuery.includes("property") || cleanQuery.includes("inheritance")) {
      steps.splice(2, 0, "Examining property laws and succession acts applicable in India...");
    } else if (cleanQuery.includes("company") || cleanQuery.includes("business")) {
      steps.splice(2, 0, "Reviewing Companies Act, 2013 and related corporate regulations...");
    } else if (cleanQuery.includes("tax") || cleanQuery.includes("gst")) {
      steps.splice(2, 0, "Consulting Income Tax Act, 1961 and GST legislation...");
    }
    
    return steps;
  };
  
  const reasoningSteps = generateReasoningSteps(query);
  
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-3 text-sm">
      <div className="font-medium text-indigo-600 dark:text-indigo-400 mb-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        Reasoning Process
      </div>
      <div className="space-y-2 text-gray-700 dark:text-gray-300">
        {reasoningSteps.map((step, index) => (
          <div key={index} className="flex items-start">
            <div className="min-w-[20px] mr-2">{index + 1}.</div>
            <div><TypingEffect text={step} speed={20} /></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReasoningDisplay; 