import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Hero from '../sections/Hero';
import Header from '../sections/Header';
import { getToken } from '../utils/session';
import '../assets/style.css';

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (getToken() && location.pathname === '/') {
      navigate('/user', { replace: true });
    }
    setChecking(false);
  }, [location.pathname, navigate]);

  if (checking) return null;

  return (
    <div className="app full-center">
      <Header />
      <main className="main-section full-center u-grow">
        <Hero />
      </main>
    </div>
  );
};

export default LoginPage;
