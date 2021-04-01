import React from 'react';
import $ from 'jquery';

import AdminNicety from './AdminNicety';

const Admin = React.createClass({
    loadAllNiceties: function(callback) {
        $.ajax({
            url: this.props.admin_edit_api,
            dataType: 'json',
            cache: false,
            success: function(data) {
                callback(data);
            },
            error: function(xhr, status, err) {
                console.error(this.props.people, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {
            niceties: []
        }
    },
    componentDidMount: function() {
        this.loadAllNiceties(function (data) {
            this.setState({niceties: data});
        }.bind(this));
    },
    render: function() {
        return (
            <div>
              {this.state.niceties.map((person) => {
                let noTextCheck = false;
                person.niceties.forEach((nicety) => {
                  if (nicety.text !== '' && nicety.text !== null) {
                    noTextCheck = true;
                  }
                });
                if (noTextCheck) {
                  return (
                    <div>
                      <h2>To {person.to_name}</h2>
                      <br />
                      {person.niceties.map((nicety) => {
                        return (
                          <AdminNicety nicety={nicety} target_id={person.to_id}
                            admin_edit_api={this.props.admin_edit_api}/>
                        );
                      })}
                      <hr />
                    </div>
                  );
                } else {
                  return null;
                }
              })}
            </div>
        );
    }
});

export default Admin;
