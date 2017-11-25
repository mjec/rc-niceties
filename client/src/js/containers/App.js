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
    const {auth} = this.props;
    if (auth.success === true) {
      return (
        <ShittyComponent
          token={auth.result.accessToken}
people_api="/api/v1/people"
         save_nicety_api="/api/v1/save-niceties"
         for_me_api="/api/v1/niceties-for-me"
         from_me_api="/api/v1/niceties-from-me"
         admin_edit_api="/api/v1/admin-edit-niceties"
         print_nicety_api="/api/v1/niceties-to-print"
         self_api="/api/v1/self"
         pollInterval={2000}
        />
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
