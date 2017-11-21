import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {authenticate} from '../actions/auth';
import ShittyComponent from './ShittyComponent';

class AppContainer extends Component {

  componentDidMount() {
    const {params, authenticate} = this.props;
    authenticate(params); 
  }

  render() {
    const {auth, rcData} = this.props;
    if (auth.success === true) {
      return (
        <ShittyComponent />
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
  params: PropTypes.object,
  auth: PropTypes.object,
  authenticate: PropTypes.func
}

const App = connect(
  state => {
    return {
      auth: state.auth
    };
  }, {
    authenticate
  }
)(AppContainer);

export default App;
