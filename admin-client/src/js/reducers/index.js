import {combineReducers} from 'redux';
import openAPI from './openAPI';
import auth from './auth';

export default combineReducers({
  openAPI,
  auth
});
