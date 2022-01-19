import React, { useState } from 'react';
import { Modal, Grid } from 'react-bootstrap';
import store from 'store2';

import PeopleRow from './PeopleRow';
import SaveButton from "./SaveButton";


export let updated_niceties_spinlock = false;

const People = (props) => {
//   constructor(props) {
//     super(props);
//     this.state = {
//     data: [],
//     noSave: store.get("saved"),
//     justSaved: false,
//     updated_niceties: new Set()
//   }
// }

  // const [data, setData] = useState([]);
  const [noSave, setNoSave] = useState(store.get("saved"))
  const [justSaved, setJustSaved] = useState(false)
  const [updatedNiceties, setUpdatedNiceties] = useState(new Set())

  const saveAllComments = () => {
      updated_niceties_spinlock = true;
      let data_to_save = [];
      const dateUpdated = new Date(Date.now());
      const dateUpdatedStr = dateUpdated.toUTCString();
      updatedNiceties.forEach(function(e) {
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

      fetch(props.save_nicety_api, {
        method: 'POST',
        headers: {
          'Content-Type': "application/json"
        },
        cache: 'no-cache',
        body: JSON.stringify({'niceties': data_to_save}),
      })
      .then(response => response.json())
      .then(() => {
        setNoSave(true);
        setJustSaved(true);
        store.set("saved", true);
        updatedNiceties.forEach(function(e) {
          const split_e = e.split(",");
          store.set("date_updated-" + split_e[0], dateUpdatedStr);
        });
        setUpdatedNiceties(new Set());
      })
      .catch(err => console.log(err))
  }

  const generateRows = (inputArray) => {
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

  const saveReady = () => {
      setNoSave(false);
  }

  const alertTimer = () => {
      setTimeout(() => {
          setJustSaved(false);
      }, 3000);
  }

  let leaving = generateRows(props.people.leaving);
  let staying = generateRows(props.people.staying);
  let faculty = generateRows(props.people.faculty);

  let maybeHeader  = '';
  let maybeHR = '';
  if (staying.length > 0) {
      maybeHeader = (<h3>In-Batch</h3>);
      maybeHR = (<hr />);
  }
  if (justSaved) {
      alertTimer();
  }

  const leavingRows = leaving.map((row) => (
    <PeopleRow fromMe={props.fromMe} data={row} saveReady={saveReady}
    updatedNiceties={updatedNiceties} setUpdatedNiceties={setUpdatedNiceties}/>
  ))

  const stayingRows = staying.map((row) => (
    <PeopleRow fromMe={props.fromMe} data={row} saveReady={saveReady}
    updatedNiceties={updatedNiceties} setUpdatedNiceties={setUpdatedNiceties}/>
  ))

  const staffRows = faculty.map((row) => (
    <PeopleRow fromMe={props.fromMe} data={row} saveReady={saveReady}
    updatedNiceties={updatedNiceties} setUpdatedNiceties={setUpdatedNiceties}/>
  ))


  return (
      <div className="people">
        <Modal show={justSaved}>
          <Modal.Body>
            Niceties Saved!
          </Modal.Body>
        </Modal>
        <div className="save_button">
          <SaveButton
            noSave={noSave}
            onClick={saveAllComments}>
            Save
          </SaveButton>
        </div>
        <Grid>
          <hr />
          <h3>Leaving Soon</h3>
          { leavingRows }
          <hr />
          { maybeHeader }
          { stayingRows }
          { maybeHR }
          <h3>Staff</h3>
          { staffRows }
        </Grid>
        <div className="save_button">
          <SaveButton
            noSave={noSave}
            onClick={saveAllComments}>
            Save
          </SaveButton>
        </div>
      </div>
  );
}


export default People;
