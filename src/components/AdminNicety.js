import React from 'react';
import $ from 'jquery';

import SaveButton from './SaveButton';

const AdminNicety = React.createClass({
    getInitialState: function() {
        return {
            text: this.props.nicety.text,
            noSave: true
        };
    },

    saveNicety: function() {
        const data = {
            text: this.state.text,
            author_id: this.props.nicety.author_id,
            target_id: this.props.target_id
        }
        $.ajax({
            url: this.props.admin_edit_api,
            data: data,
            dataType: 'json',
            type: 'POST',
            cache: false,
            success: function(data) {
                this.setState({noSave: true});
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(err)
            }
        });
    },

    textareaChange: function() {
        this.setState({ text: event.target.value , noSave: false });
    },

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
                width: '75%'
            }
            nicetyReturn = (
                <div>
                    <h4>From {nicetyName}</h4>
                    <h5>{noRead}</h5>
                    <textarea
                        defaultValue={this.state.text}
                        onChange={this.textareaChange}
                        rows="6"
                        style={textStyle} />
                     <SaveButton
                        noSave={this.state.noSave}
                        onClick={this.saveNicety}>
                        Save
                    </SaveButton>
                    <br />
                </div>
            );
        }
        return nicetyReturn;
    }
});

export default AdminNicety;
