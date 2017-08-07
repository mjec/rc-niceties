export default function auth(state = {
  loading: false,
  success: false,
  failure: false,
  result: null,
  error: null
}, action) {
  switch (action.type) {
    case 'AUTH_LOADING':
      return {
        loading: true,
        success: false,
        failure: false,
        result: null,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        loading: false,
        success: true,
        failure: false,
        result: action.result,
        error: null
      };
    case 'AUTH_FAILURE':
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
