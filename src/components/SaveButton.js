import React from 'react';
import { Button } from 'react-bootstrap';

const SaveButton = (props) => (
    <div className="button">
        <Button
            bsStyle="primary"
            bsSize="large"
            disabled={props.noSave === true}
            onClick={props.onClick}
        >
            Save
        </Button>
    </div>
);

export default SaveButton;
