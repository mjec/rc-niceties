import React from 'react';
import { Modal, Grid } from 'react-bootstrap';
import store from 'store2';

import PeopleRow from './PeopleRow';
import SaveButton from "./SaveButton";


export let updated_niceties_spinlock = false;

class People extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    data: [],
    noSave: store.get("saved"),
    justSaved: false,
    updated_niceties: new Set()
  }
}

  saveAllComments = () => {
      updated_niceties_spinlock = true;
      let data_to_save = [];
      const dateUpdated = new Date(Date.now());
      const dateUpdatedStr = dateUpdated.toUTCString();
      this.state.updated_niceties.forEach(function(e) {
          const split_e = e.split(",");
          let end_date;
          if (split_e[1] === "null") {
            end_date = null;
          } else {
            end_date = split_e[1];
          }
          const anonymous = store.get("anonymous-" + split_e[0], false);
          const text = store.get("nicety-" + split_e[0], '');
          const noRead = store.get("no_read-" + split_e[0], false);

          data_to_save.push(
              {
                  target_id: parseInt(split_e[0], 10),
                  end_date: end_date,
                  anonymous: anonymous,
                  text: text,
                  no_read: noRead,
                  date_updated: dateUpdatedStr
              }
          );
      });
      updated_niceties_spinlock = false;

      fetch(this.props.save_nicety_api, {
        method: 'POST',
        headers: {
          'Content-Type': "application/json"
        },
        cache: 'no-cache',
        body: JSON.stringify({'niceties': data_to_save}),
      })
      .then(response => response.json())
      .then(data => {
        this.setState({noSave: true});
        this.setState({justSaved: true});
        store.set("saved", true);
        this.state.updated_niceties.forEach(function(e) {
          const split_e = e.split(",");
          store.set("date_updated-" + split_e[0], dateUpdatedStr);
        });
        this.state.updated_niceties.clear();
      })
      .catch(err => console.log(err))
  }

  generateRows = (inputArray) => {
      let dataList = [];
      if (inputArray !== undefined) {
          for (let i = 0; i < inputArray.length; i +=4) {
              let row = [];
              for (let j = 0; j < 4; j++) {
                  if ((i + j) < inputArray.length) {
                      row.push(inputArray[i + j]);
                  }
              }
              dataList.push(row);
          }
      }
      return dataList;
  }

  saveReady = () => {
      this.setState({noSave: false});
  }

  alertTimer = () => {
      setTimeout(function () {
          this.setState({justSaved: false});
      }.bind(this), 3000);
  }

  render() {
      let leaving = this.generateRows(this.props.people.leaving);
      let staying = this.generateRows(this.props.people.staying);
      let faculty = this.generateRows(this.props.people.faculty);

      let maybeHeader  = '';
      let maybeHR = '';
      if (staying.length > 0) {
          maybeHeader = (<h3>In-Batch</h3>);
          maybeHR = (<hr />);
      }
      if (this.state.justSaved) {
          this.alertTimer();
      }

      const staffRows = faculty.map((row) => (
          <PeopleRow fromMe={this.props.fromMe} data={row} saveReady={this.saveReady} updated_niceties={this.state.updated_niceties}/>
        ))

      return (
          <div className="people">
            <Modal show={this.state.justSaved}>
              <Modal.Body>
                Niceties Saved!
              </Modal.Body>
            </Modal>
            <div className="save_button">
              <SaveButton
                noSave={this.state.noSave}
                onClick={this.saveAllComments}>
                Save
              </SaveButton>
            </div>
            <Grid>
              <hr />
              <h3>Leaving Soon</h3>
              {leaving.map((row) => (
                  <PeopleRow fromMe={this.props.fromMe} data={row} saveReady={this.saveReady} updated_niceties={this.state.updated_niceties}/>
                ))}

              <hr />
              { maybeHeader }
              {staying.map((row) => (
                  <PeopleRow fromMe={this.props.fromMe} data={row} saveReady={this.saveReady} updated_niceties={this.state.updated_niceties}/>
                ))}

              { maybeHR }
              <h3>Staff</h3>
              { staffRows }
            </Grid>
            <div className="save_button">
              <SaveButton
                noSave={this.state.noSave}
                onClick={this.saveAllComments}>
                Save
              </SaveButton>
            </div>
          </div>
      );
    }

}

export default People;
