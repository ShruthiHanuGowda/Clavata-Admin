import { ReactElement } from 'react';
import { PopupLoginOptions, RedirectLoginOptions } from '@auth0/auth0-react';
import firebase from 'firebase/compat/app';
import {
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
  AuthenticationDetails
} from 'amazon-cognito-identity-js';

// ==============================|| AUTH TYPES ||============================== //

export type GuardProps = {
  children: ReactElement | null;
};

export type Auth0ContextType = {
  isLoggedIn: boolean;
  isInitialized?: boolean;
  user?: UserProfile | null;
  loginAuth: (options?: PopupLoginOptions) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: VoidFunction;
};

type CanRemove = {
  login?: (email: string, password: string) => Promise<void>;
  register?: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  codeVerification?: (verificationCode: string) => Promise<void>;
  resendConfirmationCode?: () => Promise<void>;
  firebaseRegister?: (email: string, password: string) => Promise<firebase.auth.UserCredential>;
  firebaseEmailPasswordSignIn?: (email: string, password: string) => Promise<firebase.auth.UserCredential>;
  loginAuth?: (options?: PopupLoginOptions) => Promise<void>;
  loginWithRedirect?: (options?: RedirectLoginOptions) => Promise<void>;
  confirmRegister?: (email: string, code: string) => Promise<void>;
  forgotPassword?: (email: string) => Promise<void>;
  resendCodeRegister?: (email: string) => Promise<void>;
  newPassword?: (email: string, code: string, password: string) => Promise<void>;
  updatePassword?: (password: string) => Promise<void>;
  resetPassword?: (email: string) => Promise<void>;
};

export type FirebaseContextType = {
  isLoggedIn: boolean;
  isInitialized?: boolean;
  user?: UserProfile | null;
  firebaseRegister: (email: string, password: string) => Promise<firebase.auth.UserCredential>;
  firebaseEmailPasswordSignIn: (email: string, password: string) => Promise<firebase.auth.UserCredential>;
  firebaseGoogleSignIn: () => Promise<firebase.auth.UserCredential>;
  firebaseTwitterSignIn: () => Promise<firebase.auth.UserCredential>;
  firebaseFacebookSignIn: () => Promise<firebase.auth.UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: VoidFunction;
};

export type UserProfile = {
  id?: string;
  email?: string;
  avatar?: string;
  image?: string;
  name?: string;
  role?: string;
  tier?: string;
};
export interface InitialLoginContextProps {
  isLoggedIn: boolean;
  isInitialized?: boolean;
  user?: UserProfile | null | undefined;
  cognitoUser?: CognitoUser | null;
  userAttributes?: Record<string, any>;
}
export interface AuthProps {
  isLoggedIn: boolean;
  isInitialized?: boolean;
  user?: UserProfile | null;
  token?: string | null;
  isNewPasswordRequired?: boolean;
  cognitoUser?: CognitoUser | null;
  userAttributes?: Record<string, any>;
}

export interface AuthActionProps {
  type: string;
  payload?: any;
}


export type JWTContextType = {
  isLoggedIn: boolean;
  isInitialized?: boolean;
  user?: UserProfile | null | undefined;
  logout: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: VoidFunction;
};
export type AWSCognitoContextType = CanRemove & {
  isLoggedIn: boolean;
  isInitialized?: boolean;
  isNewPasswordRequired?: boolean;
  user?: UserProfile | null | undefined;
  cognitoUser?: any;
  userAttributes?: Record<string, any>;
  logout: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  awsResetPassword: (
    newPassword: string,
    cognitoUser: CognitoUser,
    userAttributes?: Record<string, any>
  ) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateProfile: VoidFunction;
  codeVerification: (verificationCode: string) => Promise<void>;
  resendConfirmationCode: () => Promise<void>;
};
