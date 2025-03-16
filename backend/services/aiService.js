const { GoogleGenerativeAI } = require('@google/generative-ai');

// Flag to use mock implementation for testing
const USE_MOCK = false;

// Initialize the Gemini API client
let genAI;
try {
  if (USE_MOCK) {
    console.log('Using mock implementation for Gemini API');
  } else {
  if (!process.env.GEMINI_API_KEY) {
    console.error('Gemini API key is not set in environment variables');
    throw new Error('GEMINI_API_KEY is not set');
  }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyCXeGy9w_FR7fBu35iv44j_3zS2eKt5Ecs');
  console.log('Gemini API initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Gemini API:', error);
}

/**
 * Helper function to extract sections from AI response
 * @param {string} text - The full text response
 * @param {string} sectionName - The name of the section to extract
 * @returns {string|null} - The extracted section or null if not found
 */
const extractSection = (text, sectionName) => {
  try {
    const regex = new RegExp(`(?:^|\\n)\\s*(?:#+\\s*)?${sectionName}\\s*(?::|\\n)([\\s\\S]*?)(?:\\n\\s*(?:#+\\s*)?[a-zA-Z]|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  } catch (error) {
    console.error(`Error extracting section ${sectionName}:`, error);
    return null;
  }
};

/**
 * Generate content using Gemini API
 * @param {string} prompt - The prompt to send to the AI
 * @returns {Promise<string>} - The generated content
 */
const generateContent = async (prompt) => {
  try {
    // Use mock implementation for testing
    if (USE_MOCK) {
      console.log('Using mock implementation for content generation');
      
      // Check if this is a legal chat request
      if (prompt.includes("You are an AI legal assistant specializing in Indian law")) {
        const userMessage = prompt.match(/User: (.*?)(?:\n|$)/);
        const userQuery = userMessage ? userMessage[1] : "your question";
        
        // Generate a more realistic mock response based on the query
        if (userQuery.toLowerCase().includes("information technology act")) {
          return `The Information Technology Act, 2000 (IT Act) is India's primary law dealing with cybercrime and electronic commerce. Key provisions include:

1. Legal recognition of electronic documents and digital signatures (Section 3-10)
2. Regulation of certifying authorities for digital signatures (Section 17-34)
3. Penalties for various cybercrimes including hacking, data theft, and identity fraud (Section 43-47)
4. Establishment of the Cyber Appellate Tribunal (Section 48-64)
5. Intermediary liability protections and obligations (Section 79)

The IT Act was significantly amended in 2008 to address emerging challenges in cybersecurity and digital transactions.

Please note that this information is for educational purposes only and should not be considered legal advice. For specific legal matters, please consult with a qualified attorney specializing in Indian IT law.`;
        } else if (userQuery.toLowerCase().includes("company") || userQuery.toLowerCase().includes("business")) {
          return `Starting a private limited company in India involves the following steps:

1. Obtain Digital Signature Certificate (DSC) for the proposed directors
2. Apply for Director Identification Number (DIN) 
3. Reserve a unique company name through the MCA portal
4. Draft and file the Memorandum of Association (MOA) and Articles of Association (AOA)
5. File incorporation documents with Form SPICe+ (INC-32)
6. Obtain Certificate of Incorporation
7. Apply for PAN and TAN
8. Open a company bank account
9. Register for GST (if applicable)
10. Obtain necessary business licenses based on your industry

The Companies Act, 2013 governs the incorporation and regulation of companies in India.

Please note that this information is for educational purposes only and should not be considered legal advice. For specific legal matters, please consult with a qualified attorney specializing in Indian corporate law.`;
        } else if (userQuery.toLowerCase().includes("tenant") || userQuery.toLowerCase().includes("rental")) {
          return `As a tenant in India, your rights are primarily governed by the Rent Control Acts of various states and the Transfer of Property Act, 1882. Key rights include:

1. Right to a written rental agreement
2. Right to receipt for rent payments
3. Right to essential services (water, electricity, etc.)
4. Protection against arbitrary eviction (proper notice required)
5. Right to peaceful possession without landlord interference
6. Right to recover security deposit upon vacating (subject to deductions for damages)
7. Protection against unfair rent increases (in states with rent control)

The Model Tenancy Act, 2021 aims to balance the interests of both landlords and tenants, though states need to adopt it individually.

Please note that this information is for educational purposes only and should not be considered legal advice. For specific legal matters, please consult with a qualified attorney specializing in Indian property law.`;
        } else {
          return `Thank you for your question about "${userQuery}".

In the Indian legal context, this matter would typically be governed by relevant statutes and case law. While I can provide general information, please note that legal situations can vary based on specific circumstances and jurisdictional considerations.

To properly address your query, I would recommend:
1. Consulting the applicable Indian legislation
2. Reviewing relevant Supreme Court and High Court judgments
3. Seeking advice from a qualified legal professional who specializes in this area

Please note that this information is provided for educational purposes only and does not constitute legal advice. For specific legal matters, I recommend consulting with a licensed attorney who can provide guidance tailored to your situation.

Is there a specific aspect of this topic you would like me to elaborate on further?`;
        }
      } else if (prompt.includes("Generate a legal document")) {
        // Mock response for document generation
        return `LEGAL DOCUMENT DRAFT

[This is a mock legal document based on your request. In a real implementation, this would contain a properly formatted legal document with appropriate clauses, sections, and legal language in accordance with Indian law.]

DISCLAIMER: This document is provided as a general template only and should be reviewed by a qualified legal professional before use. It may not address your specific circumstances or comply with all applicable laws and regulations.`;
      } else if (prompt.includes("review the following contract")) {
        // Mock response for contract review
        return `{
          "summary": "This appears to be a standard rental agreement between a landlord and tenant for residential property in India.",
          "risks": [
            "The security deposit amount (3 months' rent) is high by market standards.",
            "There is no clear timeline for the return of the security deposit.",
            "The maintenance responsibilities are not clearly defined between landlord and tenant."
          ],
          "clarifications": [
            "The agreement should specify the exact date for rent payment each month.",
            "The process for addressing repairs and maintenance should be clarified.",
            "The agreement should specify whether subletting is allowed with permission."
          ],
          "bestPractices": [
            "Include a detailed inventory of fixtures and fittings with the agreement.",
            "Specify the notice period for termination by either party.",
            "Include a clause addressing dispute resolution mechanisms."
          ],
          "finalAdvice": "This agreement provides basic protection but should be enhanced with more specific terms regarding maintenance, security deposit return, and dispute resolution. Consider having it reviewed by a legal professional familiar with local rental laws."
        }`;
      } else {
        // Generic mock response
        return `This is a mock response for the prompt: "${prompt.substring(0, 50)}..."`;
      }
    }
    
    // Check if Gemini API is initialized
    if (!genAI) {
      console.error('Gemini API not initialized. Using fallback implementation.');
      return `{
        "summary": "Contract analysis unavailable - API configuration issue",
        "risks": ["API configuration error detected"],
        "clarifications": ["Please check server configuration"],
        "bestPractices": ["Ensure API keys are properly set"],
        "finalAdvice": "Please try again later after system maintenance is complete."
      }`;
    }
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // Generate content
    console.log('Sending prompt to Gemini API, length:', prompt.length);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Received response from Gemini API, length:', text.length);
    return text;
  } catch (error) {
    console.error('Error generating content:', error);
    
    // Return a structured error response that can be parsed as JSON
    return `{
      "summary": "Error analyzing contract",
      "risks": ["Unable to process due to technical error"],
      "clarifications": ["System encountered an error: ${error.message}"],
      "bestPractices": ["Try again with a shorter contract", "Check your internet connection"],
      "finalAdvice": "If the problem persists, please contact support."
    }`;
  }
};

/**
 * Generate a legal document with focus on Indian law context
 * @param {string} documentType - The type of document to generate
 * @param {Object} parameters - Parameters for document generation
 * @returns {Promise<string>} - The generated document
 */
const generateLegalDocument = async (documentType, parameters) => {
  try {
    console.log(`Generating ${documentType} document with parameters:`, parameters);
    
    const documentTypeMap = {
      'nda': 'Non-Disclosure Agreement',
      'employment': 'Employment Contract',
      'lease': 'Lease Agreement',
      'terms': 'Terms of Service',
      'privacy': 'Privacy Policy',
      'service': 'Service Agreement',
      'will': 'Last Will and Testament',
      'partnership': 'Partnership Agreement',
      'company': 'Company Incorporation',
      'consultancy': 'Consultancy Agreement'
    };
    
    const fullDocumentType = documentTypeMap[documentType] || documentType;
    
    // Build the system context with Indian law focus
    const systemContext = `You are an expert legal document drafting assistant specializing in Indian law. 
Your task is to generate a ${fullDocumentType} that complies with Indian legal requirements and best practices.
Include relevant citations to Indian laws, statutes, and precedents where appropriate.
The document should be comprehensive, professional, and legally sound under Indian jurisdiction.

IMPORTANT FORMATTING INSTRUCTIONS:
1. Use proper legal document structure with clear sections and subsections.
2. Use numbered sections (1., 2., 3., etc.) for main clauses.
3. Use lettered subsections (a., b., c., etc.) for subclauses.
4. DO NOT use markdown formatting like ** for headings.
5. Instead, use clear section titles like "DEFINITIONS", "TERM AND TERMINATION", etc.
6. Format the document title at the top in all caps.
7. Include proper signature blocks at the end.
8. Use formal legal language throughout.
9. Include proper recitals and whereas clauses where appropriate.
10. Format dates, numbers, and monetary amounts in the proper Indian legal style.`;
    
    // Extract parameters
    const paramString = Object.entries(parameters)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    const prompt = `${systemContext}

Document Parameters:
${paramString}

Please generate a complete ${fullDocumentType} in a formal legal format based on the parameters provided, 
following Indian legal standards and conventions. Use proper legal language and structure.

The document should begin with a clear title, followed by an introduction identifying the parties and the purpose.
Include all necessary legal clauses, definitions, terms, conditions, and signature blocks.
Ensure the document is enforceable under Indian law and includes all required legal elements.`;
    
    return await generateContent(prompt);
  } catch (error) {
    console.error('Error generating legal document:', error);
    throw new Error(`Failed to generate document: ${error.message}`);
  }
};

/**
 * Review a contract with a focus on Indian legal context
 * @param {string} contractText - The contract text to review
 * @returns {Promise<Object>} - The review results
 */
const reviewContract = async (contractText) => {
  try {
    console.log('Reviewing contract text, length:', contractText.length);
    
    // Use mock implementation for testing
    if (USE_MOCK) {
      console.log('Using mock implementation for contract text review');
      
      // Return a mock response with structured data
      return {
        summary: "This appears to be a standard rental agreement between a landlord and tenant for residential property in India.",
        risks: [
          "The security deposit amount (3 months' rent) is high by market standards.",
          "There is no clear timeline for the return of the security deposit.",
          "The maintenance responsibilities are not clearly defined between landlord and tenant."
        ],
        clarifications: [
          "The agreement should specify the exact date for rent payment each month.",
          "The process for addressing repairs and maintenance should be clarified.",
          "The agreement should specify whether subletting is allowed with permission."
        ],
        bestPractices: [
          "Include a detailed inventory of fixtures and fittings with the agreement.",
          "Specify the notice period for termination by either party.",
          "Include a clause addressing dispute resolution mechanisms."
        ],
        finalAdvice: "This agreement provides basic protection but should be enhanced with more specific terms regarding maintenance, security deposit return, and dispute resolution. Consider having it reviewed by a legal professional familiar with local rental laws."
      };
    }
    
    // Limit contract text length to prevent API errors
    const maxLength = 25000;
    const trimmedText = contractText.length > maxLength 
      ? contractText.substring(0, maxLength) + "... [text truncated due to length]" 
      : contractText;
    
    const prompt = `As an expert in Indian contract law, please review the following contract text:

\`\`\`
${trimmedText}
\`\`\`

Provide a comprehensive analysis including:
1. Document Summary: A brief overview of what this contract is about
2. Potential Risks: Identify any clauses that could be problematic or risky for either party
3. Clarifications Needed: Areas that are ambiguous or need further clarification
4. Best Practices: Suggestions for improving the contract based on Indian legal standards
5. Final Advice: Overall recommendation and key points to consider

Format your response as a structured JSON with the following keys:
- summary (string)
- risks (array of strings)
- clarifications (array of strings)
- bestPractices (array of strings)
- finalAdvice (string)

Ensure your response is valid JSON that can be parsed.`;

    const reviewText = await generateContent(prompt);
    
    // Try to parse the response as JSON
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedText = reviewText.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonResponse = JSON.parse(cleanedText);
      
      // Validate the response structure
      return {
        summary: jsonResponse.summary || "Analysis of the provided contract",
        risks: Array.isArray(jsonResponse.risks) ? jsonResponse.risks : [],
        clarifications: Array.isArray(jsonResponse.clarifications) ? jsonResponse.clarifications : [],
        bestPractices: Array.isArray(jsonResponse.bestPractices) ? jsonResponse.bestPractices : [],
        finalAdvice: jsonResponse.finalAdvice || "Please consult with a licensed Indian attorney for a complete legal assessment"
      };
    } catch (error) {
      console.log('Failed to parse JSON response, using text extraction instead:', error.message);
    
    // Basic parsing of the response to structure it
    return {
        summary: extractSection(reviewText, "document summary") || extractSection(reviewText, "summary") || "Analysis of the provided contract",
        risks: extractArrayItems(reviewText, "potential risks") || extractArrayItems(reviewText, "risks") || ["No specific risks identified"],
        clarifications: extractArrayItems(reviewText, "clarifications needed") || extractArrayItems(reviewText, "clarifications") || ["No specific clarifications needed"],
        bestPractices: extractArrayItems(reviewText, "best practices") || ["Follow standard legal practices"],
        finalAdvice: extractSection(reviewText, "final advice") || extractSection(reviewText, "recommendation") || "Please consult with a licensed Indian attorney for a complete legal assessment"
      };
    }
  } catch (error) {
    console.error('Error reviewing contract:', error);
    
    // Return a fallback response instead of throwing an error
    return {
      summary: "Error analyzing contract",
      risks: ["Unable to process due to technical error"],
      clarifications: ["System encountered an error: " + error.message],
      bestPractices: ["Try again with a shorter contract", "Check your internet connection"],
      finalAdvice: "If the problem persists, please contact support."
    };
  }
};

/**
 * Review a contract from an image with a focus on Indian legal context
 * @param {string} base64Image - The base64-encoded image of the contract
 * @returns {Promise<Object>} - The review results
 */
const reviewContractImage = async (base64Image) => {
  try {
    console.log('Reviewing contract from image');
    
    // Use mock implementation for testing
    if (USE_MOCK) {
      console.log('Using mock implementation for contract image review');
      
      // Return a mock response with extracted text
      return {
        summary: "This appears to be a standard rental agreement between a landlord and tenant for residential property in India.",
        risks: [
          "The security deposit amount (3 months' rent) is high by market standards.",
          "There is no clear timeline for the return of the security deposit.",
          "The maintenance responsibilities are not clearly defined between landlord and tenant."
        ],
        clarifications: [
          "The agreement should specify the exact date for rent payment each month.",
          "The process for addressing repairs and maintenance should be clarified.",
          "The agreement should specify whether subletting is allowed with permission."
        ],
        bestPractices: [
          "Include a detailed inventory of fixtures and fittings with the agreement.",
          "Specify the notice period for termination by either party.",
          "Include a clause addressing dispute resolution mechanisms."
        ],
        finalAdvice: "This agreement provides basic protection but should be enhanced with more specific terms regarding maintenance, security deposit return, and dispute resolution. Consider having it reviewed by a legal professional familiar with local rental laws.",
        extractedText: `RENTAL AGREEMENT

THIS RENTAL AGREEMENT is made on this 10th day of June, 2023, between:

Mr. Rajesh Kumar, S/o Late Sh. Mohan Kumar, R/o 123, Green Park, New Delhi - 110016 (hereinafter referred to as the "LANDLORD")

AND

Ms. Priya Singh, D/o Sh. Ajay Singh, R/o 456, Vasant Kunj, New Delhi - 110070 (hereinafter referred to as the "TENANT")

WHEREAS the Landlord is the owner of residential premises situated at 789, Hauz Khas, New Delhi - 110016 (hereinafter referred to as the "PREMISES")

AND WHEREAS the Tenant has approached the Landlord to take the Premises on rent for residential purposes, and the Landlord has agreed to let out the same on the terms and conditions appearing hereinafter.

NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:

1. RENT AND DEPOSIT:
   a) The monthly rent for the Premises shall be Rs. 25,000/- (Rupees Twenty-Five Thousand Only).
   b) The Tenant shall pay a security deposit of Rs. 75,000/- (Rupees Seventy-Five Thousand Only) which shall be refundable at the time of vacating the Premises, subject to deductions for damages, if any.

2. TERM:
   This Agreement shall be valid for a period of 11 (Eleven) months commencing from 15th June, 2023 to 14th May, 2024.

3. OBLIGATIONS OF THE TENANT:
   a) Pay the rent by the 5th day of each month.
   b) Pay for electricity, water, and maintenance charges as per actual consumption.
   c) Not sublet the Premises or any part thereof.
   d) Maintain the Premises in good condition.
   e) Not make any structural changes without written permission from the Landlord.

4. TERMINATION:
   Either party may terminate this Agreement by giving one month's notice in writing.

IN WITNESS WHEREOF, the parties have executed this Agreement on the date first above written.`
      };
    }
    
    // Check if Gemini API is initialized
    if (!genAI) {
      console.error('Gemini API not initialized. Using fallback implementation.');
      return {
        summary: "Contract analysis unavailable - API configuration issue",
        risks: ["API configuration error detected"],
        clarifications: ["Please check server configuration"],
        bestPractices: ["Ensure API keys are properly set"],
        finalAdvice: "Please try again later after system maintenance is complete.",
        extractedText: "Unable to extract text due to API configuration issues."
      };
    }
    
    // Extract text from image using Gemini Vision API
    let extractedText = '';
    
    try {
      // First, use Gemini Vision to extract text from the image
      const visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-vision' });
      
      // Create prompt parts for OCR
      const ocrPromptParts = [
        {
          text: `Extract all the text from this image of a legal document. 
          Return ONLY the extracted text, formatted as it appears in the document.
          Do not include any analysis, commentary, or additional text.`
        },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image
          }
        }
      ];
      
      // Generate content for OCR
      console.log('Sending image to Gemini Vision API for text extraction');
      const ocrResult = await visionModel.generateContent({
        contents: [{ role: 'user', parts: ocrPromptParts }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,
        },
      });
      
      const ocrResponse = ocrResult.response;
      extractedText = ocrResponse.text();
      
      console.log('Text extracted from image, length:', extractedText.length);
      
      if (!extractedText || extractedText.trim().length < 10) {
        throw new Error('Insufficient text extracted from image');
      }
    } catch (ocrError) {
      console.error('Error extracting text from image:', ocrError);
      extractedText = "Failed to extract text from the image. Please try again with a clearer image or use text input instead.";
      
      // Return a basic response when OCR fails
      return {
        summary: "Unable to analyze the contract image",
        risks: ["Text extraction failed - unable to analyze the document"],
        clarifications: ["Please try uploading a clearer image or use text input instead"],
        bestPractices: ["Ensure the document is well-lit and clearly visible in the image", 
                        "Try using a higher resolution image", 
                        "Consider using text input for better results"],
        finalAdvice: "We couldn't extract sufficient text from your image to provide a proper analysis. Please try again with a clearer image or use the text input option.",
        extractedText: extractedText
      };
    }
    
    // Now analyze the extracted text using the text review function
    let reviewResult;
    
    try {
      reviewResult = await reviewContract(extractedText);
      
      // Add the extracted text to the review result
      reviewResult.extractedText = extractedText;
      
      return reviewResult;
    } catch (reviewError) {
      console.error('Error reviewing extracted text:', reviewError);
      
      // Create a basic review result if text review fails
      return {
        summary: "Analysis of the provided contract image",
        risks: ["Unable to properly analyze the contract due to text extraction issues"],
        clarifications: ["Please try uploading a clearer image or use text input instead"],
        bestPractices: ["Ensure the document is well-lit and clearly visible in the image"],
        finalAdvice: "Due to issues with text extraction, we couldn't provide a comprehensive review. Please try again with a clearer image or use text input instead.",
        extractedText: extractedText
      };
    }
  } catch (error) {
    console.error('Error reviewing contract image:', error);
    
    // Return a fallback response instead of throwing an error
    return {
      summary: "Error analyzing contract image",
      risks: ["Unable to process due to technical error: " + error.message],
      clarifications: ["The system encountered an error while processing your image"],
      bestPractices: ["Try again with a clearer image", "Try using the text input option instead"],
      finalAdvice: "If the problem persists, please contact support.",
      extractedText: "Failed to extract text due to an error."
    };
  }
};

/**
 * Extract array items from a section
 * @param {string} text - The text to extract from
 * @param {string} sectionName - The name of the section to extract items from
 * @returns {Array<string>|null} - The extracted items or null if not found
 */
const extractArrayItems = (text, sectionName) => {
  try {
    const section = extractSection(text, sectionName);
    if (!section) return null;
    
    // Try to extract numbered or bulleted items
    const itemRegex = /\n\s*(?:[-•*]|\d+\.)\s*(.+?)(?=\n\s*(?:[-•*]|\d+\.)|$)/gs;
    const matches = [...section.matchAll(itemRegex)];
    
    if (matches && matches.length > 0) {
      return matches.map(match => match[1].trim()).filter(item => item);
    }
    
    // If no items found with bullets or numbers, just split by newlines
    const lines = section.split(/\n+/).map(line => line.trim()).filter(line => line);
    return lines.length > 0 ? lines : [section.trim()];
  } catch (error) {
    console.error('Error extracting array items:', error);
    return ["Error extracting items"];
  }
};

/**
 * Handle legal chat with a focus on Indian law
 * @param {string} message - The user's message
 * @param {Array} conversation - The conversation history
 * @returns {Promise<string>} - The AI's response
 */
const handleLegalChat = async (message, conversation = []) => {
  try {
    console.log('Handling legal chat message:', message);
    console.log('Conversation history length:', conversation.length);
    
    // Build the system context and conversation history
    const systemContext = `You are an AI legal assistant specializing in Indian law. 
Your purpose is to provide helpful legal information based on Indian legislation, case law, and legal practices.
You should:
1. Always specify that your responses are for informational purposes only and not a substitute for professional legal advice.
2. Cite relevant Indian laws, statutes, and precedents where appropriate.
3. Focus on Indian jurisdiction and legal system.
4. Be clear about limitations in areas requiring specific legal expertise.
5. Avoid giving definitive legal advice on complex matters.`;

    // Format the conversation history
    const formattedConversation = conversation.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');

    const prompt = `${systemContext}

${formattedConversation ? `Previous conversation:\n${formattedConversation}\n\n` : ''}
User: ${message}

Please provide a response based on the information provided.`;

    return await generateContent(prompt);
  } catch (error) {
    console.error('Error handling legal chat:', error);
    throw new Error(`Failed to handle legal chat: ${error.message}`);
  }
};

module.exports = {
  generateContent,
  generateLegalDocument,
  reviewContract,
  reviewContractImage,
  handleLegalChat
}; 
