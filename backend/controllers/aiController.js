const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const aiService = require('../services/aiService');

// @desc    Generate a legal document with Indian law focus
// @route   POST /api/ai/generate-document
// @access  Private
exports.generateDocument = asyncHandler(async (req, res, next) => {
  const { documentType, parameters } = req.body;

  if (!documentType || !parameters) {
    return next(new ErrorResponse('Please provide documentType and parameters', 400));
  }

  try {
    console.log(`Document generation request received for type: ${documentType}`);
    
    // Using the specialized function for legal document generation with Indian law focus
    const generatedContent = await aiService.generateLegalDocument(documentType, parameters);
    
    console.log(`Document generated successfully, length: ${generatedContent.length}`);
    
    res.status(200).json({
      success: true,
      data: {
        content: generatedContent,
        documentType,
        parameters
      }
    });
  } catch (error) {
    console.error(`Error in generateDocument controller: ${error.message}`);
    return next(new ErrorResponse(`Error generating document: ${error.message}`, 500));
  }
});

// @desc    Review a smart contract with Indian law focus
// @route   POST /api/ai/review-contract
// @access  Private
exports.reviewContract = asyncHandler(async (req, res, next) => {
  const { contractText } = req.body;

  if (!contractText) {
    return next(new ErrorResponse('Please provide contractText', 400));
  }

  try {
    console.log(`Contract review request received, text length: ${contractText.length}`);
    
    // Using the specialized function for contract review with Indian law focus
    const review = await aiService.reviewContract(contractText);
    
    console.log('Contract review completed successfully');
    
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error(`Error in reviewContract controller: ${error.message}`);
    return next(new ErrorResponse(`Error reviewing contract: ${error.message}`, 500));
  }
});

// @desc    Review a contract from image with Indian law focus
// @route   POST /api/ai/review-contract-image
// @access  Private
exports.reviewContractImage = asyncHandler(async (req, res, next) => {
  const { image } = req.body;

  if (!image) {
    return next(new ErrorResponse('Please provide an image', 400));
  }

  try {
    console.log('Contract image review request received');
    
    // Validate image data
    if (!image.includes('base64')) {
      return next(new ErrorResponse('Invalid image format. Image must be base64 encoded.', 400));
    }

    // Extract the base64 data if it includes the data URL prefix
    const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;
    
    // Log the image processing
    console.log('Processing contract image for review');
    
    // Using the specialized function for contract image review with Indian law focus
    const review = await aiService.reviewContractImage(base64Data);
    
    console.log('Contract image review completed successfully');
    
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error(`Error in reviewContractImage controller: ${error.message}`);
    
    // Provide more specific error messages based on the error type
    if (error.message.includes('API key')) {
      return next(new ErrorResponse('API configuration error. Please contact support.', 500));
    } else if (error.message.includes('timeout')) {
      return next(new ErrorResponse('Image processing timed out. Please try with a clearer image or use text input instead.', 408));
    } else if (error.message.includes('network')) {
      return next(new ErrorResponse('Network error while processing image. Please check your connection and try again.', 503));
    }
    
    return next(new ErrorResponse(`Error reviewing contract image: ${error.message}`, 500));
  }
});

// @desc    Chat with legal assistant specialized in Indian law
// @route   POST /api/ai/chat
// @access  Private
exports.chat = asyncHandler(async (req, res, next) => {
  const { message, conversation } = req.body;

  if (!message) {
    return next(new ErrorResponse('Please provide a message', 400));
  }

  try {
    console.log(`Chat request received: "${message.substring(0, 50)}..."`);
    console.log('Conversation history length:', conversation ? conversation.length : 0);
    
    // Using the specialized function for legal chat with Indian law focus
    const response = await aiService.handleLegalChat(message, conversation);
    
    console.log(`Chat response generated successfully, length: ${response.length}`);
    
    // Ensure consistent response format
    res.status(200).json({
      success: true,
      data: {
        response
      }
    });
  } catch (error) {
    console.error(`Error in chat controller: ${error.message}`);
    return next(new ErrorResponse(`Error generating chat response: ${error.message}`, 500));
  }
});

module.exports = exports; 