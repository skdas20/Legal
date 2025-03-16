// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title SimpleDAO
 * @dev A simple DAO implementation with basic governance features
 */
contract SimpleDAO is Ownable {
    using Counters for Counters.Counter;
    
    struct Proposal {
        string title;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    string public daoName;
    string public daoDescription;
    
    Counters.Counter private _proposalIds;
    mapping(uint256 => Proposal) public proposals;
    
    mapping(address => bool) public members;
    uint256 public memberCount;
    
    uint256 public votingPeriod = 3 days;
    
    event ProposalCreated(uint256 indexed proposalId, string title, address creator);
    event Voted(uint256 indexed proposalId, address voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId);
    event MemberAdded(address member);
    event MemberRemoved(address member);
    
    constructor(
        string memory _daoName,
        string memory _daoDescription,
        address _initialOwner
    ) Ownable(_initialOwner) {
        daoName = _daoName;
        daoDescription = _daoDescription;
        
        // Add creator as the first member
        members[_initialOwner] = true;
        memberCount = 1;
        
        emit MemberAdded(_initialOwner);
    }
    
    modifier onlyMember() {
        require(members[msg.sender], "Not a DAO member");
        _;
    }
    
    /**
     * @dev Add a new member to the DAO
     * @param _member Address of the new member
     */
    function addMember(address _member) public onlyOwner {
        require(!members[_member], "Already a member");
        members[_member] = true;
        memberCount++;
        
        emit MemberAdded(_member);
    }
    
    /**
     * @dev Remove a member from the DAO
     * @param _member Address of the member to remove
     */
    function removeMember(address _member) public onlyOwner {
        require(members[_member], "Not a member");
        require(_member != owner(), "Cannot remove owner");
        
        members[_member] = false;
        memberCount--;
        
        emit MemberRemoved(_member);
    }
    
    /**
     * @dev Create a new proposal
     * @param _title Title of the proposal
     * @param _description Description of the proposal
     */
    function createProposal(string memory _title, string memory _description) public onlyMember {
        uint256 proposalId = _proposalIds.current();
        _proposalIds.increment();
        
        Proposal storage newProposal = proposals[proposalId];
        newProposal.title = _title;
        newProposal.description = _description;
        newProposal.deadline = block.timestamp + votingPeriod;
        
        emit ProposalCreated(proposalId, _title, msg.sender);
    }
    
    /**
     * @dev Vote on a proposal
     * @param _proposalId ID of the proposal
     * @param _support Whether to support the proposal or not
     */
    function vote(uint256 _proposalId, bool _support) public onlyMember {
        Proposal storage proposal = proposals[_proposalId];
        
        require(block.timestamp < proposal.deadline, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        proposal.hasVoted[msg.sender] = true;
        
        if (_support) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }
        
        emit Voted(_proposalId, msg.sender, _support);
    }
    
    /**
     * @dev Execute a proposal if it has passed
     * @param _proposalId ID of the proposal
     */
    function executeProposal(uint256 _proposalId) public onlyMember {
        Proposal storage proposal = proposals[_proposalId];
        
        require(block.timestamp >= proposal.deadline, "Voting period not ended");
        require(!proposal.executed, "Already executed");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal did not pass");
        
        proposal.executed = true;
        
        emit ProposalExecuted(_proposalId);
    }
    
    /**
     * @dev Get proposal details
     * @param _proposalId ID of the proposal
     */
    function getProposal(uint256 _proposalId) public view returns (
        string memory title,
        string memory description,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 deadline,
        bool executed
    ) {
        Proposal storage proposal = proposals[_proposalId];
        
        return (
            proposal.title,
            proposal.description,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.deadline,
            proposal.executed
        );
    }
    
    /**
     * @dev Check if an address has voted on a proposal
     * @param _proposalId ID of the proposal
     * @param _voter Address of the voter
     */
    function hasVoted(uint256 _proposalId, address _voter) public view returns (bool) {
        return proposals[_proposalId].hasVoted[_voter];
    }
}

/**
 * @title DAOFactory
 * @dev Factory contract for creating new DAOs
 */
contract DAOFactory is Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _daoIds;
    
    struct DAOInfo {
        string name;
        string description;
        address daoAddress;
        address owner;
        uint256 createdAt;
    }
    
    mapping(uint256 => DAOInfo) public daos;
    mapping(address => uint256[]) public userDaos;
    
    event DAOCreated(uint256 indexed daoId, string name, address daoAddress, address owner);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new DAO
     * @param _name Name of the DAO
     * @param _description Description of the DAO
     */
    function createDAO(string memory _name, string memory _description) public returns (address) {
        uint256 daoId = _daoIds.current();
        _daoIds.increment();
        
        SimpleDAO newDao = new SimpleDAO(_name, _description, msg.sender);
        
        daos[daoId] = DAOInfo({
            name: _name,
            description: _description,
            daoAddress: address(newDao),
            owner: msg.sender,
            createdAt: block.timestamp
        });
        
        userDaos[msg.sender].push(daoId);
        
        emit DAOCreated(daoId, _name, address(newDao), msg.sender);
        
        return address(newDao);
    }
    
    /**
     * @dev Get all DAOs created by a user
     * @param _user Address of the user
     */
    function getUserDaos(address _user) public view returns (uint256[] memory) {
        return userDaos[_user];
    }
    
    /**
     * @dev Get total number of DAOs created
     */
    function getDaoCount() public view returns (uint256) {
        return _daoIds.current();
    }
} 