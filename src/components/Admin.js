import React, { useState, useEffect } from 'react';

import AdminNicety from './AdminNicety';

function Admin(props) {
  const loadAllNiceties = (callback) => {
    fetch(props.admin_edit_api, {
      headers: {
        'Content-Type': "application/json"
      },
      cache: 'no-cache',
    })
    .then((response) => response.json())
    .then((data) => callback(data))
    .catch((err) => console.log(err))
  }

  const [adminNiceties, setAdminNiceties] = useState([]);
  useEffect(() => {
    loadAllNiceties((data) => setAdminNiceties(data));
  }, [])

  return (
      <div>
        {adminNiceties.map((person) => {
          let textCheck = false;
          person.niceties.forEach((nicety) => {
            if (nicety.text !== '' && nicety.text !== null) {
              textCheck = true;
            }
          });
          if (textCheck) {
            return (
              <div>
                <h2>To {person.to_name}</h2>
                <br/> {
                  person.niceties.map((nicety) => {
                    return (
                      <AdminNicety nicety={nicety}/>
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

export default Admin;
