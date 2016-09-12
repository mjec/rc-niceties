import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { Grid, Row, Col, Image } from 'react-bootstrap';
import ReactDOM, { findDOMNode } from 'react-dom';
import Textarea from 'react-textarea-autosize';
import React, { Component } from 'react';

import Remarkable from 'remarkable';
import logo from './logo.svg';
import $ from 'jquery';

var updated_niceties_spinlock = false;
var updated_niceties = new Set();

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
            url: 'api/v1/niceties',
            data: {'niceties': JSON.stringify(data_to_save)},
            dataType: 'json',
            type: 'POST',
            cache: false,
            success: function(data) {
                // this.setState({haveSavedAll: true});
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
            data: [],
            haveSavedAll: true,
        };
    },

    generateRows: function() {
        let dataList = [];
        for (let i = 0; i < this.props.data.length; i +=4) {
            let row = [];
            for (let j = 0; j < 4; j++) {
                if ((i + j) < this.props.data.length) {
                    row.push(this.props.data[i + j]);
                }
            }
            dataList.push(row);
        }
        //return dataList.map(function(result) { return <Row data={result}/>; }
        return dataList;
    },

    render: function() {
        let list = this.generateRows();
        return (
            <div className="people">
              <SaveButton
                 disabled={false}
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

    // set a flag that this component has changed
    // have a function running under setInterval that monitors that flag
    // that function will:
    //   1. if pending is true, do nothing
    //   2. set pending to true
    //   3. set flag to false
    //   4. initiate save to server AJAX
    //   5. on failure set flag to true
    //   7. set pending to false
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
        // <div className="name">
        // <p>{this.props.data.name}</p>
        // </div>

        //this.state.value
        return (
            <div className="person">
              <Image responsive={true} src={this.props.data.avatar_url} circle={true} />
              <Textarea
                 minRows={3}
                 maxRows={6}
                 defaultValue={this.state.height}
                 onChange={this.handleChange}
                 />
            </div>
        );
    }
});

var NicetyInput = React.createClass({
    loadCommentsFromServer: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        this.loadCommentsFromServer();
        // setInterval(this.loadCommentsFromServer, this.props.pollInterval);

    },
    render: function() {
        return (
            <div className="App">
              <People data={this.state.data} haveSavedAll={true} />
            </div>
        );
    }
});

export default NicetyInput;
