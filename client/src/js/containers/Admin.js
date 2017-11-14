import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

class AdminContainer extends Component {

  render() {
    const {rcData} = this.props;
    if (rcData.success === true) {
      return (
        <div>
          {JSON.stringify(rcData.result)}
        </div>
      );
    } else if (rcData.loading === true) {
      return (
        <div>
          Loading data...
        </div>
      );
    } else if (rcData.failure === true) {
      <div>
        {JSON.stringify(rcData.error)}
      </div>
    } else {
      return null;
    }
  }
} 

AdminContainer.propTypes = {
  rcData: PropTypes.object
}

const Admin = connect(
  state => {
    return {
      rcData: state.rcData
    };
  }
)(AdminContainer);

export default Admin;
