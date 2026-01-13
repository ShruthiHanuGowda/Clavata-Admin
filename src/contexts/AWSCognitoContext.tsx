import { ReactElement, createContext, useEffect, useReducer } from 'react';
import { CognitoUserAttribute, CognitoUser, CognitoUserPool, CognitoUserSession, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { useDispatch, useSelector } from 'react-redux';
import { login as authLogin, logout as authLogout } from 'store/slices/authSlice';

import Loader from 'components/Loader';
import { LOGIN, LOGOUT, NEW_PASSWORD_REQUIRED } from 'contexts/authReducer/actions';
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
  user: null,
  cognitoUser: null
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
  console.log('Redux Auth State:', authState);

  useEffect(() => {
    const init = async () => {
      const currentUser = userPool.getCurrentUser();
      console.log('Current Cognito User:', currentUser);

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
        console.log('Cognito ID Token:', idToken);
        const payload = session.getIdToken().decodePayload() as CognitoIdTokenPayload;
        console.log('Cognito ID Token Payload:', payload);
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
  // const login = async (email: string, password: string): Promise<void> => {
  //   const user = new CognitoUser({ Username: email, Pool: userPool });
  //   const authData = new AuthenticationDetails({ Username: email, Password: password });

  //   await new Promise<void>((resolve, reject) => {
  //     user.authenticateUser(authData, {
  //       onSuccess: (session: CognitoUserSession) => {
  //         const idToken = session.getIdToken().getJwtToken();
  //         const payload = session.getIdToken().decodePayload();

  //         const userProfile: UserProfile = { email: payload.email ?? '' };

  //         dispatch({
  //           type: LOGIN,
  //           payload: {
  //             isLoggedIn: true,
  //             user: userProfile
  //           }
  //         });

  //         dispatchRedux(
  //           authLogin({
  //             user: {
  //               id: payload.sub,
  //               email: payload.email || '',
  //               name: payload.name || ''
  //             },
  //             token: idToken
  //           })
  //         );

  //         resolve();
  //       },
  //       onFailure: (err) => reject(err),
  //       newPasswordRequired: () => {} // Handle if needed
  //     });
  //   });
  // };

  const login = async (email: string, password: string): Promise<void> => {
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    const authData = new AuthenticationDetails({ Username: email, Password: password });

    await new Promise<void>((resolve, reject) => {
      cognitoUser.authenticateUser(authData, {
        onSuccess: (session: CognitoUserSession) => {
          const idToken = session.getIdToken().getJwtToken();
          const payload = session.getIdToken().decodePayload();

          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              isInitialized: true,
              user: { email: payload.email ?? '' }
            }
          });
          // Update Redux state 
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

        onFailure: reject,

        newPasswordRequired: (userAttributes) => {
          delete userAttributes.email_verified;

          dispatch({
            type: NEW_PASSWORD_REQUIRED,
            payload: {
              user: { email: userAttributes.email },
              cognitoUser,
              userAttributes // ✅ STORE THEM
            }
          });

          resolve();
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
      onSuccess: () => { },
      onFailure: () => { }
    });
  };

  // const awsResetPassword = async (newPassword: string, cognitoUser: CognitoUser): Promise<void> => {
  //   await new Promise<void>((resolve, reject) => {
  //     cognitoUser.completeNewPasswordChallenge(
  //       newPassword,
  //       {}, // optional attributes
  //       {
  //         onSuccess: (session) => {
  //           // reset state so form switches back to login
  //           dispatch({
  //             type: 'RESET_PASSWORD_SUCCESS', // new action
  //           });
  //           resolve();
  //         },
  //         onFailure: (err) => reject(err),
  //       }
  //     );
  //   });
  // };

  // const awsResetPassword = async (newPassword: string, cognitoUser: CognitoUser) => {
  //   return new Promise<void>((resolve, reject) => {
  //     cognitoUser.completeNewPasswordChallenge(
  //       newPassword,
  //       {},
  //       {
  //         onSuccess: (session) => {
  //           dispatch({ type: 'RESET_PASSWORD_SUCCESS' });
  //           resolve();
  //         },
  //         onFailure: reject
  //       }
  //     );
  //   });
  // };

  const awsResetPassword = async (
    newPassword: string,
    cognitoUser: CognitoUser,
    userAttributes?: Record<string, any>
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      // Remove immutable attributes
      const cleanedAttributes = { ...(userAttributes || {}) };
      delete cleanedAttributes.email;
      delete cleanedAttributes.email_verified;

      cognitoUser.completeNewPasswordChallenge(
        newPassword,
        cleanedAttributes, // ✅ safe
        {
          onSuccess: () => {
            // ⚠️ Do NOT dispatch LOGIN here

            // Sign out immediately to force manual login
            cognitoUser.signOut();

            // Optional: show success alert
            alert('Password reset successfully! Please login again.');

            // Redirect to login page (SPA-friendly)
            window.location.href = '/login';

            resolve();
          },
          onFailure: reject
        }
      );
    });
  };


  // const awsResetPassword = async (
  //   newPassword: string,
  //   cognitoUser: CognitoUser,
  //   userAttributes?: Record<string, any>
  // ): Promise<void> => {
  //   return new Promise<void>((resolve, reject) => {
  //     // ⛔ remove immutable attributes
  //     const cleanedAttributes = { ...(userAttributes || {}) };
  //     delete cleanedAttributes.email;
  //     delete cleanedAttributes.email_verified;

  //     cognitoUser.completeNewPasswordChallenge(
  //       newPassword,
  //       cleanedAttributes, // ✅ SAFE
  //       {
  //         onSuccess: (session: CognitoUserSession) => {
  //           const payload = session.getIdToken().decodePayload();

  //           dispatch({
  //             type: LOGIN,
  //             payload: {
  //               isLoggedIn: true,
  //               isInitialized: true,
  //               user: { email: payload.email ?? '' }
  //             }
  //           });

  //           dispatchRedux(
  //             authLogin({
  //               user: {
  //                 id: payload.sub,
  //                 email: payload.email || '',
  //                 name: payload.name || ''
  //               },
  //               token: session.getIdToken().getJwtToken()
  //             })
  //           );

  //           resolve();
  //         },
  //         onFailure: reject
  //       }
  //     );
  //   });
  // };


  // const awsResetPassword = async (
  //   newPassword: string,
  //   cognitoUser: CognitoUser,
  //   userAttributes: any
  // ): Promise<void> => {
  //   return new Promise<void>((resolve, reject) => {
  //     cognitoUser.completeNewPasswordChallenge(
  //       newPassword,
  //       userAttributes,

  //       {
  //         onSuccess: (session: CognitoUserSession) => {
  //           const payload = session.getIdToken().decodePayload();

  //           // 1️⃣ Update context state
  //           dispatch({
  //             type: LOGIN,
  //             payload: {
  //               isLoggedIn: true,
  //               isInitialized: true,
  //               user: { email: payload.email ?? '' }
  //             }
  //           });

  //           // 2️⃣ Update redux state (if you still use it)
  //           dispatchRedux(
  //             authLogin({
  //               user: {
  //                 id: payload.sub,
  //                 email: payload.email || '',
  //                 name: payload.name || ''
  //               },
  //               token: session.getIdToken().getJwtToken()
  //             })
  //           );

  //           resolve();
  //         },

  //         onFailure: reject
  //       }
  //     );
  //   });
  // };


  // const awsResetPassword = async (): Promise<void> => {
  //   const email = authState.user?.email;
  //   if (!email) throw new Error('Email is required for password reset');

  //   // await new Promise<void>((resolve, reject) => {
  //   //   user.confirmPassword(verificationCode, newPassword, {
  //   //     onSuccess: resolve,
  //   //     onFailure: (err) => reject(err)
  //   //   });
  //   // });
  // };

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
