import React from 'react';
import ReactDOM from 'react-dom';
import CommentBox from './App';
import './index.css';

ReactDOM.render(
        <CommentBox url="/api/v1/batches/28/people" pollInterval={2000} />,
    document.getElementById('root')
);
