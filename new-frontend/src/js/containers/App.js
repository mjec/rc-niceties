import React, {Component, PropTypes} from 'react';

export default class App extends Component {

  componentDidMount() {
    function fetchToken() {
      return fetch(`${API_HOST}/authorize`, {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
          code: queryDict['code']
        })
      })
    }
    function fetchUser(accessToken, refreshToken) {
      return fetch(`${API_HOST}/rc-test`, {
        headers: new Headers({
          'X-Access-Token': `${accessToken}`,
          'X-Refresh-Token': `${refreshToken}` 
        })
      })
    }
    const accessToken = localStorage.getItem('access-token');
    const refreshToken = localStorage.getItem('refresh-token');
    const queryDict = location.search.slice(1).split('&').reduce((acc, query) => {
      const arr = query.split('=');
      acc[arr[0]] = arr[1];
      return acc;
    }, {}); 
    if ('code' in queryDict) {
      fetchToken().then(response => {
        return response.json();
      }).then(json => {
        localStorage.setItem('access-token', json['access_token']);
        localStorage.setItem('refresh-token', json['refresh_token']);
        return fetchUser(json['access_token'], json['refresh_token']);
      }).then(response => {
        return response.json();
      }).then(json => {
        debugger;
      }).catch(err => {
        debugger
      });
    }
    else if (!accessToken) {
      window.location = `https://www.recurse.com/oauth/authorize?response_type=code&client_id=${OAUTH_CLIENT_ID}&redirect_uri=${OAUTH_REDIRECT_URI}`;
    } else {
      fetchUser(accessToken, refreshToken).then(response => {
        return response.json();
      }).then(json => {
        debugger;
      }).catch(err => {
        debugger
      });
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
