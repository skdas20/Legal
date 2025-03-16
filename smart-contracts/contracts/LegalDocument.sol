// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LegalDocument
 * @dev Store legal document hashes and metadata on the blockchain
 */
contract LegalDocument is Ownable {
    struct Document {
        string documentName;
        string documentType;
        string ipfsHash;
        string documentHash;
        uint256 timestamp;
        address owner;
    }

    // Mapping from document ID to Document
    mapping(uint256 => Document) public documents;
    
    // Mapping from user address to their document IDs
    mapping(address => uint256[]) public userDocuments;
    
    // Total number of documents
    uint256 public documentCount;

    // Events
    event DocumentAdded(uint256 indexed documentId, address indexed owner, string documentType);
    event DocumentUpdated(uint256 indexed documentId, address indexed owner);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Add a new legal document
     * @param _documentName Name of the document
     * @param _documentType Type of the document (NDA, Employment Contract, etc.)
     * @param _ipfsHash IPFS hash where the document is stored
     * @param _documentHash Hash of the document content for verification
     */
    function addDocument(
        string memory _documentName,
        string memory _documentType,
        string memory _ipfsHash,
        string memory _documentHash
    ) public {
        uint256 documentId = documentCount;
        
        documents[documentId] = Document({
            documentName: _documentName,
            documentType: _documentType,
            ipfsHash: _ipfsHash,
            documentHash: _documentHash,
            timestamp: block.timestamp,
            owner: msg.sender
        });
        
        userDocuments[msg.sender].push(documentId);
        documentCount++;
        
        emit DocumentAdded(documentId, msg.sender, _documentType);
    }

    /**
     * @dev Update an existing document
     * @param _documentId ID of the document to update
     * @param _documentName New name of the document
     * @param _ipfsHash New IPFS hash
     * @param _documentHash New document hash
     */
    function updateDocument(
        uint256 _documentId,
        string memory _documentName,
        string memory _ipfsHash,
        string memory _documentHash
    ) public {
        require(_documentId < documentCount, "Document does not exist");
        require(documents[_documentId].owner == msg.sender, "Not the document owner");
        
        Document storage doc = documents[_documentId];
        doc.documentName = _documentName;
        doc.ipfsHash = _ipfsHash;
        doc.documentHash = _documentHash;
        doc.timestamp = block.timestamp;
        
        emit DocumentUpdated(_documentId, msg.sender);
    }

    /**
     * @dev Get document details
     * @param _documentId ID of the document
     * @return Document details
     */
    function getDocument(uint256 _documentId) public view returns (
        string memory documentName,
        string memory documentType,
        string memory ipfsHash,
        string memory documentHash,
        uint256 timestamp,
        address owner
    ) {
        require(_documentId < documentCount, "Document does not exist");
        Document memory doc = documents[_documentId];
        
        return (
            doc.documentName,
            doc.documentType,
            doc.ipfsHash,
            doc.documentHash,
            doc.timestamp,
            doc.owner
        );
    }

    /**
     * @dev Get all document IDs owned by a user
     * @param _owner Address of the user
     * @return Array of document IDs
     */
    function getUserDocuments(address _owner) public view returns (uint256[] memory) {
        return userDocuments[_owner];
    }
} 