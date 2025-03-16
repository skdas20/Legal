const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to generate legal documents
const generateLegalDocument = async (documentType, parameters) => {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Create prompt based on document type
    let prompt = '';
    
    switch (documentType) {
      case 'NDA':
        prompt = `Generate a Non-Disclosure Agreement (NDA) with the following details:
          - Party A: ${parameters.partyA}
          - Party B: ${parameters.partyB}
          - Effective Date: ${parameters.effectiveDate}
          - Purpose: ${parameters.purpose}
          - Confidential Information Definition: ${parameters.confidentialInfoDefinition}
          - Term: ${parameters.term}
          - Governing Law: ${parameters.governingLaw}
          
          Please format this as a professional legal document with proper sections, clauses, and signature blocks.`;
        break;
        
      case 'Employment Contract':
        prompt = `Generate an Employment Contract with the following details:
          - Employer: ${parameters.employer}
          - Employee: ${parameters.employee}
          - Position: ${parameters.position}
          - Start Date: ${parameters.startDate}
          - Salary: ${parameters.salary}
          - Benefits: ${parameters.benefits}
          - Working Hours: ${parameters.workingHours}
          - Term: ${parameters.term}
          - Termination Conditions: ${parameters.terminationConditions}
          - Governing Law: ${parameters.governingLaw}
          
          Please format this as a professional legal document with proper sections, clauses, and signature blocks.`;
        break;
        
      case 'Lease Agreement':
        prompt = `Generate a Lease Agreement with the following details:
          - Landlord: ${parameters.landlord}
          - Tenant: ${parameters.tenant}
          - Property Address: ${parameters.propertyAddress}
          - Lease Term: ${parameters.leaseTerm}
          - Monthly Rent: ${parameters.monthlyRent}
          - Security Deposit: ${parameters.securityDeposit}
          - Utilities: ${parameters.utilities}
          - Pets Policy: ${parameters.petsPolicy}
          - Governing Law: ${parameters.governingLaw}
          
          Please format this as a professional legal document with proper sections, clauses, and signature blocks.`;
        break;
        
      default:
        prompt = `Generate a legal document of type ${documentType} with the following parameters: ${JSON.stringify(parameters)}. Please format this as a professional legal document with proper sections, clauses, and signature blocks.`;
    }
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error generating legal document:', error);
    throw new Error('Failed to generate legal document');
  }
};

// Function to review smart contracts
const reviewSmartContract = async (contractCode) => {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Create prompt for contract review
    const prompt = `Review the following Solidity smart contract for potential security vulnerabilities, best practices, and optimization opportunities:
    
    \`\`\`solidity
    ${contractCode}
    \`\`\`
    
    Please provide a detailed analysis including:
    1. Security vulnerabilities (e.g., reentrancy, overflow/underflow, front-running)
    2. Gas optimization opportunities
    3. Solidity best practices
    4. Overall code quality assessment
    5. Recommendations for improvement`;
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error reviewing smart contract:', error);
    throw new Error('Failed to review smart contract');
  }
};

// Function to provide legal advice via chatbot
const getLegalAdvice = async (query) => {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Create prompt for legal advice
    const prompt = `As an AI legal assistant, please provide information on the following legal query:
    
    ${query}
    
    Please note that this is general information and not legal advice. For specific legal advice, consult with a qualified attorney.`;
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error getting legal advice:', error);
    throw new Error('Failed to get legal advice');
  }
};

module.exports = {
  generateLegalDocument,
  reviewSmartContract,
  getLegalAdvice
}; 