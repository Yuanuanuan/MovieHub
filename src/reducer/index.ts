import { Action } from "redux";

const initialState = {
  loading: false,
  requestCount: 0,
};

const mainReducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case "ONLOAD": {
      return {
        ...state,
        loading: true,
      };
    }
    case "OUTLOAD": {
      return {
        ...state,
        loading: false,
      };
    }
    case "ADD_REQUEST": {
      return {
        ...state,
        requestCount: state.requestCount + 1,
      };
    }
    case "MINUS_REQUEST": {
      return {
        ...state,
        requestCount: state.requestCount - 1,
      };
    }
    default: {
      return state;
    }
  }
};

export default mainReducer;
