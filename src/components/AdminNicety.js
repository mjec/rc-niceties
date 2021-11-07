import React from 'react';
import {Checkbox} from 'react-bootstrap';

import SaveButton from './SaveButton';

class AdminNicety extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        text: this.props.nicety.text,
        noSave: true,
        reviewedValue: this.props.nicety.reviewed,
    }
  }

    reviewedChange = (event) => {
        this.setState({reviewedValue: event.target.checked, noSave: false,});
    }

    saveNicety = () => {
        const data = {
            text: this.state.text,
            author_id: this.props.nicety.author_id,
            end_date: this.props.nicety.end_date,
            target_id: this.props.target_id,
            faculty_reviewed: this.state.reviewedValue,
        }
        fetch(this.props.admin_edit_api, {
          method: 'POST',
          headers: {
            'Content-Type': "application/json",
          },
          cache: 'no-cache',
          body: JSON.stringify(data),
        })
        .then(() => this.setState({noSave: true}))
        .catch((err) => console.log(err))
    }

    textareaChange = (event) => {
        this.setState({text: event.target.value, noSave: false,});
    }

    render() {
        let reviewedRender;
        if (this.state.reviewedValue === true) {
            reviewedRender = (
                <Checkbox checked="checked" onChange={this.reviewedChange}>
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
        } else {
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
}

export default AdminNicety;
