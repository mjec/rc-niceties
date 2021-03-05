import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

ReactDOM.render(
    <App people_api="/api/v1/people"
         save_nicety_api="/api/v1/save-niceties"
         for_me_api="/api/v1/niceties-for-me"
         from_me_api="/api/v1/niceties-from-me"
         admin_edit_api="/api/v1/admin-edit-niceties"
         print_nicety_api="/api/v1/niceties-to-print"
         self_api="/api/v1/self"
         pollInterval={2000} />,
    document.getElementById('root')
);
