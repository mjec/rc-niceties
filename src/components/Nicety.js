import React from 'react';
import { Image } from 'react-bootstrap';

import suittie from '../suittie.png';

const Nicety = (props) => {
    let photo;
    if (props.data.anonymous) {
        photo = suittie;
    } else {
        photo = props.data.avatar_url;
    }
    let name;
    if ('name' in props.data) {
        name = props.data.name;
    } else {
        name = 'Anonymous';
    }
    return (
        <div className="nicety">
            <Image responsive={true} src={photo} circle={true} />
            <h3>{name}</h3>
            <textarea
                defaultValue={props.data.text}
                rows="6"
                readOnly
            />
        </div>
    );
};

export default Nicety;
