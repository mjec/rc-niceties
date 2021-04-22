import React from 'react';
import { Row, Col } from 'react-bootstrap';

import Person from "./Person";

const PeopleRow = (props) => (
    <Row>
        {props.data.map((result) => (
            <Col lg="3" md="6" sm="6" xs="12">
                <Person
                    fromMe={props.fromMe}
                    data={result}
                    saveReady={props.saveReady}
                    saveButton={props.saveButton}
                    updated_niceties={props.updated_niceties}
                />
            </Col>
        ))}
    </Row>
);

export default PeopleRow;
