import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { Grid, Row, Col, Image, Nav, NavItem } from 'react-bootstrap';
import ReactDOM, { findDOMNode } from 'react-dom';
import Textarea from 'react-textarea-autosize';
import React, { Component } from 'react';

import Remarkable from 'remarkable';
import logo from './logo.svg';
import $ from 'jquery';

var updated_niceties_spinlock = false;
var updated_niceties = new Set();
const components = { People, NicetyDisplay, NicetyPrint}

var People = React.createClass({
    saveAllComments: function() {
        updated_niceties_spinlock = true;
        var data_to_save = [];
        updated_niceties.forEach(function(e) {
            var split_e = e.split(",");
            data_to_save.push(
                {
                    target_id: parseInt(split_e[0], 10),
                    end_date: split_e[1],
                    anonymous: true,                      // TODO: fix anonymous
                    text: localStorage.getItem("nicety-" + split_e[0]),
                }
            );
        })
        updated_niceties.clear();
        updated_niceties_spinlock = false;
        $.ajax({
            url: this.props.post_nicety_api,
            data: {'niceties': JSON.stringify(data_to_save)},
            dataType: 'json',
            type: 'POST',
            cache: false,
            success: function(data) {
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
        return {
            data: []
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

    render: function() {
        let list = this.generateRows();
        return (
            <div className="people">
              <SaveButton
                 disabled={False}
                 onclick={this.saveAllComments}
                 text="Save"/>
              <Grid>
                {list.map(function(row) {
                    return (
                        <PeopleRow data={row}/>
                    );
                })}
            </Grid>
                </div>
        );}
});

var SaveButton = React.createClass({
    render: function() {
        if (this.props.disabled) {
            return (
                <div className="button">
                  <button disabled="disabled">{this.props.text}</button>
                </div>
            );
        } else {
            return (
                <div className="button">
                  <button onClick={this.props.onclick}>{this.props.text}</button>
                </div>
            );
        }
    }
});

var PeopleRow = React.createClass({
    render: function() {
        return (
            <Row>
              {this.props.data
                  .map(function(result) {
                      return (<Col xs={3}>
                              <Person data={result}/>
                              </Col>);
                  })}
            </Row>
        );
    }
});

var Person = React.createClass({

    getInitialState: function() {
        return {value: localStorage.getItem("nicety-" + this.props.data.id)};
    },
    handleChange: function(event) {
        this.setState({value: event.target.value});
        localStorage.setItem("nicety-" + this.props.data.id, event.target.value);
        while (updated_niceties_spinlock) {}
        updated_niceties.add(this.props.data.id + "," + this.props.data.end_date);
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
              <p>{this.props.data.name}</p>
              <Textarea
                 minRows={3}
                 maxRows={6}
                 defaultValue={this.state.value}
                 onChange={this.handleChange}
                 />
            </div>
        );
    }
});

var NicetyPrint = React.createClass({
    render: function() {
        return (
            <div>
              "xd"
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
                      return (<Col xs={3}>
                              <Nicety data={result}/>
                              </Col>);
                  })}
            </Row>
        );
    }
});

var NicetyDisplay = React.createClass({
    // get_nicety_api
    loadNicetiesFromServer: function() {
        $.ajax({
            url: this.props.get_nicety_api,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({niceties: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.get_nicety_api, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {
            niceties: []
        };
    },
    componentDidMount: function() {
        this.loadNicetiesFromServer();
    },
    render: function() {
        return (
            <div>
              {this.state.niceties.map(function(nicety) {
                  return (
                      <Nicety data={nicety}/>
                  );
              })}
            </div>
        );
    }
});

var Nicety = React.createClass({
    render: function(){

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
                console.error(this.props.people_api, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {people: [],
                currentview: "view-niceties"};
    },
    componentDidMount: function() {
        this.loadPeopleFromServer();
    },
    handleSelect: function(eventKey) {
        this.setState({currentview: eventKey});
        console.log(eventKey);
    },
    selectComponent: function(idx) {
        switch(idx) {
        case "print-niceties":
            return <NicetyPrint get_nicety_api={this.props.get_nicety_api} />;
        case "write-niceties":
            return <People people={this.state.people}
                           post_nicety_api={this.props.post_nicety_api} />;
        case "view-niceties":
            return <People get_nicety_api={this.props.get_nicety_api} />;
        default:
        };
    },
    render: function() {
        let selectedComponent = this.selectComponent(this.state.currentview);
        //console.log(selectedComponent);
        //console.log(<NavItem eventKey="write-niceties">Write niceties!</NavItem>);
        return (
            <div className="App">
              <Nav bsStyle="tabs" activeKey={this.state.currentview} onSelect={this.handleSelect}>
                <NavItem eventKey="write-niceties">Write niceties!</NavItem>
                <NavItem eventKey="view-niceties">See your niceties!</NavItem>
                <NavItem eventKey="print-niceties">For Rachel! Print our niceties!</NavItem>
              </Nav>

              {selectedComponent}
            </div>
        );
    }
});

export default App;
