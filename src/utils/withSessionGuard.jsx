import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingFallback from '../components/LoadingFallback';

const withSessionGuard = (Component) => {
  return function GuardedComponent(props) {
    const navigate = useNavigate();
    const [ready, setReady] = useState(false);

    useEffect(() => {
      const session = JSON.parse(localStorage.getItem('session'));
      if (!session || Date.now() > session.expires_at) {
        localStorage.removeItem('session');
        navigate('/');
      } else {
        setReady(true);
      }
    }, [navigate]);

    return ready ? <Component {...props} /> : <LoadingFallback message="Проверка сессии..." />;
  };
};

export default withSessionGuard;
