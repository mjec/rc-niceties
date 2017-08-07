export default function rcData(state = {
  loading: false,
  success: false,
  failure: false,
  result: null,
  error: null
}, action) {
  switch (action.type) {
    case 'RC_DATA_LOADING':
      return {
        loading: true,
        success: false,
        failure: false,
        result: null,
        error: null
      };
    case 'RC_DATA_SUCCESS':
      return {
        loading: false,
        success: true,
        failure: false,
        result: action.result,
        error: null
      };
    case 'RC_DATA_FAILURE':
      return {
        loading: false,
        success: false,
        failure: true,
        result: null,
        error: action.error
      };
    default:
      return state;
  }
}
