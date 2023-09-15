import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { VotingContext } from './VotingContext';
import Web3 from 'web3';

class VotingPage extends Component {

  static contextType = VotingContext;

  constructor(props) {
    super(props);
    this.state = {
      voterId: null,
      candidates: [], // Store the list of candidates here
      selectedCandidate: null,
      userHasVoted: false,
    };
  }

  async componentDidMount() {
    const voting = this.context;
    const searchParams = new URLSearchParams(this.props.location.search);
    const voterId = searchParams.get('voterId');
    this.setState({ voterId });
    // if(this.state.userHasVoted==false){
    // const voterDetails = await voting.methods.getVoterDetails(voterId).call();
    // const userHasVoted = voterDetails.hasVoted;
    // this.setState({userHasVoted:userHasVoted})
    // }
    
    if(this.state.userHasVoted==false){
      const candidatesCount = await voting.methods.getCandidatesCount().call();
      const candidates = [];

      for (let i = 0; i < candidatesCount; i++) {
        const candidate = await voting.methods.getCandidate(i).call();
        candidates.push(candidate);
      }

      this.setState({ candidates });
    }
  }

  handleVote = async () => {
    const { selectedCandidate } = this.state;
    const  voting  = this.context;
    const { account } = this.props


    if (selectedCandidate !== null) {
      try {
        // Call the function to cast the vote using selectedCandidate
        const tx = await voting.methods
        .castVote(selectedCandidate, this.state.voterId, Math.floor(Date.now() / 1000))
        .send({ from: account });

      // Get the transaction receipt
      const Web3 = require('web3');

      // Initialize Web3 with MetaMask provider
      const web3 = new Web3(window.ethereum);
      const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);

      // Check if the transaction was successful
      if (receipt.status === '0x1') {
        // Transaction was successful, now listen for the event
        voting.events.VoteCasted({ filter: { voter: account } }, (error, event) => {
          if (!error) {
            console.log('VoteCasted event:', event);
            // Update userHasVoted for the specific user
            console.log('user has voted event:', this.state.userHasVoted);
          } else {
            console.error('Error listening to VoteCasted event:', error);
          }
        });
      } else {
        console.error('Transaction failed.');
      }

        //localStorage.setItem('userHasVoted', true);
        console.log(`Voted for candidate ${selectedCandidate}`);
        this.setState({ userHasVoted: true });
        //console.log('has voted',this.state.userHasVoted);
      } catch (error) {
        console.error(error);
      }
    }
  };

  handleCandidateSelection = candidateId => {
    this.setState({ selectedCandidate: candidateId });
  };

  handleLogout = () => {
    localStorage.setItem('loggedIn',false);
    localStorage.removeItem('voterId');
  
    this.props.history.push('/'); 
  };

  componentWillUnmount() {
    if (this.state.contract) {
      this.state.contract.events.VoteCasted().unsubscribe();
    }
  }

  render() {
    const { candidates, selectedCandidate } = this.state;

    if(this.state.userHasVoted){
      return(
        <div>
            <h5>You have voted successfully.</h5>
            <button onClick={this.handleLogout}>
              Logout
            </button>
            <button>
              Results page
            </button>
        </div>
      );
    }

    return (
      <div>
        <h2>Voting Page</h2>
        <ul>
          {candidates.map(candidate => (
            <li key={candidate.id}>
              {candidate.name} - {candidate.party}
              <button
                onClick={() => this.handleCandidateSelection(candidate.id)}
                disabled={selectedCandidate === candidate.id}
              >
                {selectedCandidate === candidate.id ? 'Selected' : 'Select'}
              </button>
            </li>
          ))}
        </ul>
        <button onClick={this.handleVote} disabled={selectedCandidate === null || this.state.userHasVoted}>
          Vote
        </button>
      </div>
    );
  }
}


export default VotingPage;
