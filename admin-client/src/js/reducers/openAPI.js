export const OPEN_API_LOADING = 'OPEN_API_LOADING';
export const OPEN_API_SUCCESS = 'OPEN_API_SUCCESS';
export const OPEN_API_FAILURE = 'OPEN_API_FAILURE';

export default function openAPI(state = {
  loading: false,
  success: false,
  failure: false,
  result: null,
  error: null
}, action) {
  switch (action.type) {
    case OPEN_API_LOADING:
      return {
        loading: true,
        success: false,
        failure: false,
        result: null,
        error: null
      };
    case OPEN_API_SUCCESS:
      return {
        loading: false,
        success: true,
        failure: false,
        result: action.result.open,
        error: null
      };
    case OPEN_API_FAILURE:
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
