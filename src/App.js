import React, { Component } from 'react';
import $ from 'jquery';
import Remarkable from 'remarkable';
import logo from './logo.svg';
import './App.css';

var People = React.createClass({

    render: function() {
        var dataa = this.props.data
                .filter(function(result) {
                    var dateEnd = new Date(result.stints[0].end_date.toString());
                    var timeDiff = dateEnd.getTime() - Date.now();
                    var difference = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    var diffDays = (difference > 0) ? difference : 0;
                    return (diffDays != 0)
                })
                console.log(dataa);
               return (
            <div className="people">
                {dataa.map(function(result) {
                    return <Person key={result.id} data={result} isChanged={false} pending={false}/>;
                    })
                }
            </div>
        );
    }
});

var Person = React.createClass({
    saveCommentsToServer: function() {
        $.ajax({
            url: 'api/v1/niceties/28/' + this.props.data.id,
            dataType: 'json',
            type: 'POST',
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
        return {value: localStorage.getItem("nicety-" + this.props.data.id),
                autosaveInterval: 10000};
    },

    handleChange: function(event) {
        this.setState({value: event.target.value});
        this.setState({isChanged: true});
        localStorage.setItem("nicety-" + this.props.data.id, event.target.value);

        // set a flag that this component has changed
        // have a function running under setInterval that monitors that flag
        // that function will:
        //   1. if pending is true, do nothing
        //   2. set pending to true
        //   3. set flag to false
        //   4. initiate save to server AJAX
        //   5. on failure set flag to true
        //   7. set pending to false

        //         handleChange is called for every letter typed into the input box. Which might mean that you fire off hundreds of requests to the server.
        //             The roundtrip on these is going to be long enough that it will interrupt your typing to see a failure/success.
        //             Also it's likely to increase load on the server.
        // I have seen this hpapen
    },


    // I think this saves to disk fairly regularly
    // It is quite a good API, designed for offline use cases like this.
    //     Because they aren't interested in the problem of people losing data.
    // I guess it adds some complexity? Because you have to save every time there is a change.
    // localStorage API?

    autosave: function() {
        if (this.props.pending == false && this.props.isChanged) {
            this.setState({pending: true});
            $.ajax({
                url: 'api/v1/niceties/28/' + this.props.data.id,
                dataType: 'json',
                type: 'POST',
                cache: false,
                success: function(data) {
                    this.setState({data: data});
                }.bind(this),
                error: function(xhr, status, err) {
                    this.setState({isChanged: true});
                    console.error(this.props.url, status, err.toString());
                }.bind(this),
                complete: function(xhr, status) {
                    this.setState({pending: false});
                }
            });
        }
    },

    componentDidMount: function() {
        setInterval(this.autosave, this.props.autosaveInterval);
    },

    render: function() {
        return (
            <div className="person">
                <img src={this.props.data.avatar_url} className="img-responsive" />
                <form>
                    <input type="text" value={this.state.value} onChange={this.handleChange}/>
                    {this.props.pending ? '<img src="http://www.ajaxload.info/cache/FF/FF/FF/00/00/00/1-0.gif" alt="pending save..." />' : ''}
                </form>

// Is there a JSX if/else?
//                 It's just entertaining for me how ingrained it is in the way I type. I didn't expect it.
// I keep wanting to use vim shortcut keys and having to stop myself
//  maybe we should include some marker to indicate a save is pending?
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
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
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
