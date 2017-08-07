import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {getTokens, setTokens} from '../actions/auth';
import Admin from './Admin';

class AppContainer extends Component {

  componentDidMount() {
    const {params, getTokens, setTokens} = this.props;

    const accessToken = localStorage.getItem('access-token');
    const refreshToken = localStorage.getItem('refresh-token');

    if ('code' in params) {
      getTokens(params['code']);
    }
    else if (!accessToken) {
      window.location = `https://www.recurse.com/oauth/authorize?response_type=code&client_id=${OAUTH_CLIENT_ID}&redirect_uri=${OAUTH_REDIRECT_URI}`;
    } else {
      setTokens(accessToken, refreshToken);
    }
  }

  render() {
    const {auth, rcData} = this.props;
    if (auth.success === true) {
      return (
        <Admin />
      );
    } else if (auth.loading === true) {
      return (
        <div>
          Loading user...
        </div>
      );
    } else if (auth.failure === true) {
      return (
        <div>
          {JSON.stringify(auth.error)}
        </div>
      );
    } else {
      return null; 
    }
  }
}

AppContainer.propTypes = {
  auth: PropTypes.object,
  getTokens: PropTypes.func,
  setTokens: PropTypes.func
}

const App = connect(
  state => {
    return {
      auth: state.auth
    };
  }, {
    getTokens,
    setTokens
  }
)(AppContainer);

export default App;
