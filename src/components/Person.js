import React, { useState, useEffect } from 'react';
import {Checkbox, Image} from 'react-bootstrap';
import store from 'store2';

import {updated_niceties_spinlock} from "./People";

const Person = (props) => {
    const [textValue, setTextValue] = useState("");
    const [anonValue, setAnonValue] = useState(false);
    const [noReadValue, setNoReadValue] = useState(false);

    const updateState = () => {
      let dataPerson;
      let foundPerson = false;
      for (var i = 0; i < props.fromMe.length; i++) {
          if (props.fromMe[i].target_id === props.data.id) {
              dataPerson = props.fromMe[i];
              foundPerson = true;
              break;
          }
      }
      let dateUpdated;
      if (foundPerson) {
          if (dataPerson.date_updated === null) {
              dateUpdated = '';
          } else {
              dateUpdated = dataPerson.date_updated;
          }
      }
      if (foundPerson && store.get("date_updated-" + props.data.id) === null) {
          if (dataPerson.text !== '' && dataPerson.text !== null) {
              store.set("nicety-" + props.data.id, dataPerson.text);
              setTextValue(dataPerson.text);
          } else {
              setTextValue('');
          }
          store.set("anonymous-" + props.data.id, dataPerson.anonymous);
          setAnonValue(dataPerson.anonymous);
          store.set("no_read-" + props.data.id, dataPerson.no_read);
          setNoReadValue(dataPerson.no_read);
          store.set("date_updated-" + props.data.id, dateUpdated);
      } else if (foundPerson && store.get("date_updated-" + props.data.id) !== dateUpdated) {
          if (dataPerson.text !== '' && dataPerson.text !== null) {
              store.set("nicety-" + props.data.id, dataPerson.text);
              setTextValue(dataPerson.text);
          } else {
              setTextValue('');
          }
          store.set("anonymous-" + props.data.id, dataPerson.anonymous);
          setAnonValue(dataPerson.anonymous);
          store.set("no_read-" + props.data.id, dataPerson.no_read);
          setNoReadValue(dataPerson.no_read);
          store.set("date_updated-" + props.data.id, dateUpdated);
      } else {
          if (store.get("nicety-" + props.data.id) !== null) {
              setTextValue(store.get("nicety-" + props.data.id));
          }
          if (store.get("anonymous-" + props.data.id) !== null) {
              setAnonValue(store.get("anonymous-" + props.data.id));
          }
          if (store.get("no_read-" + props.data.id) !== null) {
              setNoReadValue(store.get("no_read-" + props.data.id));
          }
      }
  }

  useEffect(() => {
    updateState()
  }, [textValue, anonValue, noReadValue])

    const updateSave = () => {
        while (updated_niceties_spinlock) {}
        let addString;
        if (props.data.stints.length > 0) {
            addString = props.data.id + "," + props.data.stints[props.data.stints.length - 1].end_date;
        } else {
            addString = props.data.id + ",2016-11-03";
        }
        if (!(addString in props.updatedNiceties)) {
            props.setUpdatedNiceties(new Set([...props.updatedNiceties, addString]));
        }
        store.set("saved", false);
        props.saveReady();
    }

    const textareaChange = (event) => {
        setTextValue(event.target.value);
        store.set("nicety-" + props.data.id, event.target.value);
        updateSave();
    }

    const anonymousChange = (event) => {
        setAnonValue(event.target.checked);
        store.set("anonymous-" + props.data.id, event.target.checked);
        updateSave();
    }

    const noReadChange = (event) => {
        setNoReadValue(event.target.checked);
        store.set("no_read-" + props.data.id, event.target.checked);
        updateSave();
    }

    return (
          <div className="person">
              <Image responsive={true} src={props.data.avatar_url} title={props.data.full_name} circle={true}/>
              <h3>{props.data.name}</h3>
              <textarea
                  defaultValue={textValue}
                  onChange={textareaChange}
                  rows="6"
                  placeholder={props.data.placeholder}/>
              <Checkbox
                  checked={anonValue}
                  onChange={anonymousChange}>
                  Submit Anonymously
              </Checkbox>
              <Checkbox
                  checked={noReadValue}
                  onChange={noReadChange}>
                  Don't Read At Ceremony
              </Checkbox>
          </div>
      );
  }

export default Person;
