import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/modal.css';

const LoginModal = ({ onClose }) => {
  const [iin, setIin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showSupport, setShowSupport] = useState(false); // Управление показом номера
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  
  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iin, password })
      });

      if (!response.ok) {
        throw new Error('Неверный ИИН или пароль');
      }

      const data = await response.json();
      const expiresInDays = rememberMe ? 30 : 3;
      const expirationDate = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;

      localStorage.setItem('session', JSON.stringify({
        access_token: data.access_token,
        user: data.user,
        expires_at: expirationDate
      }));

      onClose();
      navigate('/user');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <h2>Вход</h2>

        <input
          type="text"
          placeholder="Введите ИИН (12 цифр)"
          value={iin}
          onChange={(e) => setIin(e.target.value)}
          maxLength="12"
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="extra-options modal-row">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span style={{ fontSize: 'clamp(1rem, 4.2vw, 1.25rem)' }}>
              Не выходить
            </span>
          </div>
        </div>

        {showSupport && (
          <p className="support-phone">Обратитесь по телефону: +7 (777) 123-45-67</p>
        )}

        {error && <p className="error-message">{error}</p>}

        <button className="login-button" onClick={handleLogin}>Войти</button>
      </div>
    </div>
  );
};

export default LoginModal;
