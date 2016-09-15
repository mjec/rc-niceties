import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { Button, Grid, Row, Col, Image, Nav, NavItem, Checkbox } from 'react-bootstrap';
import ReactDOM, { findDOMNode } from 'react-dom';
import React, { Component } from 'react';

import Remarkable from 'remarkable';
import logo from './logo.svg';
import octotie from './octotie.png'
import suittie from './suittie.png'

import $ from 'jquery';

var updated_niceties_spinlock = false;
var updated_niceties = new Set();
const components = { People, NicetyDisplay }

if (localStorage.getItem("saved") === null || localStorage.getItem("saved") === "undefined") {
    localStorage.setItem("saved", "true");
}

var People = React.createClass({
    saveAllComments: function() {
        updated_niceties_spinlock = true;
        var data_to_save = [];
        updated_niceties.forEach(function(e) {
            var split_e = e.split(",");
            let anonymous;
            if (localStorage.getItem("anonymous-" + split_e[0]) === "undefined" || localStorage.getItem("anonymous-" + split_e[0]) === null) {
                anonymous = false;
            } else {
                anonymous = localStorage.getItem("anonymous-" + split_e[0]);
            }
            let text;
            if (localStorage.getItem("nicety-" + split_e[0]) === "undefined" || localStorage.getItem("nicety-" + split_e[0]) === null) {
                text = '';
            } else {
                text = localStorage.getItem("nicety-" + split_e[0]);
            }
            data_to_save.push(
                {
                    target_id: parseInt(split_e[0], 10),
                    end_date: split_e[1],
                    anonymous: anonymous,
                    text: text,
                }
            );
        });
        updated_niceties.clear();
        updated_niceties_spinlock = false;
        $.ajax({
            url: this.props.post_nicety_api,
            data: {'niceties': JSON.stringify(data_to_save)},
            dataType: 'json',
            type: 'POST',
            cache: false,
            success: function(data) {
                console.log('sucessful post');
                this.setState({noSave: true});
                localStorage.setItem("saved", "true");
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
                for (var i=0; i<data_to_save.length; i++){
                    updated_niceties.add(data_to_save[i].target_id + "," + data_to_save[i].end_date);
                }
            }.bind(this)
        });
    },

    getInitialState: function() {
        if (localStorage.getItem("saved") === "true") {
            return {
                data: [],
                noSave: true
            }
        } else if (localStorage.getItem("saved") === "false") {
            return {
                data: [],
                noSave: false
            }
        };
    },

    generateRows: function() {
        let dataList = [];
        for (let i = 0; i < this.props.people.length; i +=4) {
            let row = [];
            for (let j = 0; j < 4; j++) {
                if ((i + j) < this.props.people.length) {
                    row.push(this.props.people[i + j]);
                }
            }
            dataList.push(row);
        }
        return dataList;
    },

    saveReady: function () {
        this.setState({noSave: false});
    },

    render: function() {
        let list = this.generateRows();
        const savePass = this.saveReady.bind(this);
        return (
            <div className="people">
            <div id="save_button">
                <SaveButton
                    noSave={this.state.noSave}
                    onClick={this.saveAllComments}>
                    Save
                </SaveButton>
            </div>
              <Grid>
                {list.map(function(row) {
                    return (
                        <PeopleRow data={row} saveReady={savePass}/>
                    );
                }.bind(this))}
            </Grid>
                </div>
        );}
});

var SaveButton = React.createClass({

    render: function() {
        if (this.props.noSave === true) {
            return (
                <div className="button">
                <Button
                bsStyle="primary"
                bsSize="large"
                disabled
                >Save</Button>
                </div>
            );
        } else {
            return (
                <div className="button">
                <Button
                bsStyle="primary"
                bsSize="large"
                onClick={this.props.onClick}>Save</Button>
                </div>
            );
        }
    }
});

var PeopleRow = React.createClass({
    render: function() {
        const saveButton = this.props.saveButton;
        return (
            <Row>
              {this.props.data
                  .map(function(result) {
                      return (<Col lg ="3" md="4" sm="6" xs="12">
                              <Person data={result} saveReady={this.props.saveReady} saveButton={saveButton}/>
                              </Col>);
                  }.bind(this))}
            </Row>
        );
    }
});

var Person = React.createClass({

    getInitialState: function() {
        return { 
            textValue: localStorage.getItem("nicety-" + this.props.data.id),
            checkValue: localStorage.getItem("anonymous-" + this.props.data.id)
        };
    },
    textareaChange: function(event) {
        this.setState({textValue: event.target.value});
        localStorage.setItem("nicety-" + this.props.data.id, event.target.value);
        while (updated_niceties_spinlock) {}
        const addString = this.props.data.id + "," + this.props.data.end_date;
        if (!(addString in updated_niceties)) {
            updated_niceties.add(addString);
        }
        localStorage.setItem("saved", "false");
        this.props.saveReady();
    },
    checkboxChange: function(event) {
        this.setState({checkValue: event.target.checked});
        localStorage.setItem("anonymous-" + this.props.data.id, event.target.checked);
        while (updated_niceties_spinlock) {}
        const addString = this.props.data.id + "," + this.props.data.end_date;
        if (!(addString in updated_niceties)) {
            updated_niceties.add(addString);
        }
        localStorage.setItem("saved", "false");
        this.props.saveReady();
    },

    // TODO: button for each person for anonymous option

    componentDidMount: function() {
        // setInterval(this.autosave, this.props.autosaveInterval);
    },

    // hold a callback in the parent and pass it to the child as a prop that gets called in onChange
    // this callback would have the parent update its own min/max rows and pass this to all children
    // but it seems like for this to work you need child.state.height (to figureo ut the new min rows)

    render: function() {
        return (
            <div className="person"> 
                <Image responsive={true} src={this.props.data.avatar_url} circle={true} />
                <h3>{this.props.data.name}</h3>
            <textarea
                defaultValue={this.state.textValue}
                onChange={this.textareaChange}
                rows="6"
            />
            <Checkbox
                checked={this.state.checkValue}
                onChange={this.checkboxChange}
            >
                Submit Anonymously
            </Checkbox>

            </div>
        );
    }
});

var NicetyRow = React.createClass({
    render: function() {
        return (
            <Row>
              {this.props.data
                  .map(function(result) {
                      return (<Col lg ="3" md="4" sm="6" xs="12">
                              <Nicety data={result}/>
                              </Col>);
                  })}
            </Row>
        );
    }
});

var NicetyDisplay = React.createClass({

    getInitialState: function() {
        return {
            niceties: []
        };
    },

    // componentDidMount: function() {
    //     this.loadNicetiesFromServer();
    // },

    generateRows: function() {
        let dataList = [];
        for (let i = 0; i < this.props.niceties.length; i +=4) {
            let row = [];
            for (let j = 0; j < 4; j++) {
                if ((i + j) < this.props.niceties.length) {
                    row.push(this.props.niceties[i + j]);
                }
            }
            dataList.push(row);
        }
        return dataList;
    },

    render: function() {
        let list = this.generateRows();
        return (
            <div className="niceties">
              <Grid>
                {list.map(function(row) {
                    return (
                        <NicetyRow data={row}/>
                    );
                })}
            </Grid>
                </div>
        );}
});

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
            name = '';
        }
        return (
            <div className="nicety">
                <Image responsive={true} src={photo} circle={true} />
                <h3>{name}</h3>
                <textarea
                    defaultValue={this.props.data.text}
                    disable
                />
            </div>
        );
    }
})

var App = React.createClass({
    loadPeopleFromServer: function() {
        $.ajax({
            url: this.props.people_api,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({people: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.people, status, err.toString());
            }.bind(this)
        });
    },
    loadNicetiesFromServer: function() {
        $.ajax({
            url: this.props.get_nicety_api,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({niceties: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.niceties, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {
                people: [],
                niceties: [],
                currentview: "write-niceties"};
    },
    componentDidMount: function() {
        this.loadPeopleFromServer();
        this.loadNicetiesFromServer();
    },
    handleSelect: function(eventKey) {
        this.setState({currentview: eventKey});
        console.log(eventKey);
    },
    selectComponent: function(idx) {
        switch(idx) {
        case "write-niceties":
            return <People people={this.state.people}
                            post_nicety_api={this.props.post_nicety_api} />
        case "view-niceties":
            return <NicetyDisplay niceties={this.state.niceties} />
        default:
        };
    },
    render: function() {
        let selectedComponent = this.selectComponent(this.state.currentview);
        //console.log(selectedComponent);
        //console.log(<NavItem eventKey="write-niceties">Write niceties!</NavItem>);
        return (
            <div className="App">
                <div id="header">
                    <div id="logo">
                        <img id="octotie" src={octotie} height="185"/>
                    </div>
                    <Nav bsStyle="tabs" justified activeKey={this.state.currentview} onSelect={this.handleSelect}>
                    <NavItem eventKey="write-niceties"><h3>Write</h3></NavItem>
                    <NavItem eventKey="view-niceties"><h3>Read</h3></NavItem>
                  </Nav>
                </div>
              <div id="component_frame">
                {selectedComponent}
              </div>
            </div>
        );
    }
});

export default App;
