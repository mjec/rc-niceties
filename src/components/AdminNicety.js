import React from 'react';

const AdminNicety = React.createClass({
    render: function() {

        let nicetyName;
        if ('name' in this.props.nicety) {
            nicetyName = this.props.nicety.name;
        } else  {
            nicetyName = 'Anonymous';
        }

        let noRead = null;
        if (this.props.nicety.no_read === true) {
            noRead = "Don't Read At Ceremony, Please";
        }

        let nicetyReturn = null;
        if (this.props.nicety.text !== '' && this.props.nicety.text !== null) {
            const textStyle = {
                width: '75%',
                whiteSpace: 'pre-wrap'
            }
            nicetyReturn = (
                <div>
                    <h4>From {nicetyName}</h4>
                    <h5>{noRead}</h5>
                    <p style={textStyle}>{this.props.nicety.text}</p>
                </div>
            );
        }
        return nicetyReturn;
    }
});

export default AdminNicety;
