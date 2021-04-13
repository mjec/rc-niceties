import React from 'react';
import { Checkbox, Image } from 'react-bootstrap';
import store from 'store2';

import { updated_niceties_spinlock } from "./People";


const Person = React.createClass({
    getInitialState: function() {
        let textValue = '';
        let checkValue = false;
        let noReadValue = false;
        let dataPerson;
        let foundPerson = false;
        for (var i = 0; i < this.props.fromMe.length; i++) {
            if (this.props.fromMe[i].target_id === this.props.data.id) {
                dataPerson = this.props.fromMe[i];
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
        if (foundPerson && store.get("date_updated-" + this.props.data.id) === null) {
            if (dataPerson.text !== '' && dataPerson.text !== null) {
                store.set("nicety-" + this.props.data.id, dataPerson.text);
                textValue = dataPerson.text;
            } else {
                textValue = '';
            }
            store.set("anonymous-" + this.props.data.id, dataPerson.anonymous);
            checkValue = dataPerson.anonymous;
            store.set("no_read-" + this.props.data.id, dataPerson.no_read);
            noReadValue = dataPerson.no_read;
            store.set("date_updated-" + this.props.data.id, dateUpdated);
        } else if (foundPerson && store.get("date_updated-" + this.props.data.id) !== dateUpdated) {
            if (dataPerson.text !== '' && dataPerson.text !== null) {
                store.set("nicety-" + this.props.data.id, dataPerson.text);
                textValue = dataPerson.text;
            } else {
                textValue = '';
            }
            store.set("anonymous-" + this.props.data.id, dataPerson.anonymous);
            checkValue = dataPerson.anonymous;
            store.set("no_read-" + this.props.data.id, dataPerson.no_read);
            noReadValue = dataPerson.no_read;
            store.set("date_updated-" + this.props.data.id, dateUpdated);
        } else {
            if (store.get("nicety-" + this.props.data.id) !== null) {
                textValue = store.get("nicety-" + this.props.data.id);
            }
            if (store.get("anonymous-" + this.props.data.id) !== null) {
                checkValue = store.get("anonymous-" + this.props.data.id);
            }
            if (store.get("no_read-" + this.props.data.id) !== null) {
                noReadValue = store.get("no_read-" + this.props.data.id);
            }
        }
        return {
            textValue: textValue,
            checkValue: checkValue,
            noReadValue: noReadValue,
        }
    },
    updateSave: function() {
        while (updated_niceties_spinlock) {}
        let addString;
        if (this.props.data.stints.length > 0) {
            addString = this.props.data.id + "," + this.props.data.stints[this.props.data.stints.length - 1].end_date;
        } else {
            addString = this.props.data.id + ",2016-11-03";
        }
        if (!(addString in this.props.updated_niceties)) {
            this.props.updated_niceties.add(addString);
        }
        store.set("saved", false);
        this.props.saveReady();
    },
    textareaChange: function(event) {
        this.setState({textValue: event.target.value});
        store.set("nicety-" + this.props.data.id, event.target.value);
        this.updateSave();
    },
    anonymousChange: function(event) {
        this.setState({checkValue: event.target.checked});
        store.set("anonymous-" + this.props.data.id, event.target.checked);
        this.updateSave();
    },
    noReadChange: function(event) {
        this.setState({noReadValue: event.target.checked});
        store.set("no_read-" + this.props.data.id, event.target.checked);
        this.updateSave();
    },

    // TODO: button for each person for anonymous option

    componentDidMount: function() {
        // setInterval(this.autosave, this.props.autosaveInterval);
    },

    // hold a callback in the parent and pass it to the child as a prop that gets called in onChange
    // this callback would have the parent update its own min/max rows and pass this to all children
    // but it seems like for this to work you need child.state.height (to figureo ut the new min rows)

    render: function() {
        let anonymousRender;
        if (this.state.checkValue === true) {
            anonymousRender = (
                <Checkbox checked onChange={this.anonymousChange}>
                    Submit Anonymously
                </Checkbox>
            );
        } else if (this.state.checkValue === false) {
            anonymousRender = (
                <Checkbox onChange={this.anonymousChange}>
                    Submit Anonymously
                </Checkbox>
            );
        }

        let noReadRender;
        if (this.state.noReadValue === true) {
            noReadRender = (
                <Checkbox checked onChange={this.noReadChange}>
                    Don't Read At Ceremony
                </Checkbox>
            );
        } else if (this.state.noReadValue === false) {
            noReadRender = (
                <Checkbox onChange={this.noReadChange}>
                    Don't Read At Ceremony
                </Checkbox>
            );
        }
        return (
            <div className="person">
                <Image responsive={true} src={this.props.data.avatar_url} circle={true} />
                <h3>{this.props.data.name}</h3>
            <textarea
                defaultValue={this.state.textValue}
                onChange={this.textareaChange}
                rows="6"
            />
            {anonymousRender}
            {noReadRender}
            </div>
        );
    }
});

export default Person;
