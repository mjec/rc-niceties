import {getRcData} from './rcData';
import {AUTH_FAILURE, AUTH_LOADING, AUTH_SUCCESS} from '../reducers/auth';

export function setTokens(accessToken, refreshToken) {
  return function(dispatch, getState) {
    dispatch({
      type: AUTH_SUCCESS,
      result: {
        accessToken,
        refreshToken
      }
    });
    dispatch(getRcData());
  }
}

export function getTokens(code) {
  return function(dispatch, getState) {
    dispatch({
      type: AUTH_LOADING
    });
    fetch(`${API_HOST}/admin/authorize`, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({ code })
    }).then(response => {
      return response.json();
    }).then(json => {
      const accessToken = json['access_token'];
      const refreshToken = json['refresh_token'];
      localStorage.setItem('access-token', accessToken);
      localStorage.setItem('refresh-token', refreshToken);
      dispatch({
        type: AUTH_SUCCESS,
        result: {
          accessToken,
          refreshToken
        }
      });
      dispatch(getRcData());
    }).catch(error => {
      dispatch({
        type: AUTH_ERROR,
        error
      });
    });
  }
}

export function authenticate(params) {
  return function(dispatch, getState) {
    const accessToken = localStorage.getItem('access-token');
    const refreshToken = localStorage.getItem('refresh-token');

    if ('code' in params && !accessToken) {
      dispatch(getTokens(params['code']));
    }
    else if (!accessToken) {
      window.location = `https://www.recurse.com/oauth/authorize?response_type=code&client_id=${OAUTH_CLIENT_ID}&redirect_uri=${OAUTH_REDIRECT_URI}`;
    } else {
      dispatch(setTokens(accessToken, refreshToken));
    }
    if (window.history != undefined && window.history.pushState != undefined) {
      window.history.pushState({}, document.title, window.location.pathname);
    }
  }
}
