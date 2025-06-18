import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';
import '../assets/modal.css';

const SUPPORT_ENABLED = import.meta.env.VITE_SUPPORT_ENABLED === 'true';
const SUPPORT_PHONE = import.meta.env.VITE_SUPPORT_PHONE || '';

const LoginModal = ({ onClose }) => {
  const [iin, setIin] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async () => {
    if (!iin.trim() || !password.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iin, password }),
      });

      const resData = await response.json();

      if (!response.ok) {
        setError(resData.detail || 'Ошибка авторизации');
        return;
      }

      const expiresInDays = rememberMe ? 30 : 3;
      const expirationDate = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;

      localStorage.setItem(
        'session',
        JSON.stringify({
          access_token: resData.access_token,
          user: resData.user,
          expires_at: expirationDate,
        })
      );

      onClose();
      navigate('/user');
    } catch (err) {
      setError('Ошибка соединения. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && iin && password && !isSubmitting) {
            handleLogin();
          }
        }}
      >
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <h2>Вход</h2>

        <input
          type="text"
          placeholder="Введите ИИН (12 цифр)"
          value={iin}
          onChange={(e) => setIin(e.target.value)}
          maxLength="12"
          disabled={isSubmitting}
        />

        <div className="password-wrapper">
          <input
            type= "password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="extra-options modal-row">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isSubmitting}
            />
            <span style={{ fontSize: 'clamp(1rem, 4.2vw, 1.25rem)' }}>
              Не выходить
            </span>
          </label>
        </div>

        {error && <Toast message={error} onClose={() => setError('')} />}

        {SUPPORT_ENABLED && error && (
          <p className="support-hint">
            Возникли проблемы? Свяжитесь с поддержкой:<br />
            <strong>{SUPPORT_PHONE}</strong>
          </p>
        )}

        <button
          className="login-button"
          onClick={handleLogin}
          disabled={isSubmitting || !iin || !password}
        >
          {isSubmitting ? 'Вход...' : 'Войти'}
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
