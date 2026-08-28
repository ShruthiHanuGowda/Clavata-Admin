// import { ReactElement, createContext, useEffect, useReducer } from 'react';
// import { CognitoUserAttribute, CognitoUser, CognitoUserPool, CognitoUserSession, AuthenticationDetails } from 'amazon-cognito-identity-js';
// import { useDispatch, useSelector } from 'react-redux';
// import { login as authLogin, logout as authLogout } from 'store/slices/authSlice';

// import Loader from 'components/Loader';
// import { LOGIN, LOGOUT, NEW_PASSWORD_REQUIRED } from 'contexts/authReducer/actions';
// import authReducer from 'contexts/authReducer/auth';

// import { AWSCognitoContextType, InitialLoginContextProps, UserProfile } from 'types/auth';
// import { RootState } from 'store';

// interface CognitoIdTokenPayload {
//   sub: string;
//   email?: string;
//   name?: string;
// }

// const initialState: InitialLoginContextProps = {
//   isLoggedIn: false,
//   isInitialized: false,
//   user: null,
//   cognitoUser: null
// };

// export const userPool = new CognitoUserPool({
//   UserPoolId: import.meta.env.VITE_APP_AWS_POOL_ID || '',
//   ClientId: import.meta.env.VITE_APP_AWS_APP_CLIENT_ID || ''
// });

// const AWSCognitoContext = createContext<AWSCognitoContextType | null>(null);

// export const AWSCognitoProvider = ({ children }: { children: ReactElement }) => {
//   const [state, dispatch] = useReducer(authReducer, initialState);
//   const dispatchRedux = useDispatch();
//   const authState = useSelector((state: RootState) => state.auth);
//   console.log('Redux Auth State:', authState);

//   useEffect(() => {
//     const init = async () => {
//       const currentUser = userPool.getCurrentUser();
//       console.log('Current Cognito User:', currentUser);

//       if (!currentUser) {
//         dispatch({ type: LOGOUT });
//         dispatchRedux(authLogout());
//         return;
//       }

//       currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
//         if (err || !session || !session.isValid()) {
//           dispatch({ type: LOGOUT });
//           dispatchRedux(authLogout());
//           return;
//         }

//         const idToken = session.getIdToken().getJwtToken();
//         console.log('Cognito ID Token:', idToken);
//         const payload = session.getIdToken().decodePayload() as CognitoIdTokenPayload;
//         console.log('Cognito ID Token Payload:', payload);
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
//       });
//     };

//     init();
//   }, [dispatchRedux]);

//   // ------------------- AUTH FUNCTIONS -------------------
//   // const login = async (email: string, password: string): Promise<void> => {
//   //   const user = new CognitoUser({ Username: email, Pool: userPool });
//   //   const authData = new AuthenticationDetails({ Username: email, Password: password });

//   //   await new Promise<void>((resolve, reject) => {
//   //     user.authenticateUser(authData, {
//   //       onSuccess: (session: CognitoUserSession) => {
//   //         const idToken = session.getIdToken().getJwtToken();
//   //         const payload = session.getIdToken().decodePayload();

//   //         const userProfile: UserProfile = { email: payload.email ?? '' };

//   //         dispatch({
//   //           type: LOGIN,
//   //           payload: {
//   //             isLoggedIn: true,
//   //             user: userProfile
//   //           }
//   //         });

//   //         dispatchRedux(
//   //           authLogin({
//   //             user: {
//   //               id: payload.sub,
//   //               email: payload.email || '',
//   //               name: payload.name || ''
//   //             },
//   //             token: idToken
//   //           })
//   //         );

//   //         resolve();
//   //       },
//   //       onFailure: (err) => reject(err),
//   //       newPasswordRequired: () => {} // Handle if needed
//   //     });
//   //   });
//   // };

//   const login = async (email: string, password: string): Promise<void> => {
//     const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
//     const authData = new AuthenticationDetails({ Username: email, Password: password });

//     await new Promise<void>((resolve, reject) => {
//       cognitoUser.authenticateUser(authData, {
//         onSuccess: (session: CognitoUserSession) => {
//           const idToken = session.getIdToken().getJwtToken();
//           const payload = session.getIdToken().decodePayload();

//           dispatch({
//             type: LOGIN,
//             payload: {
//               isLoggedIn: true,
//               isInitialized: true,
//               user: { email: payload.email ?? '' }
//             }
//           });
//           // Update Redux state 
//           dispatchRedux(
//             authLogin({
//               user: {
//                 id: payload.sub,
//                 email: payload.email || '',
//                 name: payload.name || ''
//               },
//               token: idToken
//             })
//           );
//           resolve();
//         },

//         onFailure: reject,

//         newPasswordRequired: (userAttributes) => {
//           delete userAttributes.email_verified;

//           dispatch({
//             type: NEW_PASSWORD_REQUIRED,
//             payload: {
//               user: { email: userAttributes.email },
//               cognitoUser,
//               userAttributes // ✅ STORE THEM
//             }
//           });

//           resolve();
//         }

//       });
//     });
//   };


//   const register = async (email: string, password: string, firstName: string, lastName: string): Promise<void> => {
//     await new Promise<void>((resolve, reject) => {
//       userPool.signUp(
//         email,
//         password,
//         [
//           new CognitoUserAttribute({ Name: 'email', Value: email }),
//           new CognitoUserAttribute({ Name: 'name', Value: `${firstName} ${lastName}` })
//         ],
//         [],
//         (err) => (err ? reject(err) : resolve())
//       );
//     });
//   };



//   const logout = () => {
//     const loggedInUser = userPool.getCurrentUser();
//     if (loggedInUser) loggedInUser.signOut();

//     dispatch({ type: LOGOUT, payload: { isLoggedIn: false, user: null } });
//     dispatchRedux(authLogout());
//     localStorage.clear();
//     sessionStorage.clear();
//   };

//   const forgotPassword = async (email: string): Promise<void> => {
//     const user = new CognitoUser({ Username: email, Pool: userPool });
//     user.forgotPassword({
//       onSuccess: () => { },
//       onFailure: () => { }
//     });
//   };

//   // const awsResetPassword = async (newPassword: string, cognitoUser: CognitoUser): Promise<void> => {
//   //   await new Promise<void>((resolve, reject) => {
//   //     cognitoUser.completeNewPasswordChallenge(
//   //       newPassword,
//   //       {}, // optional attributes
//   //       {
//   //         onSuccess: (session) => {
//   //           // reset state so form switches back to login
//   //           dispatch({
//   //             type: 'RESET_PASSWORD_SUCCESS', // new action
//   //           });
//   //           resolve();
//   //         },
//   //         onFailure: (err) => reject(err),
//   //       }
//   //     );
//   //   });
//   // };

//   // const awsResetPassword = async (newPassword: string, cognitoUser: CognitoUser) => {
//   //   return new Promise<void>((resolve, reject) => {
//   //     cognitoUser.completeNewPasswordChallenge(
//   //       newPassword,
//   //       {},
//   //       {
//   //         onSuccess: (session) => {
//   //           dispatch({ type: 'RESET_PASSWORD_SUCCESS' });
//   //           resolve();
//   //         },
//   //         onFailure: reject
//   //       }
//   //     );
//   //   });
//   // };

//   const awsResetPassword = async (
//     newPassword: string,
//     cognitoUser: CognitoUser,
//     userAttributes?: Record<string, any>
//   ): Promise<void> => {
//     return new Promise<void>((resolve, reject) => {
//       // Remove immutable attributes
//       const cleanedAttributes = { ...(userAttributes || {}) };
//       delete cleanedAttributes.email;
//       delete cleanedAttributes.email_verified;

//       cognitoUser.completeNewPasswordChallenge(
//         newPassword,
//         cleanedAttributes, // ✅ safe
//         {
//           onSuccess: () => {
//             // ⚠️ Do NOT dispatch LOGIN here

//             // Sign out immediately to force manual login
//             cognitoUser.signOut();

//             // Optional: show success alert
//             alert('Password reset successfully! Please login again.');

//             // Redirect to login page (SPA-friendly)
//             window.location.href = '/login';

//             resolve();
//           },
//           onFailure: reject
//         }
//       );
//     });
//   };


//   // const awsResetPassword = async (
//   //   newPassword: string,
//   //   cognitoUser: CognitoUser,
//   //   userAttributes?: Record<string, any>
//   // ): Promise<void> => {
//   //   return new Promise<void>((resolve, reject) => {
//   //     // ⛔ remove immutable attributes
//   //     const cleanedAttributes = { ...(userAttributes || {}) };
//   //     delete cleanedAttributes.email;
//   //     delete cleanedAttributes.email_verified;

//   //     cognitoUser.completeNewPasswordChallenge(
//   //       newPassword,
//   //       cleanedAttributes, // ✅ SAFE
//   //       {
//   //         onSuccess: (session: CognitoUserSession) => {
//   //           const payload = session.getIdToken().decodePayload();

//   //           dispatch({
//   //             type: LOGIN,
//   //             payload: {
//   //               isLoggedIn: true,
//   //               isInitialized: true,
//   //               user: { email: payload.email ?? '' }
//   //             }
//   //           });

//   //           dispatchRedux(
//   //             authLogin({
//   //               user: {
//   //                 id: payload.sub,
//   //                 email: payload.email || '',
//   //                 name: payload.name || ''
//   //               },
//   //               token: session.getIdToken().getJwtToken()
//   //             })
//   //           );

//   //           resolve();
//   //         },
//   //         onFailure: reject
//   //       }
//   //     );
//   //   });
//   // };


//   // const awsResetPassword = async (
//   //   newPassword: string,
//   //   cognitoUser: CognitoUser,
//   //   userAttributes: any
//   // ): Promise<void> => {
//   //   return new Promise<void>((resolve, reject) => {
//   //     cognitoUser.completeNewPasswordChallenge(
//   //       newPassword,
//   //       userAttributes,

//   //       {
//   //         onSuccess: (session: CognitoUserSession) => {
//   //           const payload = session.getIdToken().decodePayload();

//   //           // 1️⃣ Update context state
//   //           dispatch({
//   //             type: LOGIN,
//   //             payload: {
//   //               isLoggedIn: true,
//   //               isInitialized: true,
//   //               user: { email: payload.email ?? '' }
//   //             }
//   //           });

//   //           // 2️⃣ Update redux state (if you still use it)
//   //           dispatchRedux(
//   //             authLogin({
//   //               user: {
//   //                 id: payload.sub,
//   //                 email: payload.email || '',
//   //                 name: payload.name || ''
//   //               },
//   //               token: session.getIdToken().getJwtToken()
//   //             })
//   //           );

//   //           resolve();
//   //         },

//   //         onFailure: reject
//   //       }
//   //     );
//   //   });
//   // };


//   // const awsResetPassword = async (): Promise<void> => {
//   //   const email = authState.user?.email;
//   //   if (!email) throw new Error('Email is required for password reset');

//   //   // await new Promise<void>((resolve, reject) => {
//   //   //   user.confirmPassword(verificationCode, newPassword, {
//   //   //     onSuccess: resolve,
//   //   //     onFailure: (err) => reject(err)
//   //   //   });
//   //   // });
//   // };

//   const codeVerification = async (verificationCode: string): Promise<void> => {
//     const email = authState.user?.email;
//     if (!email) throw new Error('Email is required for code verification');

//     const user = new CognitoUser({ Username: email, Pool: userPool });

//     await new Promise<void>((resolve, reject) => {
//       user.confirmRegistration(verificationCode, true, (error) => (error ? reject(error) : resolve()));
//     });
//   };

//   const resendConfirmationCode = async (): Promise<void> => {
//     const email = authState.user?.email;
//     if (!email) throw new Error('Email is required to resend confirmation code');

//     const user = new CognitoUser({ Username: email, Pool: userPool });

//     await new Promise<void>((resolve, reject) => {
//       user.resendConfirmationCode((error) => (error ? reject(error) : resolve()));
//     });
//   };

//   const updateProfile = () => {
//     // Placeholder
//   };

//   if (!state.isInitialized) return <Loader />;

//   return (
//     <AWSCognitoContext.Provider
//       value={{
//         ...state,
//         login,
//         logout,
//         register,
//         forgotPassword,
//         awsResetPassword,
//         updateProfile,
//         codeVerification,
//         resendConfirmationCode
//       }}
//     >
//       {children}
//     </AWSCognitoContext.Provider>
//   );
// };

// export default AWSCognitoContext;


import {
  ReactElement,
  createContext,
  useEffect,
  useReducer
} from 'react';

import {
  CognitoUserAttribute,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession
} from 'amazon-cognito-identity-js';

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand
} from '@aws-sdk/client-cognito-identity-provider';

import CryptoJS from 'crypto-js';

import { useDispatch, useSelector } from 'react-redux';

import {
  login as authLogin,
  logout as authLogout
} from 'store/slices/authSlice';

import Loader from 'components/Loader';

import {
  LOGIN,
  LOGOUT,
  NEW_PASSWORD_REQUIRED
} from 'contexts/authReducer/actions';

import authReducer from 'contexts/authReducer/auth';

import {
  AWSCognitoContextType,
  InitialLoginContextProps,
  UserProfile
} from 'types/auth';

import { RootState } from 'store';


// ============================================================
// TYPES
// ============================================================

interface CognitoIdTokenPayload {
  sub: string;
  email?: string;
  name?: string;
  [key: string]: any;
}


// ============================================================
// ENVIRONMENT
// ============================================================

const AWS_REGION =
  import.meta.env.VITE_APP_AWS_REGION || 'ap-south-2';

const AWS_POOL_ID =
  import.meta.env.VITE_APP_AWS_POOL_ID || '';

const AWS_CLIENT_ID =
  import.meta.env.VITE_APP_AWS_APP_CLIENT_ID || '';

const AWS_CLIENT_SECRET =
  import.meta.env.VITE_APP_AWS_APP_CLIENT_SECRET || '';


// ============================================================
// INITIAL STATE
// ============================================================

const initialState: InitialLoginContextProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null,
  cognitoUser: null
};


// ============================================================
// COGNITO USER POOL
// ============================================================

export const userPool = new CognitoUserPool({
  UserPoolId: AWS_POOL_ID,
  ClientId: AWS_CLIENT_ID
});


// ============================================================
// AWS COGNITO API CLIENT
// ============================================================

const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_REGION
});


// ============================================================
// SECRET HASH
// ============================================================

const getSecretHash = (username: string): string => {
  if (!AWS_CLIENT_ID) {
    throw new Error('AWS Cognito Client ID is missing.');
  }

  if (!AWS_CLIENT_SECRET) {
    throw new Error('AWS Cognito Client Secret is missing.');
  }

  return CryptoJS.HmacSHA256(
    username + AWS_CLIENT_ID,
    AWS_CLIENT_SECRET
  ).toString(CryptoJS.enc.Base64);
};


// ============================================================
// JWT DECODER
// ============================================================

const decodeJwtPayload = (
  token: string
): CognitoIdTokenPayload => {
  try {
    const base64Url = token.split('.')[1];

    const base64 = base64Url
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(
          (char) =>
            '%' +
            ('00' + char.charCodeAt(0).toString(16)).slice(-2)
        )
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode Cognito JWT:', error);

    throw new Error('Invalid Cognito ID token.');
  }
};


// ============================================================
// CONTEXT
// ============================================================

const AWSCognitoContext =
  createContext<AWSCognitoContextType | null>(null);


// ============================================================
// PROVIDER
// ============================================================

export const AWSCognitoProvider = ({
  children
}: {
  children: ReactElement;
}) => {
  const [state, dispatch] = useReducer(
    authReducer,
    initialState
  );

  const dispatchRedux = useDispatch();

  const authState = useSelector(
    (state: RootState) => state.auth
  );

  console.log('Redux Auth State:', authState);


  // ==========================================================
  // INITIALIZE AUTH
  // ==========================================================

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = userPool.getCurrentUser();

        console.log(
          'Current Cognito User:',
          currentUser
        );

        /*
         * This checks the amazon-cognito-identity-js
         * session if one exists.
         */
        if (!currentUser) {
          dispatch({
            type: LOGOUT
          });

          dispatchRedux(authLogout());

          return;
        }

        currentUser.getSession(
          (
            err: Error | null,
            session: CognitoUserSession | null
          ) => {
            if (
              err ||
              !session ||
              !session.isValid()
            ) {
              dispatch({
                type: LOGOUT
              });

              dispatchRedux(authLogout());

              return;
            }

            const idToken =
              session
                .getIdToken()
                .getJwtToken();

            console.log(
              'Cognito ID Token:',
              idToken
            );

            const payload =
              session
                .getIdToken()
                .decodePayload() as CognitoIdTokenPayload;

            console.log(
              'Cognito ID Token Payload:',
              payload
            );

            const userProfile: UserProfile = {
              email: payload.email ?? ''
            };

            dispatch({
              type: LOGIN,
              payload: {
                isLoggedIn: true,
                isInitialized: true,
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
          }
        );
      } catch (error) {
        console.error(
          'Cognito initialization error:',
          error
        );

        dispatch({
          type: LOGOUT
        });

        dispatchRedux(authLogout());
      }
    };

    init();
  }, [dispatchRedux]);


  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = async (
    email: string,
    password: string
  ): Promise<void> => {

    const username = email.trim();

    if (!username) {
      throw new Error('Email is required.');
    }

    if (!password) {
      throw new Error('Password is required.');
    }

    console.log(
      'Attempting Cognito login for:',
      username
    );

    const secretHash =
      getSecretHash(username);

    try {

      const command =
        new InitiateAuthCommand({
          AuthFlow: 'USER_PASSWORD_AUTH',

          ClientId: AWS_CLIENT_ID,

          AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
            SECRET_HASH: secretHash
          }
        });

      const response =
        await cognitoClient.send(command);

      console.log(
        'Cognito login response:',
        response
      );


      // ======================================================
      // SUCCESSFUL LOGIN
      // ======================================================

      if (response.AuthenticationResult) {

        const idToken =
          response.AuthenticationResult.IdToken;

        if (!idToken) {
          throw new Error(
            'Cognito did not return an ID token.'
          );
        }

        const payload =
          decodeJwtPayload(idToken);

        console.log(
          'Cognito login payload:',
          payload
        );


        // Update React auth state

        dispatch({
          type: LOGIN,

          payload: {
            isLoggedIn: true,
            isInitialized: true,

            user: {
              email: payload.email ?? ''
            }
          }
        });


        // Update Redux

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

        return;
      }


      // ======================================================
      // NEW PASSWORD REQUIRED
      // ======================================================

      if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
        console.log('Cognito requires new password.');

        const cognitoUser = new CognitoUser({
          Username: username,
          Pool: userPool
        });

        // Store the Cognito challenge session
        (cognitoUser as any).__challengeSession = response.Session;

        let userAttributes: Record<string, any> = {
          email: username
        };

        if (response.ChallengeParameters?.userAttributes) {
          try {
            userAttributes = JSON.parse(
              response.ChallengeParameters.userAttributes
            );
          } catch (error) {
            console.error(
              'Failed to parse Cognito user attributes:',
              error
            );
          }
        }

        delete userAttributes.email_verified;

        dispatch({
          type: NEW_PASSWORD_REQUIRED,
          payload: {
            user: {
              email: userAttributes.email || username
            },
            cognitoUser,
            userAttributes
          }
        });

        return;
      }

      // ======================================================
      // OTHER CHALLENGE
      // ======================================================

      if (response.ChallengeName) {

        throw new Error(
          `Cognito authentication challenge: ${response.ChallengeName}`
        );
      }


      throw new Error(
        'Unexpected Cognito authentication response.'
      );

    } catch (error: any) {

      console.error(
        'Cognito login error:',
        error
      );

      throw new Error(
        error?.message ||
        'Login failed. Please check your email and password.'
      );
    }
  };


  // ==========================================================
  // REGISTER
  // ==========================================================

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<void> => {

    await new Promise<void>(
      (resolve, reject) => {

        userPool.signUp(
          email,
          password,

          [
            new CognitoUserAttribute({
              Name: 'email',
              Value: email
            }),

            new CognitoUserAttribute({
              Name: 'name',
              Value: `${firstName} ${lastName}`
            })
          ],

          [],

          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }
        );
      }
    );
  };


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = () => {

    const loggedInUser =
      userPool.getCurrentUser();

    if (loggedInUser) {
      loggedInUser.signOut();
    }

    dispatch({
      type: LOGOUT,

      payload: {
        isLoggedIn: false,
        user: null
      }
    });

    dispatchRedux(authLogout());

    localStorage.clear();
    sessionStorage.clear();
  };


  // ==========================================================
  // FORGOT PASSWORD
  // ==========================================================

  const forgotPassword = async (
    email: string
  ): Promise<void> => {

    const user =
      new CognitoUser({
        Username: email,
        Pool: userPool
      });

    await new Promise<void>(
      (resolve, reject) => {

        user.forgotPassword({

          onSuccess: () => {
            resolve();
          },

          onFailure: (error) => {
            reject(error);
          }

        });

      }
    );
  };


  // ==========================================================
  // COMPLETE NEW PASSWORD
  // ==========================================================

  const awsResetPassword = async (
    newPassword: string,
    cognitoUser: CognitoUser,
    userAttributes?: Record<string, any>
  ): Promise<void> => {
    try {
      const username =
        userAttributes?.email ||
        authState.user?.email;

      if (!username) {
        throw new Error('Username/email is required.');
      }

      const challengeSession =
        (cognitoUser as any).__challengeSession;

      if (!challengeSession) {
        throw new Error(
          'Cognito challenge session is missing. Please login again.'
        );
      }

      const secretHash =
        getSecretHash(username);

      console.log('Responding to NEW_PASSWORD_REQUIRED');
      console.log('Username:', username);
      console.log('Has SECRET_HASH:', !!secretHash);
      console.log('Has Session:', !!challengeSession);

      const command =
        new RespondToAuthChallengeCommand({
          ClientId: AWS_CLIENT_ID,

          ChallengeName: 'NEW_PASSWORD_REQUIRED',

          Session: challengeSession,

          ChallengeResponses: {
            USERNAME: username,
            NEW_PASSWORD: newPassword,
            SECRET_HASH: secretHash
          }
        });

      const response =
        await cognitoClient.send(command);

      console.log(
        'NEW_PASSWORD_REQUIRED response:',
        response
      );

      if (!response.AuthenticationResult) {
        throw new Error(
          'Password change did not return an authentication result.'
        );
      }

      /*
       * Password successfully changed.
       *
       * We intentionally don't keep the user logged in.
       */
      const idToken =
        response.AuthenticationResult.IdToken;

      if (idToken) {
        const payload =
          decodeJwtPayload(idToken);

        console.log(
          'Password successfully changed for:',
          payload.email
        );
      }

      // Clear Cognito user
      const currentUser =
        userPool.getCurrentUser();

      if (currentUser) {
        currentUser.signOut();
      }

      dispatch({
        type: LOGOUT
      });

      dispatchRedux(
        authLogout()
      );

      alert(
        'Password reset successfully! Please login again.'
      );

      window.location.href = '/login';

    } catch (error: any) {
      console.error(
        'Complete new password error:',
        error
      );

      throw new Error(
        error?.message ||
        'Unable to change password.'
      );
    }
  };

  // ==========================================================
  // CODE VERIFICATION
  // ==========================================================

  const codeVerification = async (
    verificationCode: string
  ): Promise<void> => {

    const email =
      authState.user?.email;

    if (!email) {
      throw new Error(
        'Email is required for code verification'
      );
    }

    const user =
      new CognitoUser({
        Username: email,
        Pool: userPool
      });

    await new Promise<void>(
      (resolve, reject) => {

        user.confirmRegistration(
          verificationCode,
          true,

          (error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          }
        );
      }
    );
  };


  // ==========================================================
  // RESEND CONFIRMATION CODE
  // ==========================================================

  const resendConfirmationCode =
    async (): Promise<void> => {

      const email =
        authState.user?.email;

      if (!email) {
        throw new Error(
          'Email is required to resend confirmation code'
        );
      }

      const user =
        new CognitoUser({
          Username: email,
          Pool: userPool
        });

      await new Promise<void>(
        (resolve, reject) => {

          user.resendConfirmationCode(
            (error) => {

              if (error) {
                reject(error);
              } else {
                resolve();
              }

            }
          );
        }
      );
    };


  // ==========================================================
  // UPDATE PROFILE
  // ==========================================================

  const updateProfile = () => {
    // Placeholder
  };


  // ==========================================================
  // LOADER
  // ==========================================================

  if (!state.isInitialized) {
    return <Loader />;
  }


  // ==========================================================
  // PROVIDER
  // ==========================================================

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