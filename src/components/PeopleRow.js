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
                    updatedNiceties={props.updatedNiceties}
                    setUpdatedNiceties={props.setUpdatedNiceties}
                />
            </Col>
        ))}
    </Row>
);

export default PeopleRow;
