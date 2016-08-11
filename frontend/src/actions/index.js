var axios = require("axios");

function postState(todos) {
  return axios.post("/save", todos);
}

let nextTodoId = 0
export const addTodo = (text) => {
  return {
    type: 'ADD_TODO',
    id: nextTodoId++,
    text
  }
}

export const setVisibilityFilter = (filter) => {
  return {
    type: 'SET_VISIBILITY_FILTER',
    filter
  }
}

export const toggleTodo = (id) => {
  return {
    type: 'TOGGLE_TODO',
    id
  }
}

function stateSaved() {
  return {
    type: 'STATE_SAVED'
  }
}

function stateSaveError() {
  return {
    type: 'STATE_SAVE_ERROR'
  }
}

function stateSaveStart() {
  return {
    type: 'STATE_SAVE_REQUESTED'
  }
}

export const saveState = () => {
  return (dispatch, getState) => {
    dispatch(stateSaveStart());
    return postState(getState().todos)
      .then(
        ok => dispatch(stateSaved())
      )
      .catch(
        error => dispatch(stateSaveError())
      )
  }
}
