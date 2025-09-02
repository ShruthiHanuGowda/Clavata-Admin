import { ReactElement, createContext, useEffect, useReducer } from 'react';
import { CognitoUserAttribute, CognitoUser, CognitoUserPool, CognitoUserSession, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { useDispatch, useSelector } from 'react-redux';
import { login as authLogin, logout as authLogout } from 'store/slices/authSlice';

import Loader from 'components/Loader';
import { LOGIN, LOGOUT } from 'contexts/authReducer/actions';
import authReducer from 'contexts/authReducer/auth';

import { AWSCognitoContextType, InitialLoginContextProps, UserProfile } from 'types/auth';
import { RootState } from 'store';

interface CognitoIdTokenPayload {
  sub: string;
  email?: string;
  name?: string;
}

const initialState: InitialLoginContextProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

export const userPool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_APP_AWS_POOL_ID || '',
  ClientId: import.meta.env.VITE_APP_AWS_APP_CLIENT_ID || ''
});

const AWSCognitoContext = createContext<AWSCognitoContextType | null>(null);

export const AWSCognitoProvider = ({ children }: { children: ReactElement }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const dispatchRedux = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const init = async () => {
      const currentUser = userPool.getCurrentUser();

      if (!currentUser) {
        dispatch({ type: LOGOUT });
        dispatchRedux(authLogout());
        return;
      }

      currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session || !session.isValid()) {
          dispatch({ type: LOGOUT });
          dispatchRedux(authLogout());
          return;
        }

        const idToken = session.getIdToken().getJwtToken();
        const payload = session.getIdToken().decodePayload() as CognitoIdTokenPayload;

        const userProfile: UserProfile = { email: payload.email ?? '' };

        dispatch({
          type: LOGIN,
          payload: {
            isLoggedIn: true,
            user: userProfile
          }
        });

        dispatchRedux(
          authLogin({
            user: {
              id: payload.sub,
              email: payload.email || '',
              name: payload.name || ''
            },
            token: idToken
          })
        );
      });
    };

    init();
  }, [dispatchRedux]);

  // ------------------- AUTH FUNCTIONS -------------------
  const login = async (email: string, password: string): Promise<void> => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    const authData = new AuthenticationDetails({ Username: email, Password: password });

    await new Promise<void>((resolve, reject) => {
      user.authenticateUser(authData, {
        onSuccess: (session: CognitoUserSession) => {
          const idToken = session.getIdToken().getJwtToken();
          const payload = session.getIdToken().decodePayload();

          const userProfile: UserProfile = { email: payload.email ?? '' };

          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              user: userProfile
            }
          });

          dispatchRedux(
            authLogin({
              user: {
                id: payload.sub,
                email: payload.email || '',
                name: payload.name || ''
              },
              token: idToken
            })
          );

          resolve();
        },
        onFailure: (err) => reject(err),
        newPasswordRequired: () => {} // Handle if needed
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
        (err) => (err ? reject(err) : resolve())
      );
    });
  };

  const logout = () => {
    const loggedInUser = userPool.getCurrentUser();
    if (loggedInUser) loggedInUser.signOut();

    dispatch({ type: LOGOUT, payload: { isLoggedIn: false, user: null } });
    dispatchRedux(authLogout());
    localStorage.clear();
    sessionStorage.clear();
  };

  const forgotPassword = async (email: string): Promise<void> => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    user.forgotPassword({
      onSuccess: () => {},
      onFailure: () => {}
    });
  };

  const awsResetPassword = async (): Promise<void> => {
    const email = authState.user?.email;
    if (!email) throw new Error('Email is required for password reset');

    // await new Promise<void>((resolve, reject) => {
    //   user.confirmPassword(verificationCode, newPassword, {
    //     onSuccess: resolve,
    //     onFailure: (err) => reject(err)
    //   });
    // });
  };

  const codeVerification = async (verificationCode: string): Promise<void> => {
    const email = authState.user?.email;
    if (!email) throw new Error('Email is required for code verification');

    const user = new CognitoUser({ Username: email, Pool: userPool });

    await new Promise<void>((resolve, reject) => {
      user.confirmRegistration(verificationCode, true, (error) => (error ? reject(error) : resolve()));
    });
  };

  const resendConfirmationCode = async (): Promise<void> => {
    const email = authState.user?.email;
    if (!email) throw new Error('Email is required to resend confirmation code');

    const user = new CognitoUser({ Username: email, Pool: userPool });

    await new Promise<void>((resolve, reject) => {
      user.resendConfirmationCode((error) => (error ? reject(error) : resolve()));
    });
  };

  const updateProfile = () => {
    // Placeholder
  };

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
