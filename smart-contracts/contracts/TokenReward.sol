// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LegalAssistantToken
 * @dev ERC20 Token for the Legal Assistant platform
 */
contract LegalAssistantToken is ERC20, Ownable {
    // Mapping to track if an address has claimed their initial tokens
    mapping(address => bool) public hasClaimedInitialTokens;
    
    // Amount of tokens to distribute as initial reward
    uint256 public constant INITIAL_REWARD = 100 * 10**18; // 100 tokens
    
    // Amount of tokens to reward for document creation
    uint256 public constant DOCUMENT_CREATION_REWARD = 10 * 10**18; // 10 tokens
    
    // Amount of tokens to reward for DAO creation
    uint256 public constant DAO_CREATION_REWARD = 20 * 10**18; // 20 tokens
    
    // Events
    event InitialTokensClaimed(address indexed user, uint256 amount);
    event RewardDistributed(address indexed user, uint256 amount, string reason);
    
    constructor() ERC20("Legal Assistant Token", "LAT") Ownable(msg.sender) {
        // Mint initial supply to the contract creator
        _mint(msg.sender, 1000000 * 10**18); // 1 million tokens
    }
    
    /**
     * @dev Allow users to claim their initial tokens (once per address)
     */
    function claimInitialTokens() public {
        require(!hasClaimedInitialTokens[msg.sender], "Initial tokens already claimed");
        
        hasClaimedInitialTokens[msg.sender] = true;
        _transfer(owner(), msg.sender, INITIAL_REWARD);
        
        emit InitialTokensClaimed(msg.sender, INITIAL_REWARD);
    }
    
    /**
     * @dev Reward users for creating documents
     * @param _user Address of the user to reward
     */
    function rewardDocumentCreation(address _user) public onlyOwner {
        _transfer(owner(), _user, DOCUMENT_CREATION_REWARD);
        
        emit RewardDistributed(_user, DOCUMENT_CREATION_REWARD, "Document Creation");
    }
    
    /**
     * @dev Reward users for creating DAOs
     * @param _user Address of the user to reward
     */
    function rewardDaoCreation(address _user) public onlyOwner {
        _transfer(owner(), _user, DAO_CREATION_REWARD);
        
        emit RewardDistributed(_user, DAO_CREATION_REWARD, "DAO Creation");
    }
    
    /**
     * @dev Distribute custom rewards
     * @param _user Address of the user to reward
     * @param _amount Amount of tokens to reward
     * @param _reason Reason for the reward
     */
    function distributeReward(address _user, uint256 _amount, string memory _reason) public onlyOwner {
        require(_amount > 0, "Reward amount must be greater than 0");
        
        _transfer(owner(), _user, _amount);
        
        emit RewardDistributed(_user, _amount, _reason);
    }
    
    /**
     * @dev Mint additional tokens (only owner)
     * @param _amount Amount of tokens to mint
     */
    function mint(uint256 _amount) public onlyOwner {
        _mint(owner(), _amount);
    }
} 