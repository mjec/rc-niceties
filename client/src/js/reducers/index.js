import {combineReducers} from 'redux';
import rcData from './rcData';
import auth from './auth';

export default combineReducers({
  rcData,
  auth
});
