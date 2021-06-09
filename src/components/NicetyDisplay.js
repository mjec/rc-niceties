import React from 'react';
import { Grid } from 'react-bootstrap';

import NicetyRow from './NicetyRow';

const generateRows = (input) => {
    let dataList = [];
    for (let i = 0; i < input.length; i +=4) {
        let row = [];
        for (let j = 0; j < 4; j++) {
            if ((i + j) < input.length) {
                row.push(input[i + j]);
            }
        }
        dataList.push(row);
    }
    return dataList;
};

const NicetyDisplay = (props) => (
    <div className="niceties">
        <Grid>
            {generateRows(props.niceties).map((row) => <NicetyRow data={row}/>)}
        </Grid>
    </div>
);

export default NicetyDisplay;
