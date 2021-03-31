import React from 'react';
import { Row, Col } from 'react-bootstrap';

import { Nicety } from '../App';

const NicetyRow = React.createClass({
    render: function() {
        return (
            <Row>
              {this.props.data
                  .map(function(result) {
                      return (<Col lg="3" md="4" sm="6" xs="12">
                              <Nicety data={result}/>
                              </Col>);
                  })}
            </Row>
        );
    }
});

export default NicetyRow;
