import React from 'react';
import ReactDOM from 'react-dom';
import NicetyDisplay from './App';
import App from './App';
import './index.css';

ReactDOM.render(
    <App people_api="/api/v1/people"
         post_nicety_api="/api/v1/save-niceties"
         get_nicety_api="/api/v1/niceties-for-me"
         load_nicety_api="/api/v1/niceties-from-me"
         all_niceties_api="/api/v1/admin-edit-niceties"
         print_nicety_api="/api/v1/niceties-to-print"
         self_api="/api/v1/self"
         pollInterval={2000} />,
    document.getElementById('root')
);
