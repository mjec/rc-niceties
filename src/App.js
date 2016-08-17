import React, { Component } from 'react';
import $ from 'jquery';
import Remarkable from 'remarkable';
import logo from './logo.svg';
import './App.css';

// class App extends Component {
//   render() {
//     return (
//       <div className="App">
//         <div className="App-header">
//           <img src={logo} className="App-logo" alt="logo" />
//           <h2>Welcome to React</h2>
//         </div>
//         <p className="App-intro">
//           To get started, edit <code>src/App.js</code> and save to reload.
//         </p>
//       </div>
//     );
//   }
// }

// - CommentBox
//  - CommentList
//   - Comment

var Comment = React.createClass({
    rawMarkup: function() {
        var md = new Remarkable();
        var rawMarkup = md.render(this.props.children.toString());
        return { __html: rawMarkup };
    },

    render: function() {
        return (
            <div className="comment">
              <h2 className="commentAuthor">
                {this.props.author}
              </h2>
              <span dangerouslySetInnerHTML={this.rawMarkup()} />
            </div>
        );
    }
});

var CommentBox = React.createClass({
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
            <div className="commentBox">
              <h1>Comments</h1>
              <Person data={this.state.data} />
            </div>
        );
    }
});

var Person = React.createClass({
    render: function() {
        var commentNodes = this.props.data.map(function(comment) {
            var dateEnd = new Date(comment.stints[0].end_date.toString());
            var timeDiff = dateEnd.getTime() - Date.now();
            var difference = Math.ceil(timeDiff / (1000 * 3600 * 24));
            var diffDays = (difference > 0) ? difference : 0;
            if (diffDays != 0)
                return (
                    <Comment author={comment.name} key={comment.id}>
                      {diffDays}
                    </Comment>
                );
        });
        return (
            <div className="person">
              {commentNodes}
            </div>
        );
    }
});

export default CommentBox;
