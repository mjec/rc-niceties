import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import {Nav, Navbar, NavDropdown, MenuItem,} from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import store from 'store2';

import octotie from './octotie.png';

import People from './components/People';
import NicetyDisplay from './components/NicetyDisplay';
import Admin from './components/Admin';

if (store.get("saved") === null) {
    store.set("saved", true);
}

const App = (props) => {
  const [fromMe, setFromMe] = useState([]);
  const [people, setPeople] = useState([]);
  const [niceties, setNiceties] = useState([]);
  const [selfInfo, setSelfInfo] = useState([])
  const [currentView, setCurrentView] = useState('write-niceties');

  const loadData = (api, setData) => {
    fetch(api, {
      headers: {'Content-Type': "application/json"},
      cache: 'no-cache'
    })
    .then(response => response.json())
    .then(data => setData(data))
    .catch(err => console.log(err))
  }

  useEffect(() => {
    loadData(props.people_api, setPeople);
  }, []);

  useEffect(() => {
    loadData(props.from_me_api, setFromMe);
  }, []);

  useEffect(() => {
    loadData(props.for_me_api, setNiceties);
  }, []);

  useEffect(() => {
    loadData(props.self_api, setSelfInfo);
  }, []);

  const handleSelect = (eventKey) => {
      setCurrentView(eventKey);
  }

  const selectComponent = (idx) => {
      switch (idx) {
          case "write-niceties":
              $('.dropdown-toggle').text('Write Niceties');
              $('.dropdown-toggle').append('<span class="caret"></span>');
              return <People
                  people={people}
                  fromMe={fromMe}
                  save_nicety_api={props.save_nicety_api}/>
          case "view-niceties":
              $('.dropdown-toggle').text('Niceties About You');
              $('.dropdown-toggle').append('<span class="caret"></span>');
              return <NicetyDisplay niceties={niceties}/>
          case "admin":
              $('.dropdown-toggle').text('Admin');
              $('.dropdown-toggle').append('<span class="caret"></span>');
              return <Admin admin_edit_api={props.admin_edit_api}/>
          default:
      }
  }

  let selectedComponent = selectComponent(currentView);
  let adminMenu = null;
  if (selfInfo.admin) {
      adminMenu = (<MenuItem eventKey="admin">Admin</MenuItem>);
  }

  return (
      <div className="App">
          <Navbar fixedTop id="main_nav">
              <div id="title">
                  recurse<br/>
                  nice-<br/>
                  ties
              </div>
              <img id="octotie" src={octotie} alt="an octopus wearing a nice tie" height="153"/>
              <Nav activeKey={currentView} onSelect={handleSelect}>
                  <NavDropdown>
                      <MenuItem eventKey="write-niceties">Write Niceties</MenuItem>
                      <MenuItem eventKey="view-niceties">Niceties About You</MenuItem>
                      {adminMenu}
                  </NavDropdown>
              </Nav>
          </Navbar>
          <div id="component_frame">
              {selectedComponent}
          </div>
      </div>
  );
}

export default App;
