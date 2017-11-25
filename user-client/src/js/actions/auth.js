import {AUTH_FAILURE, AUTH_LOADING, AUTH_SUCCESS} from '../reducers/auth';

export function setToken(token) {
  return function(dispatch, getState) {
    dispatch({
      type: AUTH_SUCCESS,
      result: token 
    });
  }
}

export function getToken(code) {
  return async function(dispatch, getState) {
    dispatch({
      type: AUTH_LOADING
    });
    await fetch(`${API_HOST}/admin/authorize`, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({ code })
    }).then(response => {
      return response.json();
    }).then(json => {
      const storage = {
        accessToken: json['access_token'],
        refreshToken: json['refresh_token'],
        createdAt: parseInt(json['created_at'], 10) * 1000,
        expiresIn: parseInt(json['expires_in'], 10) * 1000
      }
      localStorage.setItem('token', JSON.stringify(storage));
      dispatch({
        type: AUTH_SUCCESS,
        result: storage 
      });
    }).catch(error => {
      dispatch({
        type: AUTH_FAILURE,
        error
      });
    });
  }
}

export function checkExpired() {
  return async function(dispatch, getState) {
    const {createdAt, expiresIn} = getState().auth.result;
    if (Date.now() > createdAt + expiresIn / 2) {
      await dispatch(refreshToken());
    }
  }
}

export function refreshToken() {
  return async function(dispatch, getState) {
    const {refreshToken} = getState().auth.result;
    dispatch({
      type: AUTH_LOADING
    });
    await fetch(`${API_HOST}/admin/refresh`, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({ refresh_token: refreshToken })
    }).then(response => {
      return response.json();
    }).then(json => {
      const storage = {
        accessToken: json['access_token'],
        refreshToken: json['refresh_token'],
        createdAt: parseInt(json['created_at'], 10) * 1000,
        expiresIn: parseInt(json['expires_in'], 10) * 1000
      }
      localStorage.setItem('token', JSON.stringify(storage));
      dispatch({
        type: AUTH_SUCCESS,
        result: storage 
      });
    }).catch(error => {
      dispatch({
        type: AUTH_FAILURE,
        error
      });
    });
  }
}

export function authenticate(params) {
  return function(dispatch, getState) {
    const token = JSON.parse(localStorage.getItem('token'));

    if ('code' in params && !token) {
      dispatch(getToken(params['code']));
    }
    else if (!token) {
      window.location = `https://www.recurse.com/oauth/authorize?response_type=code&client_id=${OAUTH_CLIENT_ID}&redirect_uri=${OAUTH_REDIRECT_URI}`;
    } else {
      dispatch(setToken(token));
    }
    if (window.history != undefined && window.history.pushState != undefined) {
      window.history.pushState({}, document.title, window.location.pathname);
    }
  }
}
