import React, { Component } from 'react';
import $ from 'jquery';
import Remarkable from 'remarkable';
import logo from './logo.svg';
import './App.css';

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

    render: function() {
        return (
            <div className="people">
              {this.props.data
                  .map(function(result) {
                  return <Person key={result.id} data={result} isChanged={false} pending={false}/>;
                  })}
              <SaveButton
                  // disabled={ updated_niceties.size === 0 || updated_niceties_spinlock }
                  disabled={false}
                  onclick={this.saveAllComments}
                  text="Save"/>
            </div>
        );
    }
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

var Person = React.createClass({
    // saveCommentsToServer: function() {
    //     if (this.props.isSent) {
    //         return;
    //     }
    //     this.setState({isSent: true});
    //     $.ajax({
    //         url: 'api/v1/niceties/' + this.props.data.end_date + '/' + this.props.data.id,
    //         dataType: 'json',
    //         type: 'POST',
    //         cache: false,
    //         success: function(data) {
    //             this.setState({data: data});
    //         }.bind(this),
    //         error: function(xhr, status, err) {
    //             console.error(this.props.url, status, err.toString());
    //             this.setState({isSent: false});
    //         }.bind(this)
    //     });
    // },

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
              <img src={this.props.data.avatar_url} role="presentation" className="img-responsive" />
              <div className="name">
                <p>{this.props.data.name}</p>
              </div>
              <form>
                <input type="text" value={this.state.value} onChange={this.handleChange}/>
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
              <People data={this.state.data} haveSavedAll={true} />
            </div>
        );
    }
});

export default App;
