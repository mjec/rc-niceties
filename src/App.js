import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { Button, Grid, Row, Col, Image, Nav, Navbar, NavDropdown, MenuItem, Checkbox, Modal } from 'react-bootstrap';
import React from 'react';

import octotie from './octotie.png';
import suittie from './suittie.png';
import $ from 'jquery';

import People from './components/People';
import SaveButton from './components/SaveButton';
import NicetyDisplay from './components/NicetyDisplay';

// var updated_niceties_spinlock = false;
// var updated_niceties = new Set();
const components = { People, NicetyDisplay };

if (localStorage.getItem("saved") === null || localStorage.getItem("saved") === "undefined") {
    localStorage.setItem("saved", "true");
}



var Nicety = React.createClass({

    render: function() {
        let photo;
        if (this.props.data.anonymous) {
            photo = suittie;
        } else {
            photo = this.props.data.avatar_url;
        }
        let name;
        if ('name' in this.props.data) {
            name = this.props.data.name;
        } else {
            name = 'Anonymous';
        }
        return (
            <div className="nicety">
                <Image responsive={true} src={photo} circle={true} />
                <h3>{name}</h3>
                <textarea
                    defaultValue={this.props.data.text}
                    rows="6"
                    readOnly
                />
            </div>
        );
    }
})

var Admin = React.createClass({
    loadAllNiceties: function(callback) {
        $.ajax({
            url: this.props.admin_edit_api,
            dataType: 'json',
            cache: false,
            success: function(data) {
                callback(data);
            },
            error: function(xhr, status, err) {
                console.error(this.props.people, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {
            niceties: []
        }
    },
    componentDidMount: function() {
        this.loadAllNiceties(function (data) {
            this.setState({niceties: data});
        }.bind(this));
    },
    render: function() {
        return (
            <div>
                {this.state.niceties.map((person) => {
                    let noTextCheck = false;
                    person.niceties.forEach((nicety) => {
                        if (nicety.text !== '' && nicety.text !== null) {
                            noTextCheck = true;
                        }
                    });
                    if (noTextCheck) {
                        return (
                            <div>
                            <h2>To {person.to_name}</h2>
                                <br />
                                {person.niceties.map((nicety) => {
                                    return (
                                            <AdminNicety nicety={nicety} target_id={person.to_id}
                                                         admin_edit_api={this.props.admin_edit_api}/>
                                    );
                                })}
                            <hr />
                            </div>
                        );
                    } else {
                        return null;
                    }
                })}
            </div>
        );
    }
});

// abc
var AdminNicety = React.createClass({
    getInitialState: function() {
        return {
            text: this.props.nicety.text,
            noSave: true
        };
    },

    saveNicety: function() {
        const data = {
            text: this.state.text,
            author_id: this.props.nicety.author_id,
            target_id: this.props.target_id
        }
        $.ajax({
            url: this.props.admin_edit_api,
            data: data,
            dataType: 'json',
            type: 'POST',
            cache: false,
            success: function(data) {
                this.setState({noSave: true});
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(err)
            }
        });
    },

    textareaChange: function() {
        this.setState({ text: event.target.value , noSave: false });
    },

    render: function() {
        let nicetyName;
        if ('name' in this.props.nicety) {
            nicetyName = this.props.nicety.name;
        } else  {
            nicetyName = 'Anonymous';
        }

        let noRead = null;
        if (this.props.nicety.no_read === true) {
            noRead = "Don't Read At Ceremony, Please";
        }

        let nicetyReturn = null;
        if (this.props.nicety.text !== '' && this.props.nicety.text !== null) {
            const textStyle = {
                width: '75%'
            }
            nicetyReturn = (
                <div>
                    <h4>From {nicetyName}</h4>
                    <h5>{noRead}</h5>
                    <textarea
                        defaultValue={this.state.text}
                        onChange={this.textareaChange}
                        rows="6"
                        style={textStyle} />
                     <SaveButton
                        noSave={this.state.noSave}
                        onClick={this.saveNicety}>
                        Save
                    </SaveButton>
                    <br />
                </div>
            );
        }
        return nicetyReturn;
    }
});

var App = React.createClass({
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
            if ('status' in this.state.people) {
                return <h1>Niceties are closed!</h1>
            }
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
