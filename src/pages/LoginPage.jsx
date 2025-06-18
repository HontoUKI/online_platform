import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Hero from '../sections/Hero';
import Header from '../sections/Header';
import '../assets/style.css';

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('session');
      if (raw && raw !== 'null') {
        const session = JSON.parse(raw);
        if (session?.access_token && location.pathname === '/') {
          navigate('/user', { replace: true });
        }
      }
    } catch (e) {
      console.warn('Session parse error:', e);
    } finally {
      setChecking(false);
    }
  }, [location.pathname, navigate]);

  if (checking) return null;

  return (
    <div className="app full-center">
      <Header />
      <main className="main-section full-center" style={{ flexGrow: 1 }}>
        <Hero />
      </main>
    </div>
  );
};

export default LoginPage;
