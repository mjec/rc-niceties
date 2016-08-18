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

// var Comment = React.createClass({
//     rawMarkup: function() {
//         var md = new Remarkable();
//         var rawMarkup = md.render(this.props.children.toString());
//         return { __html: rawMarkup };
//     },

//     render: function() {
//         return (
//             <div className="comment">
//               <h2 className="commentAuthor">
//                 {this.props.author}
//               </h2>
//               <span dangerouslySetInnerHTML={this.rawMarkup()} />
//             </div>
//         );
//     }
// });

// var People = React.createClass({
//     render: function() {
//         var Person = this.props.data.map(function(comment) {
//             var dateEnd = new Date(comment.stints[0].end_date.toString());
//             var timeDiff = dateEnd.getTime() - Date.now();
//             var difference = Math.ceil(timeDiff / (1000 * 3600 * 24));
//             var diffDays = (difference > 0) ? difference : 0;
//             if (diffDays != 0)
//                 return (
//                     <div className="node">
//                          <img src={comment.avatar_url} className="img-responsive" />
//                          <Comment author={comment.name} key={comment.id}>
//                            {diffDays}
//                          </Comment>
                         
//                     </div>
//                 );
//         });
//         return (
//             <div className="person">
//               {Person}
//             </div>
//         );
//     }
// });

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
    render: function() {
        return ( 
            <div className="person">
                <img src={this.props.data.avatar_url} className="img-responsive" />
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
