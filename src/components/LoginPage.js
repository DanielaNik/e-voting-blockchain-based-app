import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { VotingContext } from './VotingContext';
import Web3 from 'web3';

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      voterId: '',
      password: '',
      error: '',
      loggedIn: false
    };
  }

  componentDidMount() {
    const loggedIn = localStorage.getItem('loggedIn');
    const voterId = localStorage.getItem('voterId');
    const { userHasVoted } = this.props;
    //const {userHasVoted} = this.context
    if (loggedIn && voterId!==null) {
      this.setState({ loggedIn });
      this.setState({ voterId });
    }
    console.log('voterid',voterId)
    console.log('userHasVoted', userHasVoted);
  }
  
  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = async event => {
    event.preventDefault();
    const { history, account, userHasVoted } = this.props;
    console.log('userHasVoted', userHasVoted)
    const { voterId, password } = this.state;
    const voting = this.context;

    try {
      const voterEligible = await voting.methods.isVoterEligible(voterId,account).call();
      if (voterEligible) {
        const voterInfo = await voting.methods.getVoterDetails(voterId).call();
        const web3 = new Web3()
        const hashedPassword = web3.utils.sha3(password);
        
        if (voterInfo.passwordHash !== hashedPassword) {
          this.setState({ error: 'Invalid password.' });
          return;
        }

       // const userHasVoted = await voting.methods.hasVoted(account).call();

        if (voterInfo.hasVoted) {
          this.setState({ error: 'You have already voted.' });
        } else {
          this.setState({loggedIn: true})
          localStorage.setItem('loggedIn', true);
          localStorage.setItem('voterId', voterId);
          console.log('has voted in contract' ,voterInfo.hasVoted)
          history.push('/voting?voterId='+voterId);
        }
      } else {
        this.setState({ error: 'You are not eligible to vote.' });
      }
    } catch (error) {
      console.error(error);
      this.setState({ error: 'An error occurred. Please try again.' });
    }
  };

  handleLogout = () => {
    this.setState({
      voterId: '',
      password: '',
      error: '',
      loggedIn: false,
    });

    localStorage.setItem('loggedIn', false);
  };
  

  render() {
    const { voterId, password, error } = this.state;

    if (this.state.loggedIn) {
      return (
        <div>
          <p>You are logged in as voter {voterId}</p>
          <button onClick={this.handleLogout}>Logout</button>
        </div>
      );
    }

    return (
      <div>
        <h2>Login Page</h2>
        <form onSubmit={this.handleSubmit}>
          <div>
            <label>Voter ID:</label>
            <input
              type="text"
              name="voterId"
              value={voterId}
              onChange={this.handleInputChange}
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={this.handleInputChange}
            />
          </div>
          <div>
            <button type="submit">Login</button>
          </div>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    );
  }
}

LoginPage.contextType = VotingContext;

export default withRouter(LoginPage);
