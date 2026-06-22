import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingFallback from '../components/LoadingFallback';
import { isSessionValid, clearSession } from './session';

const withSessionGuard = (GuardedPage) => {
  return function GuardedComponent(props) {
    const navigate = useNavigate();
    const [ready, setReady] = useState(false);

    useEffect(() => {
      if (!isSessionValid()) {
        clearSession();
        navigate('/');
      } else {
        setReady(true);
      }
    }, [navigate]);

    return ready ? React.createElement(GuardedPage, props) : <LoadingFallback message="Проверка сессии..." />;
  };
};

export default withSessionGuard;
