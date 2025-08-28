import { ReactElement, createContext, useEffect, useReducer, useContext } from 'react';
import { CognitoUserAttribute, CognitoUser, CognitoUserPool, CognitoUserSession, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { useDispatch } from 'react-redux';
import { login as authLogin } from 'store/slices/authSlice';

// project imports
import Loader from 'components/Loader';
import { LOGIN, LOGOUT } from 'contexts/authReducer/actions';
import authReducer from 'contexts/authReducer/auth';

// types
import { AWSCognitoContextType, InitialLoginContextProps, UserProfile } from 'types/auth';
import { Context } from 'App';

// ------------------- INITIAL STATE -------------------
const initialState: InitialLoginContextProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null,
};

// ------------------- COGNITO POOL -------------------
export const userPool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_APP_AWS_POOL_ID || '',
  ClientId: import.meta.env.VITE_APP_AWS_APP_CLIENT_ID || ''
});

// ==============================|| AWS COGNITO CONTEXT & PROVIDER ||============================== //
const AWSCognitoContext = createContext<AWSCognitoContextType | null>(null);

export const AWSCognitoProvider = ({ children }: { children: ReactElement }) => {
  const context = useContext(Context);
  const { setAuthenticationToken } = context as { setAuthenticationToken: (token: string | null) => void };
  const [state, dispatch] = useReducer(authReducer, initialState);
  const dispatchRedux = useDispatch();

  useEffect(() => {
    const init = async () => {
      try {
        // Here, check if Redux Persist has a valid token
        const storedUser = state.user;  // Since it's being managed via Redux persist

        if (storedUser) {
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              user: storedUser
            }
          });
        } else {
          dispatch({ type: LOGOUT });
        }
      } catch {
        dispatch({ type: LOGOUT });
      }
    };

    init();
  }, [state.user]); // Only re-run when the user state changes (which will be persisted by Redux Persist)

  // ------------------- AUTH FUNCTIONS -------------------
  const login = async (email: string, password: string): Promise<void> => {
    // Before initiating the login process, remove the existing tokens from localStorage
    localStorage.removeItem('CognitoIdentityServiceProvider.3mteng805ccd6thmtqp9mb0e5g.801cb95c-d051-705d-f8ee-f64ae34ea094.idToken');
    localStorage.removeItem('CognitoIdentityServiceProvider.3mteng805ccd6thmtqp9mb0e5g.801cb95c-d051-705d-f8ee-f64ae34ea094.accessToken');
    localStorage.removeItem('CognitoIdentityServiceProvider.3mteng805ccd6thmtqp9mb0e5g.801cb95c-d051-705d-f8ee-f64ae34ea094.refreshToken');

    const usr = new CognitoUser({ Username: email, Pool: userPool });
    const authData = new AuthenticationDetails({ Username: email, Password: password });

    await new Promise<void>((resolve, reject) => {
      usr.authenticateUser(authData, {
        onSuccess: (session: CognitoUserSession) => {
          const idToken = session.getIdToken().getJwtToken();
          const payload = session.getIdToken().decodePayload();

          // Save token and user info in Redux, and it will be handled by Redux Persist
          dispatchRedux(authLogin({
            user: { id: payload.sub, email: payload.email || '', name: payload.name || '' },
            token: idToken
          }));

          resolve();
        },
        onFailure: (err) => reject(err),
        newPasswordRequired: () => { },
      });
    });
  };

  const register = async (email: string, password: string, firstName: string, lastName: string): Promise<void> => {
    await new Promise<void>((resolve, reject) => {
      userPool.signUp(
        email,
        password,
        [
          new CognitoUserAttribute({ Name: 'email', Value: email }),
          new CognitoUserAttribute({ Name: 'name', Value: `${firstName} ${lastName}` })
        ],
        [],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  };

  const logout = () => {
    const loggedInUser = userPool.getCurrentUser();
    if (!loggedInUser) return;

    loggedInUser.signOut();
    dispatch({ type: LOGOUT, payload: { isLoggedIn: false, user: null } });
  };

  const forgotPassword = async (email: string): Promise<void> => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    user.forgotPassword({ onSuccess: () => { }, onFailure: () => { } });
  };

  const awsResetPassword = async (verificationCode: string, newPassword: string): Promise<void> => {
    const email = sessionStorage.getItem('email');
    if (!email) throw new Error('Email is required');
    const user = new CognitoUser({ Username: email, Pool: userPool });

    await new Promise<void>((resolve, reject) => {
      user.confirmPassword(verificationCode, newPassword, { onSuccess: resolve, onFailure: (err) => reject(err) });
      sessionStorage.removeItem('email');
    });
  };

  const codeVerification = async (verificationCode: string): Promise<void> => {
    const email = sessionStorage.getItem('email');
    if (!email) throw new Error('Email is required');
    const user = new CognitoUser({ Username: email, Pool: userPool });

    await new Promise<void>((resolve, reject) => {
      user.confirmRegistration(verificationCode, true, (error) => (error ? reject(error) : resolve()));
      sessionStorage.removeItem('email');
    });
  };

  const resendConfirmationCode = async (): Promise<void> => {
    const email = sessionStorage.getItem('email');
    if (!email) throw new Error('Email is required');
    const user = new CognitoUser({ Username: email, Pool: userPool });

    await new Promise<void>((resolve, reject) => {
      user.resendConfirmationCode((error) => (error ? reject(error) : resolve()));
    });
  };

  const updateProfile = () => { };

  if (!state.isInitialized) return <Loader />;

  return (
    <AWSCognitoContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
        forgotPassword,
        awsResetPassword,
        updateProfile,
        codeVerification,
        resendConfirmationCode
      }}
    >
      {children}
    </AWSCognitoContext.Provider>
  );
};

export default AWSCognitoContext;
