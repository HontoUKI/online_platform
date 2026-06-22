import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { apiRequest } from '../utils/apiRequest';
import { handleError } from '../utils/handleError';
import { getToken, clearSession } from '../utils/session';

const PrivateRoute = ({ children, setToast }) => {
  const [auth, setAuth] = useState({ checked: false, valid: false });
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setAuth({ checked: true, valid: false });
      return;
    }

    (async () => {
      try {
        await apiRequest(`${API_URL}/auth/check`, { token });
        setAuth({ checked: true, valid: true });
      } catch (err) {
        clearSession();
        handleError(err, setToast);
        setAuth({ checked: true, valid: false });
      }
    })();
  }, [API_URL, setToast]);

  if (!auth.checked) return null; // или Spinner
  if (!auth.valid) return <Navigate to="/" replace />;
  return children;
};

export default PrivateRoute;
