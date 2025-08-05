import { useContext } from 'react';
import AuthContext from 'contexts/AWSCognitoContext';

const useAuthToken = () => {
  const auth = useContext(AuthContext);

  if (!auth) {
    console.warn('useAuthToken must be used within AWSCognitoProvider');
    return null;
  }

  const token = localStorage.getItem('serviceToken');

  return {
    token,
    user: auth.user,
    isLoggedIn: auth.isLoggedIn
  };
};

export default useAuthToken;
