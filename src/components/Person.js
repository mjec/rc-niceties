import React from 'react';
import {Checkbox, Image} from 'react-bootstrap';
import store from 'store2';

import {updated_niceties_spinlock} from "./People";

class Person extends React.Component {
    constructor(props) {
        super(props)
        let textValue = '';
        let anonValue = false;
        let noReadValue = false;
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
                textValue = dataPerson.text;
            } else {
                textValue = '';
            }
            store.set("anonymous-" + props.data.id, dataPerson.anonymous);
            anonValue = dataPerson.anonymous;
            store.set("no_read-" + props.data.id, dataPerson.no_read);
            noReadValue = dataPerson.no_read;
            store.set("date_updated-" + props.data.id, dateUpdated);
        } else if (foundPerson && store.get("date_updated-" + props.data.id) !== dateUpdated) {
            if (dataPerson.text !== '' && dataPerson.text !== null) {
                store.set("nicety-" + props.data.id, dataPerson.text);
                textValue = dataPerson.text;
            } else {
                textValue = '';
            }
            store.set("anonymous-" + props.data.id, dataPerson.anonymous);
            anonValue = dataPerson.anonymous;
            store.set("no_read-" + props.data.id, dataPerson.no_read);
            noReadValue = dataPerson.no_read;
            store.set("date_updated-" + props.data.id, dateUpdated);
        } else {
            if (store.get("nicety-" + props.data.id) !== null) {
                textValue = store.get("nicety-" + props.data.id);
            }
            if (store.get("anonymous-" + props.data.id) !== null) {
                anonValue = store.get("anonymous-" + props.data.id);
            }
            if (store.get("no_read-" + props.data.id) !== null) {
                noReadValue = store.get("no_read-" + props.data.id);
            }
        }

        this.state = {
            textValue: textValue,
            anonValue: anonValue,
            noReadValue: noReadValue,
        }
    }

    updateSave = () => {
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
    }

    textareaChange = (event) => {
        this.setState({textValue: event.target.value});
        store.set("nicety-" + this.props.data.id, event.target.value);
        this.updateSave();
    }

    anonymousChange = (event) => {
        this.setState({anonValue: event.target.checked});
        store.set("anonymous-" + this.props.data.id, event.target.checked);
        this.updateSave();
    }

    noReadChange = (event) => {
        this.setState({noReadValue: event.target.checked});
        store.set("no_read-" + this.props.data.id, event.target.checked);
        this.updateSave();
    }

    render() {
        return (
            <div className="person">
                <Image responsive={true} src={this.props.data.avatar_url} title={this.props.data.full_name} circle={true}/>
                <h3>{this.props.data.name}</h3>
                <textarea
                    defaultValue={this.state.textValue}
                    onChange={this.textareaChange}
                    rows="6"
                    placeholder={this.props.data.placeholder}/>
                <Checkbox
                    checked={this.state.anonValue === true}
                    onChange={this.anonymousChange}>
                    Submit Anonymously
                </Checkbox>
                <Checkbox
                    checked={this.state.noReadValue === true}
                    onChange={this.noReadChange}>
                    Don't Read At Ceremony
                </Checkbox>
            </div>
        );
    }
}

export default Person;
