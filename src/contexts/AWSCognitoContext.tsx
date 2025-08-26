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

interface CognitoIdTokenPayload {
  sub: string;
  email?: string;
  name?: string;
}

// ------------------- INITIAL STATE -------------------
const initialState: InitialLoginContextProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

// ------------------- COGNITO POOL -------------------
export const userPool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_APP_AWS_POOL_ID || '',
  ClientId: import.meta.env.VITE_APP_AWS_APP_CLIENT_ID || ''
});

// ------------------- SESSION MANAGEMENT -------------------
const setSession = (serviceToken?: string | null) => {
  if (serviceToken) {
    localStorage.setItem('serviceToken', serviceToken);
  } else {
    localStorage.removeItem('serviceToken');
  }
};

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
        const serviceToken = localStorage.getItem('serviceToken');
        const storedUsername = localStorage.getItem('username');

        if (serviceToken && storedUsername) {
          setSession(serviceToken);
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              user: { email: storedUsername }
            }
          });
        } else {
          dispatch({ type: LOGOUT });
        }
      } catch {
        dispatch({ type: LOGOUT });
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'serviceToken' && !event.newValue) {
        dispatch({ type: LOGOUT });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    init();

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ------------------- AUTH FUNCTIONS -------------------
  const login = async (email: string, password: string): Promise<void> => {
    const usr = new CognitoUser({ Username: email, Pool: userPool });
    const authData = new AuthenticationDetails({ Username: email, Password: password });

    await new Promise<void>((resolve, reject) => {
      usr.authenticateUser(authData, {
        onSuccess: (session: CognitoUserSession) => {
          const idToken = session.getIdToken().getJwtToken();
          const payload = session.getIdToken().decodePayload() as CognitoIdTokenPayload;

          setSession(idToken);
          setAuthenticationToken(idToken);
          localStorage.setItem('username', authData.getUsername());

          const userProfile: UserProfile = { email: authData.getUsername() };
          dispatch({ type: LOGIN, payload: { isLoggedIn: true, user: userProfile } });

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
        newPasswordRequired: () => {}
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
          localStorage.setItem('email', email);
          resolve();
        }
      );
    });
  };

  const logout = () => {
    const loggedInUser = userPool.getCurrentUser();
    if (!loggedInUser) return;

    setSession(null);
    localStorage.removeItem('email');
    localStorage.removeItem('serviceToken');
    localStorage.removeItem('username');
    loggedInUser.signOut();
    dispatch({ type: LOGOUT, payload: { isLoggedIn: false, user: null } });
    sessionStorage.clear();
  };

  const forgotPassword = async (email: string): Promise<void> => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    user.forgotPassword({ onSuccess: () => {}, onFailure: () => {} });
  };

  const awsResetPassword = async (verificationCode: string, newPassword: string): Promise<void> => {
    const email = localStorage.getItem('email');
    if (!email) throw new Error('Email is required');
    const user = new CognitoUser({ Username: email, Pool: userPool });

    await new Promise<void>((resolve, reject) => {
      user.confirmPassword(verificationCode, newPassword, { onSuccess: resolve, onFailure: (err) => reject(err) });
      localStorage.removeItem('email');
    });
  };

  const codeVerification = async (verificationCode: string): Promise<void> => {
    const email = localStorage.getItem('email');
    if (!email) throw new Error('Email is required');
    const user = new CognitoUser({ Username: email, Pool: userPool });

    await new Promise<void>((resolve, reject) => {
      user.confirmRegistration(verificationCode, true, (error) => (error ? reject(error) : resolve()));
      localStorage.removeItem('email');
    });
  };

  const resendConfirmationCode = async (): Promise<void> => {
    const email = localStorage.getItem('email');
    if (!email) throw new Error('Email is required');
    const user = new CognitoUser({ Username: email, Pool: userPool });

    await new Promise<void>((resolve, reject) => {
      user.resendConfirmationCode((error) => (error ? reject(error) : resolve()));
    });
  };

  const updateProfile = () => {};

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
