import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/style.css';
import '../assets/NotFound.css';

function NotFound() {
  return (
    <div className="app full-center hero fade-in not-found">
      <h1 className="not-found__code">404</h1>
      <p className="not-found__text">Страница не найдена</p>
      <h3 className="not-found__link">
        <Link to="/" className="hero-btn">
          Вернуться на главную
        </Link>
      </h3>
    </div>
  );
};

export default NotFound;
