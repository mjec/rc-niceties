import React, { Component } from 'react';
import $ from 'jquery';
import Remarkable from 'remarkable';
import logo from './logo.svg';
import './App.css';

var People = React.createClass({
    saveAllComments: function() {
        this.setState({haveSavedAll: true});
        React.Children.forEach(this.props.children, function(child) {
            this.setState
            child.saveCommentsToServer();
        });
    },

    componentDidUpdate: function () {
        this.setState({haveSavedAll: false});
    },

    render: function() {
        return (
            <div className="people">
              {this.props.data
                  .map(function(result) {
                  return <Person key={result.id} data={result} isChanged={false} pending={false}/>;
                  })}
              <SaveButton state={this.props.haveSavedAll} onClick={this.saveAllComments} text="Submit"/>
            </div>
        );
    }
});

var SaveButton = React.createClass({
    render: function() {
        return (
            <div className="button">
              <button disabled={this.props.state}>{this.props.text}</button>
            </div>
              );
    }
});

var Person = React.createClass({
    saveCommentsToServer: function() {
        if (this.props.isSent) {
            return;
        }
        this.setState({isSent: true});
        $.ajax({
            url: 'api/v1/niceties/' + this.props.data.end_date + '/' + this.props.data.id,
            dataType: 'json',
            type: 'POST',
            cache: false,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
                this.setState({isSent: false});
            }.bind(this)
        });
    },

    getInitialState: function() {
        return {value: localStorage.getItem("nicety-" + this.props.data.id),
                autosaveInterval: 10000, isSent: false};
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
        this.setState({isSent: false});
        localStorage.setItem("nicety-" + this.props.data.id, event.target.value);
        // handleChange is called for every letter typed into the input box.
        // Which might mean that you fire off hundreds of requests to the server.
        // The roundtrip on these is going to be long enough that it will interrupt your typing to see a failure/success.
        // Also it's likely to increase load on the server.
        // I have seen this hpapen
    },

    // TODO: button for each person for anonymous option

    componentDidMount: function() {
        // setInterval(this.autosave, this.props.autosaveInterval);
    },

    render: function() {
        return (
            <div className="person">
              <img src={this.props.data.avatar_url} className="img-responsive" />
              <div className="name">
                <p>{this.props.data.name}</p>
              </div>
              <form>
                <input type="text" value={this.state.value} onChange={this.handleChange}/>
                {this.props.pending ? '<img src="http://www.ajaxload.info/cache/FF/FF/FF/00/00/00/1-0.gif" alt="pending save..." />' : ''}
                {this.props.isSent}
              </form>
            </div>
        );
    }
});

var App = React.createClass({
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
              <h1>Comments</h1>
              <People data={this.state.data} />
            </div>
        );
    }
});

export default App;
