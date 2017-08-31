import {RC_DATA_LOADING, RC_DATA_SUCCESS, RC_DATA_FAILURE} from '../reducers/rcData';
import {checkExpired} from './auth';

export function getRcData() {
  return function(dispatch, getState) {
    dispatch(checkExpired());
    const {accessToken} = getState().auth.result;
    dispatch({
      type: RC_DATA_LOADING
    });
    fetch(`${API_HOST}/admin/data`, {
      headers: new Headers({
        'X-Access-Token': `${accessToken}`,
      })
    }).then(response => {
      return response.json();
    }).then(result => {
      dispatch({
        type: RC_DATA_SUCCESS,
        result
      });
    }).catch(error => {
      dispatch({
        type: RC_DATA_FAILURE,
        error
      });
    });
  }
}
