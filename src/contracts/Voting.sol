pragma solidity ^0.5.16;
import "./Types.sol";

contract Voting {
    Types.Candidate[] public candidates;
    mapping(uint256 => Types.Voter) voters;
    mapping(address => Types.Voter) votersByAddress;
    //mapping(uint256 => Types.Candidate) candidate;
    //mapping(uint256 => uint256) internal votesCount;

    address chairman;
    uint256 private votingStartTime;
    uint256 private votingEndTime;

    constructor(uint256 startTime_, uint256 endTime_) public {
        initializeCandidateDatabase_();
        initializeVoterDatabase_();
        votingStartTime = startTime_;
        votingEndTime = endTime_;
        chairman = msg.sender;
    }

    function isVoterEligible(uint256 voter_id, address account) public view returns (bool voterEligible_) {
        Types.Voter storage voter_ = voters[voter_id];
        if (voter_.account==account && voter_.age >= 18 && voter_.isAlive) voterEligible_ = true;
    }

    function hasVoted(address acoount) public view returns (bool userVoted_)
    {
        userVoted_ = (votersByAddress[acoount].hasVoted);
    }

    function castVote(
        uint256 candidate_id,
        uint256 voter_id,
        uint256 currentTime_
    )
        public
        electionInProcess(currentTime_)
        isVoteValid(voter_id, candidate_id) 
    {
        //voters[voter_id].hasVoted = true;
        votersByAddress[msg.sender].hasVoted = true;
        candidates[candidate_id].voteCount++;  // Increment the vote count for the chosen candidate
        emit VoteCasted(msg.sender, candidate_id);  // Emit an event for the vote casted
    }

    event VoteCasted(address indexed voter_id, uint256 indexed candidate_id);

    function getVotingStartTime() public view returns (uint256 startTime_) {
    return votingStartTime;
    }

    function getVotingEndTime() public view returns (uint256 endTime_) {
        endTime_ = votingEndTime;
    }

    function updateVotingStartTime(uint256 startTime_, uint256 currentTime_)
        public
        isChairman
    {
        require(votingStartTime > currentTime_);
        votingStartTime = startTime_;
    }

    function extendVotingTime(uint256 endTime_, uint256 currentTime_)
        public
        isChairman
    {
        require(votingStartTime < currentTime_);
        require(votingEndTime > currentTime_);
        votingEndTime = endTime_;
    }


    function getCandidate(uint256 index) public electionInProcess(now) returns (
        string memory name,
        string memory party,
        uint256 id)
    {
        require(index < candidates.length, "Invalid candidate index");
        Types.Candidate memory candidate = candidates[index];
        name = candidate.name;
        party = candidate.party;
        id = candidate.id;
    }

    
    function getCandidatesCount() public electionInProcess(now) returns (uint256) {
        return candidates.length;
    }

    function getVoterDetails(uint256 voter_id) public view returns (address account,string memory passwordHash, string memory name, uint256 age, bool isAlive, bool hasVoted) {
        Types.Voter memory voter = voters[voter_id];
        account = voter.account;
        name = voter.name;
        passwordHash = voter.passwordHash;
        age = voter.age;
        isAlive = voter.isAlive;
        hasVoted = voter.hasVoted;
    }

    function getResults() public view returns (bytes32[] memory candidateNames, uint256[] memory voteCounts) {
        require(now > votingEndTime, "Election results are not available yet");

        candidateNames = new bytes32[](candidates.length);
        voteCounts = new uint256[](candidates.length);

        for (uint256 i = 0; i < candidates.length; i++) {
            candidateNames[i] = stringToBytes32(candidates[i].name);
            voteCounts[i] = candidates[i].voteCount;
        }
    return (candidateNames, voteCounts);
    }

    function stringToBytes32(string memory source) internal pure returns (bytes32 result) {
        assembly {
         result := mload(add(source, 32))
        }
    }

  
    modifier electionInProcess(uint256 currentTime) {
        require(currentTime >= votingStartTime);
        require(currentTime <= votingEndTime);
        _;
    }

    modifier isVoteValid(uint256 voter_id, uint256 candidate_id) {
        Types.Voter memory voter = voters[voter_id];
        Types.Candidate memory candidate = candidates[candidate_id];
        require(voter.age >= 18);
        require(voter.isAlive);
        require(voter.hasVoted==false);
        _;
    }

    modifier isChairman() {
        require(msg.sender == chairman);
        _;
    }

    //Dummy data for candidates and voters
    function initializeCandidateDatabase_() internal {
    candidates.push(Types.Candidate("Candidate 1", "Party A", 1, 0));
    candidates.push(Types.Candidate("Candidate 2", "Party B", 2, 0));
}

function initializeVoterDatabase_() internal {
    voters[1] = Types.Voter(1, 0xFBA1b27A783afe48d2de6627B059581E6388Dd7A, "0xb68fe43f0d1a0d7aef123722670be50268e15365401c442f8806ef83b612976b", "Voter1", 25, true, false);
    voters[2] = Types.Voter(2, 0xAB255ddf10944022DDBEfa349ce6847245023e82, "0xb68fe43f0d1a0d7aef123722670be50268e15365401c442f8806ef83b612976b", "Voter2", 30, true, false);
    voters[3] = Types.Voter(3, 0xFbD0e74627339FcE677d6672C7F1689E0C56954A, "0xb68fe43f0d1a0d7aef123722670be50268e15365401c442f8806ef83b612976b", "Voter3", 77, true, false);
    voters[4] = Types.Voter(4, 0x30919bD8dA626296De979dc276Cd02fd7a3B224A, "0xb68fe43f0d1a0d7aef123722670be50268e15365401c442f8806ef83b612976b", "Voter4", 29, true, false);

}
}