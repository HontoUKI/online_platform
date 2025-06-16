import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/fallback.css';

const ErrorFallback = ({ message = 'Что-то пошло не так.', back = true }) => {
  const navigate = useNavigate();

  return (
    <div className="fallback error">
      <h2>Упс!</h2>
      <p>{message}</p>
      {back && <button onClick={() => navigate(-1)}>Вернуться назад</button>}
    </div>
  );
};

export default ErrorFallback;
