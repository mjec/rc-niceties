import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import OpenNiceties from '../components/OpenNiceties';
import {postOpen} from '../actions/openAPI';

class AdminContainer extends Component {

  render() {
    const {openAPI, postOpen} = this.props;
    if (openAPI.success === true) {
      return (
        <div>
          {JSON.stringify(openAPI.result)}
          <OpenNiceties
            open={false}
            onClick={postOpen}
          />
        </div>
      );
    } else if (openAPI.loading === true) {
      return (
        <div>
          Loading data...
        </div>
      );
    } else if (openAPI.failure === true) {
      <div>
        {JSON.stringify(openAPI.error)}
      </div>
    } else {
      return null;
    }
  }
} 

AdminContainer.propTypes = {
  openAPI: PropTypes.object,
  postOpen: PropTypes.func
}

const Admin = connect(
  state => {
    return {
      openAPI: state.openAPI
    };
  }, {
    postOpen
  }
)(AdminContainer);

export default Admin;
