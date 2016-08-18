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
                        return <Person key={result.id} data={result}/>;
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
        return {value: 'Hello!'};
    },

    handleChange: function(event) {
        this.setState({value: event.target.value});
    },

    render: function() {
        return ( 
            <div className="person">
                <img src={this.props.data.avatar_url} className="img-responsive" />
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
