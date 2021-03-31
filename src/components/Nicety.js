import React from 'react';
import { Image } from 'react-bootstrap';

import suittie from '../suittie.png';

const Nicety = React.createClass({
    render: function() {
        let photo;
        if (this.props.data.anonymous) {
            photo = suittie;
        } else {
            photo = this.props.data.avatar_url;
        }
        let name;
        if ('name' in this.props.data) {
            name = this.props.data.name;
        } else {
            name = 'Anonymous';
        }
        return (
            <div className="nicety">
                <Image responsive={true} src={photo} circle={true} />
                <h3>{name}</h3>
                <textarea
                    defaultValue={this.props.data.text}
                    rows="6"
                    readOnly
                />
            </div>
        );
    }
})

export default Nicety;
