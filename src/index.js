import React from 'react';
import ReactDOM from 'react-dom';
import NicetyDisplay from './App';
import NicetyInput from './App';
import './index.css';

ReactDOM.render(
        <NicetyInput url="/api/v1/people" pollInterval={2000} />,
    document.getElementById('root')
);

ReactDOM.render(
        <NicetyDisplay url="/api/v1/niceties_to_print" pollInterval={2000} />,
    document.getElementById('root')
);
