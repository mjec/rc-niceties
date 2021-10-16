import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import {Nav, Navbar, NavDropdown, MenuItem,} from 'react-bootstrap';
import React from 'react';
import $ from 'jquery';
import store from 'store2';

import octotie from './octotie.png';

import People from './components/People';
import NicetyDisplay from './components/NicetyDisplay';
import Admin from './components/Admin';

if (store.get("saved") === null) {
    store.set("saved", true);
}

class App extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        fromMe: [],
        people: [],
        niceties: [],
        currentview: "write-niceties",
        selfInfo: []
    }
  }

    loadPeopleFromServer = (callback) => {
      fetch(this.props.people_api, {
        headers: {'Content-Type': "application/json"},
        cache: 'no-cache'
      })
      .then(response => response.json())
      .then(data => callback(data))
      .catch(err => console.log(err))
    }

    loadNicetiesFromMe = (callback) => {
      fetch(this.props.from_me_api, {
        headers: {'Content-Type': "application/json"},
        cache: 'no-cache'
      })
      .then(response => response.json())
      .then(data => callback(data))
      .catch(err => console.log(err))
    }

    loadNicetiesForMe = (callback) => {
      fetch(this.props.for_me_api, {
        headers: {'Content-Type': "application/json"},
        cache: 'no-cache'
      })
      .then(response => response.json())
      .then(data => callback(data))
      .catch(err => console.log(err))
    }

    loadSelfInfo = (callback) => {
      fetch(this.props.self_api, {
        headers: {'Content-Type': "application/json"},
        cache: 'no-cache'
      })
      .then(response => response.json())
      .then(data => callback(data))
      .catch(err => console.log(err))
    }

    componentDidMount = () => {
        this.loadNicetiesFromMe((data) => {
            this.setState({fromMe: data})
        })
        this.loadPeopleFromServer((data) => {
            this.setState({people: data})
        })
        this.loadNicetiesForMe((data) => {
            this.setState({niceties: data})
        })
        this.loadSelfInfo((data) => {
            this.setState({selfInfo: data})
        })
    }

    handleSelect = (eventKey) => {
        this.setState({currentview: eventKey});
    }

    selectComponent = (idx) => {
        switch (idx) {
            case "write-niceties":
                $('.dropdown-toggle').text('Write Niceties');
                $('.dropdown-toggle').append('<span class="caret"></span>');
                return <People
                    people={this.state.people}
                    fromMe={this.state.fromMe}
                    save_nicety_api={this.props.save_nicety_api}/>
            case "view-niceties":
                $('.dropdown-toggle').text('Niceties About You');
                $('.dropdown-toggle').append('<span class="caret"></span>');
                return <NicetyDisplay niceties={this.state.niceties}/>
            case "admin":
                $('.dropdown-toggle').text('Admin');
                $('.dropdown-toggle').append('<span class="caret"></span>');
                return <Admin admin_edit_api={this.props.admin_edit_api}/>
            default:
        }
    }

    render() {
        let selectedComponent = this.selectComponent(this.state.currentview);
        let adminMenu = null;
        if (this.state.selfInfo.admin === true) {
            adminMenu = (<MenuItem eventKey="admin">Admin</MenuItem>);
        }
        return (
            <div className="App">
                <Navbar fixedTop="fixedTop" id="main_nav">
                    <div id="title">
                        recurse<br/>
                        nice-<br/>
                        ties
                    </div>
                    <img id="octotie" src={octotie} alt="" height="153"/>
                    <Nav activeKey={this.state.currentview} onSelect={this.handleSelect}>
                        <NavDropdown>
                            <MenuItem eventKey="write-niceties">Write Niceties</MenuItem>
                            <MenuItem eventKey="view-niceties">Niceties About You</MenuItem>
                            {adminMenu}
                        </NavDropdown>
                    </Nav>
                </Navbar>
                <div id="component_frame">
                    {selectedComponent}
                </div>
            </div>
        );
    }
}

export default App;
