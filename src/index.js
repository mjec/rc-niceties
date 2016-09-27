import React from 'react';
import ReactDOM from 'react-dom';
import NicetyDisplay from './App';
import App from './App';
import './index.css';

ReactDOM.render(
    <App people_api="/api/v1/people"
         post_nicety_api="/api/v1/post-niceties"
         get_nicety_api="/api/v1/show-niceties"
         all_niceties_api="/api/v1/all-niceties"
         print_nicety_api="/api/v1/niceties-to-print"
         load_nicety_api="/api/v1/load-niceties"
         self_api="/api/v1/self"
         pollInterval={2000} />,
    document.getElementById('root')
);
