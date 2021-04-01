import React from 'react';
import { Button } from 'react-bootstrap';

const SaveButton = React.createClass({
    render: function() {
        if (this.props.noSave === true) {
            return (
                <div className="button">
                    <Button
                    bsStyle="primary"
                    bsSize="large"
                    disabled
                    >Save</Button>
                </div>
            );
        } else {
            return (
                <div className="button">
                    <Button
                    bsStyle="primary"
                    bsSize="large"
                    onClick={this.props.onClick}>Save</Button>
                </div>
            );
        }
    }
});

export default SaveButton;
