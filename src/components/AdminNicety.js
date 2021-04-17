import React from 'react';
import { Checkbox } from 'react-bootstrap';
import $ from 'jquery';

import SaveButton from './SaveButton';

const AdminNicety = React.createClass({
    getInitialState: function() {
        return {
            text: this.props.nicety.text,
            noSave: true,
            reviewedValue: this.props.nicety.reviewed
        };
    },

    reviewedChange: function(event) {
      this.setState({reviewedValue: event.target.checked, noSave: false});
    },
    saveNicety: function() {
        const data = {
            text: this.state.text,
            author_id: this.props.nicety.author_id,
            end_date: this.props.nicety.end_date,
            target_id: this.props.target_id,
            faculty_reviewed: this.state.reviewedValue
        }
        $.ajax({
            url: this.props.admin_edit_api,
            data: data,
            dataType: 'json',
            type: 'POST',
            cache: false,
            success: function() {
                this.setState({noSave: true});
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(err)
            }
        });
    },

    textareaChange: function(event) {
        this.setState({ text: event.target.value , noSave: false });

    },

    render: function() {
        let reviewedRender;
        if (this.state.reviewedValue === true) {
          reviewedRender = (
            <Checkbox checked onChange={this.reviewedChange}>
            Reviewed
            </Checkbox>
          );
        } else if (this.state.reviewedValue === false) {
          reviewedRender = (
            <Checkbox onChange={this.reviewedChange}>
            Reviewed
            </Checkbox>
          );
        }

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
                    {reviewedRender}
                    <br />
                </div>
            );
        }
        return nicetyReturn;
    }
});

export default AdminNicety;
