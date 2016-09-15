import React from 'react';
import ReactDOM from 'react-dom';
import NicetyDisplay from './App';
import App from './App';
import './index.css';

ReactDOM.render(
    <App people_api="/api/v1/people2"
         post_nicety_api="/api/v1/post-niceties"
         get_nicety_api="/api/v1/show-niceties"
         print_nicety_api="/api/v1/niceties-to-print"
         pollInterval={2000} />,
    document.getElementById('root')
);
