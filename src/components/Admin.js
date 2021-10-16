import React from 'react';

import AdminNicety from './AdminNicety';

class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    niceties: []
  }
}

  loadAllNiceties = (callback) => {
    fetch(this.props.admin_edit_api, {
      headers: {
        'Content-Type': "application/json"
      },
      cache: 'no-cache',
    })
    .then((response) => response.json())
    .then((data) => callback(data))
    .catch((err) => console.log(err))
  }

  componentDidMount = () => {
    this.loadAllNiceties((data) => this.setState({niceties: data})
    );
  }

  render() {
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
                <br/> {
                  person.niceties.map((nicety) => {
                    return (
                      <AdminNicety
                        nicety={nicety}
                        target_id={person.to_id}
                        admin_edit_api={this.props.admin_edit_api}/>
                    );
                  })
                }
                <hr/>
              </div>
            );
          } else {
            return null;
          }
        })}
      </div>
    );
  }
}

export default Admin;
