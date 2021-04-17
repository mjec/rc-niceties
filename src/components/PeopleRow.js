import React from 'react';
import { Row, Col } from 'react-bootstrap';

import Person from "./Person";

const PeopleRow = React.createClass({
    render: function() {
        const saveButton = this.props.saveButton;
        return (
            <Row>
              {this.props.data
                .map(function(result) {
                  return (<Col lg="3" md="6" sm="6" xs="12">
                    <Person fromMe={this.props.fromMe} data={result} saveReady={this.props.saveReady} saveButton={saveButton} updated_niceties={this.props.updated_niceties}/>
                  </Col>);
                }.bind(this))}
            </Row>
        );
    }
});

export default PeopleRow;
