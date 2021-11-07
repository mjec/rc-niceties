import React from 'react';

const AdminNicety = (props) => {
    let nicetyName;
    if ('name' in props.nicety) {
        nicetyName = props.nicety.name;
    } else {
        nicetyName = 'Anonymous';
    }

    let noRead = null;
    if (props.nicety.no_read === true) {
        noRead = "Don't Read At Ceremony, Please";
    }

    let nicetyReturn = null;
    if (props.nicety.text !== '' && props.nicety.text !== null) {
        const textStyle = {
            width: '75%',
            whiteSpace: 'pre-wrap'
        }
        nicetyReturn = (
            <div>
                <h4>From {nicetyName}</h4>
                <h5>{noRead}</h5>
                <p style={textStyle}>{props.nicety.text}</p>
            </div>
        );
    }
    return nicetyReturn;
}

export default AdminNicety;
