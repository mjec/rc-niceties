import React from 'react';
import { Grid } from 'react-bootstrap';

import NicetyRow from './NicetyRow';

const NicetyDisplay = React.createClass({
    generateRows: function() {
        let dataList = [];
        for (let i = 0; i < this.props.niceties.length; i +=4) {
            let row = [];
            for (let j = 0; j < 4; j++) {
                if ((i + j) < this.props.niceties.length) {
                    row.push(this.props.niceties[i + j]);
                }
            }
            dataList.push(row);
        }
        return dataList;
    },

    render: function() {
        return (
            <div className="niceties">
                <Grid>
                    {this.generateRows().map((row) => <NicetyRow data={row}/>)}
                </Grid>
            </div>
        );}
});

export default NicetyDisplay;
