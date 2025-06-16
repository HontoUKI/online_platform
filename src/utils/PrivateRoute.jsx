import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { apiRequest } from '../utils/apiRequest'; // или свой fetch
import { handleError } from '../utils/handleError';

const PrivateRoute = ({ children }) => {
  const [auth, setAuth] = useState({ checked: false, valid: false });
  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('session'));
    const token = session?.access_token;

    if (!token) {
      setAuth({ checked: true, valid: false });
      return;
    }

    (async () => {
      try {
        await apiRequest(`${API_URL}/auth/check`, { token });
        setAuth({ checked: true, valid: true });
      } catch (err) {
        localStorage.removeItem('session');
        handleError(err, alert);
        setAuth({ checked: true, valid: false });
      }
    })();
  }, []);

  if (!auth.checked) return null; // можно вставить Skeleton или Spinner
  if (!auth.valid) return <Navigate to="/" replace />;
  return children;
};

export default PrivateRoute;
