import { ReactElement, createContext, useEffect, useReducer } from 'react';
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';

// third-party
import { CognitoUser, CognitoUserPool, CognitoUserSession, AuthenticationDetails } from 'amazon-cognito-identity-js';

// project imports
import Loader from 'components/Loader';
import { LOGIN, LOGOUT } from 'contexts/auth-reducer/actions';
import authReducer from 'contexts/auth-reducer/auth';

// types
import { AWSCognitoContextType, InitialLoginContextProps } from 'types/auth';
import { useContext } from 'react';
import { Context } from 'App';

// constant
const initialState: InitialLoginContextProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

export const userPool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_APP_AWS_POOL_ID || '',
  ClientId: import.meta.env.VITE_APP_AWS_APP_CLIENT_ID || ''
});

const setSession = (serviceToken?: string | null) => {
  if (serviceToken) {
    localStorage.setItem('serviceToken', serviceToken);
  } else {
    localStorage.removeItem('serviceToken');
  }
};

// ==============================|| AWS COGNITO - CONTEXT & PROVIDER ||============================== //

const AWSCognitoContext = createContext<AWSCognitoContextType | null>(null);

export const AWSCognitoProvider = ({ children }: { children: ReactElement }) => {
  const context = useContext(Context);
  const { authenticationToken, setAuthenticationToken }: any = context;
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const serviceToken = window.localStorage.getItem('serviceToken');
        if (serviceToken) {
          setSession(serviceToken);
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              user: {
                name: 'Betty'
              }
            }
          });
        } else {
          dispatch({
            type: LOGOUT
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: LOGOUT
        });
      }
    };

    // Add the storage event listener to handle logout across tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'serviceToken' && !event.newValue) {
        // If the serviceToken is removed, log out the user
        dispatch({ type: LOGOUT });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Initialize the app state on mount
    init();

    // Cleanup the event listener when the component is unmounted
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const usr = new CognitoUser({
      Username: email,
      Pool: userPool
    });

    const authData = new AuthenticationDetails({
      Username: email,
      Password: password
    });

    await new Promise<void>((resolve, reject) => {
      usr.authenticateUser(authData, {
        onSuccess: (session: CognitoUserSession) => {
          const accessToken = session.getAccessToken().getJwtToken();
          // console.log("Access Token: ", accessToken);
          setSession(accessToken);
          setAuthenticationToken(accessToken)
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              user: {
                email: authData.getUsername(),
                name: 'John AWS'
              }
            }
          });
          resolve();
        },
        onFailure: (err) => {
          reject(err);
        },
        newPasswordRequired: () => {
          // Handle the new password challenge (optional, based on your flow)
        }
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
        (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          localStorage.setItem('email', email);
          resolve();
        }
      );
    });
  };

  const logout = () => {
    const loggedInUser = userPool.getCurrentUser();

    if (loggedInUser) {
      setSession(null);
      localStorage.removeItem('email');
      localStorage.removeItem('serviceToken');
      console.log('Email cleared:', localStorage.getItem('email'));
      console.log('ServiceToken cleared:', localStorage.getItem('serviceToken'));
      loggedInUser.signOut();
      dispatch({ type: LOGOUT });
      sessionStorage.clear();
      console.log('Session cleared:', sessionStorage);

      // Only trigger the storage event if the serviceToken is cleared (avoid re-triggering when it's already cleared)
      if (localStorage.getItem('serviceToken')) {
        localStorage.setItem('serviceToken', ''); // This will fire the storage event
      }
    } else {
      console.log('No logged-in user found.');
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    const user = new CognitoUser({
      Username: email,
      Pool: userPool
    });
    user.forgotPassword({
      onSuccess: () => { },
      onFailure: () => { }
    });
  };

  const awsResetPassword = async (verificationCode: string, newPassword: string): Promise<void> => {
    const email = localStorage.getItem('email');
    const user = new CognitoUser({
      Username: email as string,
      Pool: userPool
    });
    await new Promise<void>((resolve, reject) => {
      user.confirmPassword(verificationCode, newPassword, {
        onSuccess: () => {
          localStorage.removeItem('email');
          resolve();
        },
        onFailure: (error) => {
          reject(error.message);
        }
      });
    });
  };

  const codeVerification = async (verificationCode: string): Promise<void> => {
    const email = localStorage.getItem('email');
    if (!email) {
      throw new Error('Username and Pool information are required');
    }

    const user = new CognitoUser({
      Username: email as string,
      Pool: userPool
    });

    await new Promise<void>((resolve, reject) => {
      user.confirmRegistration(verificationCode, true, (error, result) => {
        if (error) {
          reject(error.message || JSON.stringify(error));
        } else {
          localStorage.removeItem('email');
          resolve();
        }
      });
    });
  };

  const resendConfirmationCode = async (): Promise<void> => {
    const email = localStorage.getItem('email');
    if (!email) {
      throw new Error('Username and Pool information are required');
    }

    const user = new CognitoUser({
      Username: email as string,
      Pool: userPool
    });

    await new Promise<void>((resolve, reject) => {
      user.resendConfirmationCode((error, result) => {
        if (error) {
          reject(error.message || JSON.stringify(error));
        } else {
          resolve();
        }
      });
    });
  };

  const updateProfile = () => { };

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

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
