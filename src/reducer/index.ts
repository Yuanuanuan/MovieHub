import { Action } from "redux";

const initialState = {
  loading: false,
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
    default: {
      return state;
    }
  }
};

export default mainReducer;
