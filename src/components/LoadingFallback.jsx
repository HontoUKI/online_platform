import React from 'react';
import '../assets/fallback.css';

const LoadingFallback = ({ message = 'Загрузка...' }) => (
  <div className="fallback loading">
    <div className="spinner" />
    <p>{message}</p>
  </div>
);

export default LoadingFallback;
