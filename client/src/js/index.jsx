/* global window, document */

import React from 'react';
import { render } from 'react-dom';
import App from './containers';

const params = window.location.search
  .slice(1)
  .split('&')
  .reduce((acc, query) => {
    const arr = query.split('=');
    const [k, v] = arr;
    acc[k] = v;
    return acc;
  }, {});

render(<App params={params} />, document.getElementById('root'));
