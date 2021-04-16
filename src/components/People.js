import React from 'react';
import { Modal, Grid } from 'react-bootstrap';
import $ from 'jquery';
import store from 'store2';

import PeopleRow from './PeopleRow';
import SaveButton from "./SaveButton";


export let updated_niceties_spinlock = false;

const People = React.createClass({
    saveAllComments: function() {
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
        $.ajax({
            url: this.props.save_nicety_api,
            data: {'niceties': JSON.stringify(data_to_save)},
            dataType: 'json',
            type: 'POST',
            cache: false,
            success: function() {
                this.setState({noSave: true});
                this.setState({justSaved: true});
                store.set("saved", true);
                this.state.updated_niceties.forEach(function(e) {
                    const split_e = e.split(",");
                    store.set("date_updated-" + split_e[0], dateUpdatedStr);
                });
                this.state.updated_niceties.clear();
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(err)
            }
        });
    },

    getInitialState: function() {
        if (store.get("saved") === true) {
            return {
                data: [],
                noSave: true,
                justSaved: false,
                updated_niceties: new Set()
            }
        } else if (store.get("saved") === false) {
            return {
                data: [],
                noSave: false,
                justSaved: false,
                updated_niceties: new Set()
            }
        }
    },

    generateRows: function(inputArray) {
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
    },

    saveReady: function () {
        this.setState({noSave: false});
    },

    alertTimer: function() {
        setTimeout(function () {
            this.setState({justSaved: false});
        }.bind(this), 3000);
    },

    render: function() {
        let leaving = this.generateRows(this.props.people.leaving);
        let staying = this.generateRows(this.props.people.staying);
        let special = this.generateRows(this.props.people.special);
        let faculty = this.generateRows(this.props.people.faculty);
        const savePass = this.saveReady.bind(this);

        let maybeHeader  = '';
        let maybeHR = '';
        if (staying.length > 0) {
            maybeHeader = (<h3>In-Batch</h3>);
            maybeHR = (<hr />);
        }
        if (this.state.justSaved) {
            this.alertTimer();
        }

        let staffHeader;
        let staffRows;
        //if (staying.length > 0) {
            // staffRows = special.map(function(row) {
            //     return (
            //         <PeopleRow fromMe={this.props.fromMe} data={row} saveReady={savePass}/>
            //     );
            // }.bind(this))
            staffRows = faculty.map(function(row) {
                return (
                    <PeopleRow fromMe={this.props.fromMe} data={row} saveReady={savePass} updated_niceties={this.state.updated_niceties}/>
                );
            }.bind(this))

            staffHeader = (
                <h3>Staff</h3>

            );
        //}
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
                {leaving.map(function(row) {
                  return (
                    <PeopleRow fromMe={this.props.fromMe} data={row} saveReady={savePass} updated_niceties={this.state.updated_niceties}/>
                  );
                }.bind(this))}
                <hr />
                { maybeHeader }
                {staying.map(function(row) {
                  return (
                    <PeopleRow fromMe={this.props.fromMe} data={row} saveReady={savePass} updated_niceties={this.state.updated_niceties}/>
                  );
                }.bind(this))}
                { maybeHR }
                { staffHeader }
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
        );}
});

export default People;
