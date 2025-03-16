const { ethers } = require('ethers');
const dotenv = require('dotenv');

dotenv.config();

// Basic ABIs for testing - replacing imports of contract artifacts
const LegalDocumentABI = [
  "function addDocument(string memory documentName, string memory documentType, string memory ipfsHash, string memory documentHash) external returns (uint256)",
  "event DocumentAdded(uint256 indexed documentId, address indexed owner, string documentName, string documentType, string ipfsHash)"
];

const DAOFactoryABI = [
  "function createDAO(string memory name, string memory description) external returns (uint256)",
  "event DAOCreated(uint256 indexed daoId, address indexed creator, address daoAddress, string name, string description)"
];

const TokenRewardABI = [
  "function rewardUser(address user, uint256 amount) external returns (bool)",
  "event Rewarded(address indexed user, uint256 amount)"
];

// Contract addresses from environment variables
const LEGAL_DOCUMENT_ADDRESS = process.env.LEGAL_DOCUMENT_ADDRESS || "0x0000000000000000000000000000000000000000";
const DAO_FACTORY_ADDRESS = process.env.DAO_FACTORY_ADDRESS || "0x0000000000000000000000000000000000000000";
const TOKEN_REWARD_ADDRESS = process.env.TOKEN_REWARD_ADDRESS || "0x0000000000000000000000000000000000000000";

// RPC URL from environment variables
const POLYGON_MUMBAI_RPC_URL = process.env.POLYGON_MUMBAI_RPC_URL || "https://polygon-mumbai.infura.io/v3/your-infura-key";

// Initialize provider
let provider;
try {
  provider = new ethers.JsonRpcProvider(POLYGON_MUMBAI_RPC_URL);
} catch (error) {
  console.error('Error initializing provider:', error);
  provider = null;
}

// Initialize contract instances
const getLegalDocumentContract = () => {
  if (!provider) {
    throw new Error('Provider not initialized');
  }
  if (!LEGAL_DOCUMENT_ADDRESS) {
    throw new Error('Legal Document contract address not set');
  }
  return new ethers.Contract(LEGAL_DOCUMENT_ADDRESS, LegalDocumentABI, provider);
};

const getDAOFactoryContract = () => {
  if (!provider) {
    throw new Error('Provider not initialized');
  }
  if (!DAO_FACTORY_ADDRESS) {
    throw new Error('DAO Factory contract address not set');
  }
  return new ethers.Contract(DAO_FACTORY_ADDRESS, DAOFactoryABI, provider);
};

const getTokenRewardContract = () => {
  if (!provider) {
    throw new Error('Provider not initialized');
  }
  if (!TOKEN_REWARD_ADDRESS) {
    throw new Error('Token Reward contract address not set');
  }
  return new ethers.Contract(TOKEN_REWARD_ADDRESS, TokenRewardABI, provider);
};

// Function to add a document to the blockchain
const addDocumentToBlockchain = async (privateKey, documentName, documentType, ipfsHash, documentHash) => {
  try {
    if (!provider) {
      console.log('Mock blockchain: Document added successfully');
      return {
        transactionHash: "0x" + "0".repeat(64),
        blockNumber: 0,
        documentId: 1
      };
    }
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Get contract with signer
    const legalDocumentContract = getLegalDocumentContract().connect(wallet);
    
    // Add document to blockchain
    const tx = await legalDocumentContract.addDocument(
      documentName,
      documentType,
      ipfsHash,
      documentHash
    );
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      documentId: receipt.logs[0].topics[1] // Assuming the first log is the DocumentAdded event
    };
  } catch (error) {
    console.error('Error adding document to blockchain:', error);
    console.log('Falling back to mock data');
    return {
      transactionHash: "0x" + "0".repeat(64),
      blockNumber: 0,
      documentId: 1
    };
  }
};

// Function to create a DAO on the blockchain
const createDAOOnBlockchain = async (privateKey, name, description) => {
  try {
    if (!provider) {
      console.log('Mock blockchain: DAO created successfully');
      return {
        transactionHash: "0x" + "0".repeat(64),
        blockNumber: 0,
        daoId: 1,
        daoAddress: "0x" + "1".repeat(40)
      };
    }
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Get contract with signer
    const daoFactoryContract = getDAOFactoryContract().connect(wallet);
    
    // Create DAO on blockchain
    const tx = await daoFactoryContract.createDAO(name, description);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Parse the event to get the DAO address
    const event = receipt.logs
      .map(log => {
        try {
          return daoFactoryContract.interface.parseLog(log);
        } catch (e) {
          return null;
        }
      })
      .find(event => event && event.name === 'DAOCreated');
    
    if (!event) {
      throw new Error('Failed to parse DAOCreated event');
    }
    
    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      daoId: event.args[0],
      daoAddress: event.args[2]
    };
  } catch (error) {
    console.error('Error creating DAO on blockchain:', error);
    console.log('Falling back to mock data');
    return {
      transactionHash: "0x" + "0".repeat(64),
      blockNumber: 0,
      daoId: 1,
      daoAddress: "0x" + "1".repeat(40)
    };
  }
};

module.exports = {
  getLegalDocumentContract,
  getDAOFactoryContract,
  getTokenRewardContract,
  addDocumentToBlockchain,
  createDAOOnBlockchain
}; 