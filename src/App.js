import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { Nav, Navbar, NavDropdown, MenuItem } from 'react-bootstrap';
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

const App = React.createClass({
    loadPeopleFromServer: function(callback) {
        $.ajax({
            url: this.props.people_api,
            dataType: 'json',
            cache: false,
            success: function(data) {
                callback(data);
            },
            error: function(xhr, status, err) {
                //console.error(this.props.people, status, err.toString());
            }
        });
    },
    loadNicetiesFromMe: function(callback) {
        $.ajax({
            url: this.props.from_me_api,
            dataType: 'json',
            cache: false,
            success: function(data) {
                callback(data);
            },
            error: function(xhr, status, err) {
                //console.error(this.props.fromMe, status, err.toString());
            }
        });
    },
    loadNicetiesForMe: function(callback) {
        $.ajax({
            url: this.props.for_me_api,
            dataType: 'json',
            cache: false,
            success: function(data) {
                callback(data);
            },
            error: function(xhr, status, err) {
                //console.error(this.props.niceties, status, err.toString());
            }
        });
    },
    loadSelfInfo: function(callback) {
        $.ajax({
            url: this.props.self_api,
            dataType: 'json',
            cache: false,
            success: function(data) {
                callback(data);
            },
            error: function(xhr, status, err) {
                //console.error(this.props.niceties, status, err.toString());
            }
        });
    },
    getInitialState: function() {
        return {
                fromMe: [],
                people: [],
                niceties: [],
                currentview: "write-niceties",
                selfInfo: [],
        };
    },
    componentDidMount: function() {
        this.loadNicetiesFromMe(function (data1) {
            this.loadPeopleFromServer(function (data2) {
                this.loadNicetiesForMe(function (data3) {
                    this.loadSelfInfo(function (data4) {
                        this.setState({
                            niceties: data3,
                            people: data2,
                            fromMe: data1,
                            selfInfo: data4
                        });
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this));
    },
    handleSelect: function(eventKey) {
        this.setState({currentview: eventKey});
    },
    selectComponent: function(idx) {
        switch(idx) {
        case "write-niceties":
            $('.dropdown-toggle').text('Write Niceties');
            $('.dropdown-toggle').append('<span class="caret"></span>');
            return <People people={this.state.people}
                            fromMe={this.state.fromMe}
                            save_nicety_api={this.props.save_nicety_api} />
        case "view-niceties":
            $('.dropdown-toggle').text('Niceties About You');
            $('.dropdown-toggle').append('<span class="caret"></span>');
            return <NicetyDisplay niceties={this.state.niceties} />
        case "admin":
            $('.dropdown-toggle').text('Admin');
            $('.dropdown-toggle').append('<span class="caret"></span>');
            return <Admin admin_edit_api={this.props.admin_edit_api}/>
        default:
        }
    },
    render: function() {
        let selectedComponent = this.selectComponent(this.state.currentview);
        let adminMenu = null;
        if (this.state.selfInfo.admin === true) {
            adminMenu = (<MenuItem eventKey="admin">Admin</MenuItem>);
        }
        return (
            <div className="App">
                <Navbar fixedTop id="main_nav">
                <div id="title">
                    recurse<br />
                    nice-<br />
                    ties
                </div>
                <img id="octotie" src={octotie} height="153"/>
                    <Nav activeKey={this.state.currentview} onSelect={this.handleSelect}>
                        <NavDropdown>
                            <MenuItem eventKey="write-niceties" >Write Niceties</MenuItem>
                            <MenuItem eventKey="view-niceties" >Niceties About You</MenuItem>
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
});

export default App;
