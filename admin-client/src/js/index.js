import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {createLogger} from 'redux-logger';
import rootReducer from './reducers';
import App from './containers/App';

const loggerMiddleware = createLogger();

const store = createStore(
  rootReducer,
  applyMiddleware(
    thunkMiddleware,
    loggerMiddleware
  )
);

const params = location.search.slice(1).split('&').reduce((acc, query) => {
  const arr = query.split('=');
  acc[arr[0]] = arr[1];
  return acc;
}, {});

render(
  <Provider store={store}>
    <App 
      params={params}
    />
  </Provider>,
  document.getElementById('root')
);
