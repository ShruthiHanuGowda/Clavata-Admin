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
    const parts = token.split('.');

    if (parts.length !== 3) {
      throw new Error('Invalid JWT format.');
    }

    const base64Url = parts[1];

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
    console.error(
      'Failed to decode Cognito JWT:',
      error
    );

    throw new Error('Invalid Cognito ID token.');
  }
};


// ============================================================
// CHECK TOKEN EXPIRATION
// ============================================================

const isTokenValid = (token: string): boolean => {
  try {
    const payload = decodeJwtPayload(token);

    if (!payload.exp) {
      return true;
    }

    const currentTime = Math.floor(
      Date.now() / 1000
    );

    return payload.exp > currentTime;
  } catch {
    return false;
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


  // ==========================================================
  // INITIALIZE AUTH
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        console.log(
          '========== AUTH INITIALIZATION =========='
        );

        console.log(
          'Redux token exists:',
          !!authState?.token
        );

        /*
         * IMPORTANT:
         *
         * Login is performed using AWS SDK v3
         * InitiateAuthCommand.
         *
         * That does NOT automatically create the
         * amazon-cognito-identity-js current user.
         *
         * Therefore we must NOT depend only on:
         *
         * userPool.getCurrentUser()
         *
         * because it can return null even though the
         * user is correctly authenticated.
         */


        // ======================================================
        // FIRST: RESTORE FROM REDUX/PERSISTED TOKEN
        // ======================================================

        if (authState?.token) {
          const token = authState.token;

          console.log(
            'Found persisted Redux authentication token.'
          );

          if (isTokenValid(token)) {
            const payload =
              decodeJwtPayload(token);

            console.log(
              'Restoring authenticated user:',
              payload.email
            );

            const userProfile: UserProfile = {
              email: payload.email ?? ''
            };

            if (mounted) {
              dispatch({
                type: LOGIN,
                payload: {
                  isLoggedIn: true,
                  isInitialized: true,
                  user: userProfile
                }
              });
            }

            console.log(
              'Authentication restored successfully.'
            );

            return;
          }

          /*
           * Token exists but is expired.
           *
           * Only now do we clear authentication.
           */
          console.warn(
            'Persisted authentication token is expired.'
          );

          dispatch({
            type: LOGOUT
          });

          dispatchRedux(
            authLogout()
          );

          return;
        }


        // ======================================================
        // SECOND: CHECK COGNITO IDENTITY-JS USER
        // ======================================================

        const currentUser =
          userPool.getCurrentUser();

        console.log(
          'Cognito identity-js current user:',
          currentUser
        );

        /*
         * If there is no Redux token and no identity-js
         * current user, the user is genuinely logged out.
         */
        if (!currentUser) {
          console.log(
            'No authenticated session found.'
          );

          if (mounted) {
            dispatch({
              type: LOGOUT
            });
          }

          return;
        }


        // ======================================================
        // GET COGNITO SESSION
        // ======================================================

        currentUser.getSession(
          (
            err: Error | null,
            session: CognitoUserSession | null
          ) => {
            if (!mounted) {
              return;
            }

            if (
              err ||
              !session ||
              !session.isValid()
            ) {
              console.warn(
                'Cognito identity-js session is invalid.'
              );

              dispatch({
                type: LOGOUT
              });

              dispatchRedux(
                authLogout()
              );

              return;
            }

            const idToken =
              session
                .getIdToken()
                .getJwtToken();

            if (!idToken) {
              dispatch({
                type: LOGOUT
              });

              dispatchRedux(
                authLogout()
              );

              return;
            }

            const payload =
              session
                .getIdToken()
                .decodePayload() as CognitoIdTokenPayload;

            console.log(
              'Restored Cognito session:',
              payload.email
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

        if (mounted) {
          dispatch({
            type: LOGOUT
          });

          dispatchRedux(
            authLogout()
          );
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };

  }, [dispatchRedux, authState?.token]);


  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = async (
    email: string,
    password: string
  ): Promise<void> => {

    const username =
      email.trim();

    if (!username) {
      throw new Error(
        'Email is required.'
      );
    }

    if (!password) {
      throw new Error(
        'Password is required.'
      );
    }

    console.log(
      'Attempting Cognito login for:',
      username
    );


    // ========================================================
    // SECRET HASH
    // ========================================================

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


        // ====================================================
        // UPDATE REACT AUTH STATE
        // ====================================================

        dispatch({
          type: LOGIN,

          payload: {
            isLoggedIn: true,

            isInitialized: true,

            user: {
              email:
                payload.email ?? ''
            }
          }
        });


        // ====================================================
        // UPDATE REDUX
        // ====================================================

        dispatchRedux(
          authLogin({
            user: {
              id: payload.sub,

              email:
                payload.email || '',

              name:
                payload.name || ''
            },

            token: idToken
          })
        );


        /*
         * IMPORTANT:
         *
         * Do NOT call userPool.getCurrentUser()
         * here to determine whether login succeeded.
         *
         * Authentication is already successful because
         * Cognito returned AuthenticationResult.
         */


        console.log(
          'LOGIN SUCCESSFUL:',
          payload.email
        );

        return;
      }


      // ======================================================
      // NEW PASSWORD REQUIRED
      // ======================================================

      if (
        response.ChallengeName ===
        'NEW_PASSWORD_REQUIRED'
      ) {

        console.log(
          'Cognito requires new password.'
        );


        const cognitoUser =
          new CognitoUser({
            Username: username,
            Pool: userPool
          });


        /*
         * Store the challenge session.
         *
         * This is required later by
         * RespondToAuthChallengeCommand.
         */

        (cognitoUser as any).__challengeSession =
          response.Session;


        let userAttributes:
          Record<string, any> = {
            email: username
          };


        if (
          response
            .ChallengeParameters
            ?.userAttributes
        ) {

          try {

            userAttributes =
              JSON.parse(
                response
                  .ChallengeParameters
                  .userAttributes
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
              email:
                userAttributes.email ||
                username
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
              Value:
                `${firstName} ${lastName}`
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

    console.log(
      'Logging out user...'
    );


    // ========================================================
    // SIGN OUT FROM IDENTITY-JS
    // ========================================================

    const loggedInUser =
      userPool.getCurrentUser();

    if (loggedInUser) {
      loggedInUser.signOut();
    }


    // ========================================================
    // REACT AUTH STATE
    // ========================================================

    dispatch({
      type: LOGOUT,

      payload: {
        isLoggedIn: false,
        user: null
      }
    });


    // ========================================================
    // REDUX AUTH STATE
    // ========================================================

    dispatchRedux(
      authLogout()
    );


    /*
     * IMPORTANT:
     *
     * Do not use localStorage.clear().
     *
     * That can delete unrelated application data and
     * can cause unexpected behavior.
     *
     * Redux Persist will clear the auth state through
     * authLogout().
     */
  };


  // ==========================================================
  // FORGOT PASSWORD
  // ==========================================================

  const forgotPassword = async (
    email: string
  ): Promise<void> => {

    const user =
      new CognitoUser({
        Username: email.trim(),
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
        throw new Error(
          'Username/email is required.'
        );
      }


      const challengeSession =
        (cognitoUser as any)
          .__challengeSession;


      if (!challengeSession) {
        throw new Error(
          'Cognito challenge session is missing. Please login again.'
        );
      }


      const secretHash =
        getSecretHash(username);


      console.log(
        'Responding to NEW_PASSWORD_REQUIRED'
      );

      console.log(
        'Username:',
        username
      );

      console.log(
        'Has SECRET_HASH:',
        !!secretHash
      );

      console.log(
        'Has Session:',
        !!challengeSession
      );


      const command =
        new RespondToAuthChallengeCommand({

          ClientId:
            AWS_CLIENT_ID,

          ChallengeName:
            'NEW_PASSWORD_REQUIRED',

          Session:
            challengeSession,

          ChallengeResponses: {

            USERNAME:
              username,

            NEW_PASSWORD:
              newPassword,

            SECRET_HASH:
              secretHash
          }
        });


      const response =
        await cognitoClient.send(
          command
        );


      console.log(
        'NEW_PASSWORD_REQUIRED response:',
        response
      );


      if (!response.AuthenticationResult) {

        throw new Error(
          'Password change did not return an authentication result.'
        );
      }


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


      /*
       * Your existing functionality is preserved:
       *
       * after setting the temporary password,
       * the user is signed out and asked to login again.
       */

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


      window.location.href =
        '/login';

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