import {getRcData} from './rcData';

export function setTokens(accessToken, refreshToken) {
  return function(dispatch, getState) {
    dispatch({
      type: 'AUTH_SUCCESS',
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
      type: 'AUTH_LOADING'
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
        type: 'AUTH_SUCCESS',
        result: {
          accessToken,
          refreshToken
        }
      });
      dispatch(getRcData());
    }).catch(error => {
      dispatch({
        type: 'AUTH_ERROR',
        error
      });
    });
  }
}
