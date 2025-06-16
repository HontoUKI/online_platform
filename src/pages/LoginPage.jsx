import React from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import Hero from '../sections/Hero';
import Header from '../sections/Header';
import '../assets/style.css';

const LoginPage = () => {
  const location = useLocation();

  // Проверка сессии ПРЯМО ЗДЕСЬ
  try {
    const raw = localStorage.getItem('session');
    if (raw && raw !== 'null') {
      const session = JSON.parse(raw);
      if (session?.access_token && location.pathname === '/') {
        return <Navigate to="/user" replace />;
      }
    }
  } catch (e) {
    console.warn('Session parse error:', e);
  }

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
