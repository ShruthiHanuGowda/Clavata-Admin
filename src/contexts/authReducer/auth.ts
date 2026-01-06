// action - state management
import { REGISTER, LOGIN, LOGOUT } from './actions';
import { AuthProps, AuthActionProps } from 'types/auth';

// types

// initial state
export const initialState: AuthProps & { newPasswordRequiredUser?: any } = {
  isLoggedIn: false,
  isInitialized: false,
  user: null,
  newPasswordRequiredUser: null,
  isNewPasswordRequired: false,
  cognitoUser: null,
  userAttributes: undefined
};

// ==============================|| AUTH REDUCER ||============================== //

const auth = (state = initialState, action: AuthActionProps) => {
  switch (action.type) {
    case REGISTER: {
      const { user } = action.payload!;
      return {
        ...state,
        user
      };
    }
    case LOGIN: {
      const { user } = action.payload!;
      return {
        ...state,
        isLoggedIn: true,
        isInitialized: true,
        user
      };
    }
    case LOGOUT: {
      return {
        ...state,
        isInitialized: true,
        isLoggedIn: false,
        user: null,
      };
    }
    case 'NEW_PASSWORD_REQUIRED': {
      // if (!action.payload?.user) return state;
      return {
        ...state,
        isInitialized: true,
        isLoggedIn: false,
        isNewPasswordRequired: true,
        user: action.payload!.user,
        cognitoUser: action.payload!.cognitoUser,
        userAttributes: action.payload!.userAttributes
      };

    }
    case 'RESET_PASSWORD_SUCCESS': {
      return {
        ...state,
        isNewPasswordRequired: false,
        cognitoUser: null,
        userAttributes: undefined,
        user: null // optional
      };
    }

    default: {
      return { ...state };
    }
  }
};

export default auth;
