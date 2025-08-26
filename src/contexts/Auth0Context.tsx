import React, { createContext, useEffect, useState } from 'react';
// third-party
import { Auth0Provider as AuthProvider, useAuth0, PopupLoginOptions } from '@auth0/auth0-react';

// project imports
import Loader from 'components/Loader';

// types
import { InitialLoginContextProps, UserProfile } from 'types/auth';

// ------------------- CONTEXT TYPE -------------------

export type Auth0ContextType = InitialLoginContextProps & {
  loginAuth: (options?: PopupLoginOptions) => Promise<void>;
  logout: () => void;
  resetPassword: (_email: string) => Promise<void>;
  updateProfile: VoidFunction;
};

// ------------------- INITIAL STATE -------------------

const initialState: InitialLoginContextProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

// ==============================|| AUTH0 CONTEXT & PROVIDER ||============================== //

const Auth0Context = createContext<Auth0ContextType | null>(null);

export const Auth0Provider = ({ children }: { children: React.ReactElement }) => {
  return (
    <AuthProvider
      domain={import.meta.env.VITE_APP_AUTH0_DOMAIN as string}
      clientId={import.meta.env.VITE_APP_AUTH0_CLIENT_ID as string}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <Auth0ContextProvider>{children}</Auth0ContextProvider>
    </AuthProvider>
  );
};

const Auth0ContextProvider = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, user, isLoading, loginWithPopup, logout } = useAuth0();

  // State to track the authentication status and user information
  const [state, setState] = useState<InitialLoginContextProps>(initialState);

  useEffect(() => {
    if (!isLoading) {
      const userProfile: UserProfile | null = isAuthenticated
        ? {
            id: user?.sub,
            avatar: user?.picture,
            email: user?.email,
            name: user?.name,
            tier: 'Premium' // Add more user-specific data if needed
          }
        : null;

      setState({
        isLoggedIn: isAuthenticated,
        isInitialized: true,
        user: userProfile
      });
    }
  }, [isAuthenticated, isLoading, user]);

  const loginAuth = async (options?: PopupLoginOptions) => {
    await loginWithPopup(options);
  };

  const logoutAuth = () => {
    logout();
  };

  const resetPassword = async (_email: string) => {
    // Implement reset password functionality if needed
  };

  const updateProfile = () => {
    // Implement update profile functionality if needed
  };

  if (isLoading || !state.isInitialized) {
    return <Loader />;
  }

  const contextValue: Auth0ContextType = {
    ...state,
    loginAuth,
    logout: logoutAuth,
    resetPassword,
    updateProfile
  };

  return <Auth0Context.Provider value={contextValue}>{children}</Auth0Context.Provider>;
};

export default Auth0Context;
