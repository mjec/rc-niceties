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
      fetch(`${API_HOST}/authorize`, {
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
      window.location = `https://www.recurse.com/oauth/authorize?response_type=code&client_id=${OAUTH_CLIENT_ID}&redirect_uri=${OAUTH_REDIRECT_URI}`;
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
