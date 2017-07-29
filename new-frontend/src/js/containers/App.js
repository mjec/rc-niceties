import React, {Component, PropTypes} from 'react';

export default class App extends Component {

  componentDidMount() {
    const refreshToken = localStorage.getItem('refresh-token');
    const queryDict = location.search.slice(1).split('&').reduce((acc, query) => {
      const arr = query.split('=');
      acc[arr[0]] = arr[1];
      return acc;
    }, {}); 
    if ('code' in queryDict) {
      fetch('http://localhost:5000/testauth', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
          code: queryDict['code']
        })
      }).then(request => {
        debugger;
        return request.json();
      }).then(json => {
        debugger;
      }).catch(err => {
        debugger
      });
    }
    else if (!refreshToken) {
      const clientId = 'f8e5036835584d12f95e020eba2efe95cdec3ab8a18743b997168b5b00f93fdc';
      const redirectURI = 'http://localhost:8000';
      window.location = `https://www.recurse.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectURI}`;
    }
  }

  render() {
    return (
      <div>
        Testing!
      </div>
    );
  }
}
