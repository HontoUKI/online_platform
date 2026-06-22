import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';
import { apiRequest } from '../utils/apiRequest';
import { setSession } from '../utils/session';
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
      const resData = await apiRequest(`${API_URL}/auth/login`, {
        method: 'POST',
        data: { iin, password },
      });

      const expiresInDays = rememberMe ? 30 : 3;
      const expirationDate = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;

      setSession({
        access_token: resData.access_token,
        user: resData.user,
        expires_at: expirationDate,
      });

      onClose();
      navigate('/user');
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        setError('Ошибка соединения. Попробуйте позже.');
      } else {
        setError(err.response?.data?.detail || 'Ошибка авторизации');
      }
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
          <label className="modal-remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isSubmitting}
            />
            <span className="modal-remember-text">
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
