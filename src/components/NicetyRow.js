import React from 'react';
import { Row, Col } from 'react-bootstrap';

import Nicety from './Nicety';

const NicetyRow = React.createClass({
    render: function() {
        return (
            <Row>
              {this.props.data
                  .map(function(result) {
                      return (<Col lg="3" md="6" sm="6" xs="12">
                              <Nicety data={result}/>
                              </Col>);
                  })}
            </Row>
        );
    }
});

export default NicetyRow;
