import React from 'react';
import { Row, Col } from 'react-bootstrap';

import Nicety from './Nicety';

const NicetyRow = (props) => (
    <Row>
        {props.data.map((result) => (
            <Col lg="3" md="6" sm="6" xs="12">
                <Nicety data={result}/>
            </Col>
        ))}
    </Row>
);

export default NicetyRow;
