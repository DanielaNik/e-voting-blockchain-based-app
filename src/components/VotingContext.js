import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';
import Voting from '../truffle_abis/Voting.json';

export const VotingContext = createContext();

export function useVotingContext() {
  return useContext(VotingContext);
}

// Define a new context to manage the voting status
const VotingStatusContext = createContext();

// Function to fetch and manage user voting status
export async function fetchUserVotingStatus(account) {
  try {
    const web3 = new Web3(window.ethereum);
    const networkId = await web3.eth.net.getId();
    const votingData = Voting.networks[networkId];
    const votingContract = new web3.eth.Contract(Voting.abi, votingData.address);

    const userHasVoted = await votingContract.methods.hasVoted(account).call();
    return userHasVoted; // Return the status instead of using a state setter
  } catch (error) {
    console.error("Error fetching user's voting status:", error);
    return false; // Return false in case of an error
  }
}

export function VotingProvider({ children, account }) {
  const [voting, setVoting] = useState(null);
  const [userHasVoted, setUserHasVoted] = useState(false);

  useEffect(() => {
    const loadVotingContract = async () => {
      try {
        const web3 = new Web3(window.ethereum);
        const networkId = await web3.eth.net.getId();
        const votingData = Voting.networks[networkId];
        if (votingData) {
          const votingContract = new web3.eth.Contract(Voting.abi, votingData.address);
          setVoting(votingContract);

          if (account !== "0x0") {
            const status = await fetchUserVotingStatus(account);
            setUserHasVoted(status);
          }
        }
      } catch (error) {
        console.error("Error loading contract and user's voting status:", error);
      }
    };

    loadVotingContract();
  }, [account]);

  return (
    <VotingContext.Provider value={voting}>
      <VotingStatusContext.Provider value={userHasVoted}>
        {children}
      </VotingStatusContext.Provider>
    </VotingContext.Provider>
  );
}

// Define a custom hook to access the user voting status
export function useUserVotingStatus() {
  return useContext(VotingStatusContext);
}
