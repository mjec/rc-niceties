import {OPEN_API_LOADING, OPEN_API_SUCCESS, OPEN_API_FAILURE} from '../reducers/openAPI';
import {checkExpired} from './auth';

export function getOpen() {
  return async function(dispatch, getState) {
    await dispatch(checkExpired());
    const {accessToken} = getState().auth.result;
    dispatch({
      type: OPEN_API_LOADING
    });
    fetch(`${API_HOST}/api/v1/admin/open`, {
      headers: new Headers({
        'X-Access-Token': `${accessToken}`,
      })
    }).then(response => {
      return response.json();
    }).then(result => {
      dispatch({
        type: OPEN_API_SUCCESS,
        result
      });
    }).catch(error => {
      dispatch({
        type: OPEN_API_FAILURE,
        error
      });
    });
  }
}

export function postOpen() {
  return async function(dispatch, getState) {
    await dispatch(checkExpired());
    const {accessToken} = getState().auth.result;
    const {open} = getState().openAPI.result;
    dispatch({
      type: OPEN_API_LOADING
    });
    fetch(`${API_HOST}/api/v1/admin/open`, {
      headers: new Headers({
        'X-Access-Token': `${accessToken}`,
        'Content-Type': 'application/json'
      }),
      method: 'POST',
      body: JSON.stringify({ open: !open })
    }).then(response => {
      return response.json();
    }).then(result => {
      dispatch({
        type: OPEN_API_SUCCESS,
        result
      });
    }).catch(error => {
      dispatch({
        type: OPEN_API_FAILURE,
        error
      });
    });
  }
}
