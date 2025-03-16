const pinataSDK = require('@pinata/sdk');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Initialize Pinata client
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

// Function to upload a document to IPFS
const uploadToIPFS = async (content, fileName) => {
  try {
    // Create a temporary file
    const tempFilePath = path.join(__dirname, '../temp', fileName);
    
    // Ensure temp directory exists
    if (!fs.existsSync(path.join(__dirname, '../temp'))) {
      fs.mkdirSync(path.join(__dirname, '../temp'), { recursive: true });
    }
    
    // Write content to temporary file
    fs.writeFileSync(tempFilePath, content);
    
    // Create read stream from file
    const readableStreamForFile = fs.createReadStream(tempFilePath);
    
    // Upload to IPFS via Pinata
    const result = await pinata.pinFileToIPFS(readableStreamForFile, {
      pinataMetadata: {
        name: fileName
      }
    });
    
    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);
    
    // Return the IPFS hash (CID)
    return result.IpfsHash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload to IPFS');
  }
};

// Function to retrieve a document from IPFS
const retrieveFromIPFS = async (ipfsHash) => {
  try {
    // Construct the IPFS gateway URL
    const gatewayURL = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    
    // Fetch the content using fetch or another HTTP client
    const response = await fetch(gatewayURL);
    
    if (!response.ok) {
      throw new Error(`Failed to get ${ipfsHash}`);
    }
    
    // Get the content as text
    const content = await response.text();
    
    return {
      name: 'document', // Pinata doesn't return the original filename
      content: content
    };
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    throw new Error('Failed to retrieve from IPFS');
  }
};

// Function to generate a hash of the document content
const generateDocumentHash = (content) => {
  return crypto.createHash('sha256').update(content).digest('hex');
};

module.exports = {
  uploadToIPFS,
  retrieveFromIPFS,
  generateDocumentHash
}; 