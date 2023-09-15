pragma solidity ^0.5.16;

library Types{

    struct Voter{
        uint256 id;
        address account;
        string passwordHash;
        string name;
        uint8 age;
        bool isAlive;
        bool hasVoted;
    }

    struct Candidate{
        string name;
        string party;
        uint256 id;
        uint256 voteCount;
    }

}