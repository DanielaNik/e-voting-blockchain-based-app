import React, {Component} from 'react'

class Navbar extends Component {
    render(){
        return(
            <div className='container-fluid mb-5'>
            <nav className='navbar bg-dark fixed-top shadow p-2'>
                <a className='pl-3' style={{color:'white'}}>E-Voting App</a>
                <ul className='navbar-nav'>
                    <li className='nav-item pr-4'>
                        <small style={{color:'white'}}>Account number: {this.props.account}</small>
                    </li>
                </ul>
            </nav>
            </div>
        )
    }
}

export default Navbar;