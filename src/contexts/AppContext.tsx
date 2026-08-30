
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode
} from 'react';

interface ContextType {
  authenticationToken: string;
  setAuthenticationToken: React.Dispatch<React.SetStateAction<string>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

export const AppContext = createContext<ContextType | undefined>(undefined);

interface AppContextProviderProps {
  children: ReactNode;
  initialToken?: string;
}

export function AppContextProvider({
  children,
  initialToken = ''
}: AppContextProviderProps) {
  const [authenticationToken, setAuthenticationToken] =
    useState(initialToken);

  const [searchTerm, setSearchTerm] = useState('');

  const value = useMemo(
    () => ({
      authenticationToken,
      setAuthenticationToken,
      searchTerm,
      setSearchTerm
    }),
    [authenticationToken, searchTerm]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      'useAppContext must be used within AppContextProvider'
    );
  }

  return context;
}

