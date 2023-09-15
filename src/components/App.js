import React, {Component} from 'react'
import Navbar from './Navbar';
import Web3 from 'web3';
import {
    BrowserRouter as Router, Routes, Route, Switch
  } from 'react-router-dom';
import Voting from '../truffle_abis/Voting.json'
import LoginPage from './LoginPage';
import VotingPage from './VotingPage';
import { VotingProvider } from './VotingContext';

class App extends Component {

    async UNSAFE_componentWillMount(){
        await this.loadWeb3()
        await this.loadBlockchainData()
    }

    async loadWeb3(){
        if(window.ethereum){
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
        } else if (window.web3){
            window.web3 = new Web3(window.web3.currentProvider)
        } else {
            window.alert('No ethereum browser detected!')
        }
    }

    async loadBlockchainData(){
        const web3 = window.web3
        const account = await web3.eth.getAccounts()
        this.setState({account: account[0]})
        const networkId = await web3.eth.net.getId()
        
        //load contract
        const votingData = Voting.networks[networkId]
        if(votingData){
            const voting = new web3.eth.Contract(Voting.abi, votingData.address)
            this.setState({voting})
            const start = await voting.methods.getVotingStartTime().call()
            const end = await voting.methods.getVotingEndTime().call()

            const startDateObject = new Date(start * 1000);
            const endDateObject = new Date(end * 1000);

            const startDate = startDateObject.toLocaleDateString();
            const startTime = startDateObject.toLocaleTimeString();

            const endDate = endDateObject.toLocaleDateString();
            const endTime = endDateObject.toLocaleTimeString();

            this.setState({startDate, startTime, endDate, endTime, loading:false})
        }
        else{
            window.alert('Error! Voting contract not deployed - no detected network!')
        }

    }

    constructor(props){
        super(props)
        this.state = {
            account: '0x0',
            voting: {},
            startDate: 'NaN',
            startTime: 'NaN',
            endDate: 'NaN',
            endTime: 'NaN',
            loading: true
        }
    }

    render() {
        return (
          <VotingProvider account={this.state.account}>
            <Navbar account={this.state.account} />
            <div>
                <Router>
                    <Switch>
                    <Route exact path="/" render={props => <LoginPage {...props} voting={this.state.voting} account={this.state.account} />} />
                    <Route
                    path="/voting"
                    render={props => (
                    <VotingPage {...props} voting={this.state.voting} account={this.state.account}>
                    {this.state.loading ? (
                      <p id='loader' className='text-center' style={{margin:'30px'}}>LOADING, PLEASE WAIT...</p>
                    ) : (
                      <div className='mt-5 m-auto'>
                        <h3>Start Time of elections: {this.state.startDate} {this.state.startTime} </h3>
                        <h3>End Time of elections: {this.state.endDate} {this.state.endTime} </h3>
                      </div>
                    )}
                    </VotingPage>
                    )}
                    />
                    </Switch>
                </Router>
            </div>
          </VotingProvider>
        );
      }
}

export default App;