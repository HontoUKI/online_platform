import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/style.css';

function NotFound() {
  return (
    <div className="app full-center hero fade-in" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
      <p style={{ fontSize: '1.5rem' }}>Страница не найдена</p>
      <h3 style={{ marginTop: '1rem'}}>
        <Link to="/" className="hero-btn">
          Вернуться на главную
        </Link>
      </h3>
    </div>
  );
};

export default NotFound;
