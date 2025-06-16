import React, { useState, useEffect } from 'react';
import LoginModal from '../components/LoginModal';
import Menu from '../components/Menu';
import '../assets/style.css';

const API_URL = import.meta.env.VITE_API_URL;

const Header = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

useEffect(() => {
  const loadSession = () => {
    const session = JSON.parse(localStorage.getItem('session'));
    const savedUser = session?.user;

    if (savedUser) {
      setUser(savedUser);

      if (savedUser.photo) {
        const fixedPath = savedUser.photo.replace(/\\/g, '/');
        const full = fixedPath.startsWith('http')
          ? fixedPath
          : `${API_URL}/${fixedPath}`;
        setPhotoPreview(full);
      } else {
        setPhotoPreview(null);
      }
    } else {
      setUser(null);
      setPhotoPreview(null);
    }
  };

  loadSession();

  const handleSessionChange = () => loadSession();
  window.addEventListener('session-updated', handleSessionChange);

  return () => window.removeEventListener('session-updated', handleSessionChange);
}, []);


  const handleLogin = (user) => {
    const session = JSON.parse(localStorage.getItem('session')) || {};
    const newSession = { ...session, user };
    localStorage.setItem('session', JSON.stringify(newSession));

    window.dispatchEvent(new Event('session-updated'));

    setUser(user);

    if (user.photo) {
      const fixedPath = user.photo.replace(/\\/g, '/');
      const fullPhotoUrl = fixedPath.startsWith('https')
        ? fixedPath
        : `${API_URL}/${fixedPath}`;
      setPhotoPreview(fullPhotoUrl);
    } else {
      setPhotoPreview(null);
    }

    setModalOpen(false);
  };

  return (
    <header className="header">
      {user && <Menu />}
      {!user ? (
        <button className="login-btn" onClick={() => setModalOpen(true)}>Войти</button>
      ) : (
        <div className="user-info">
          {photoPreview && <img src={photoPreview} alt="avatar" className="avatar" />}
          <span>{user.short_name}</span>
        </div>
      )}
      {modalOpen && (
        <LoginModal
          onClose={() => setModalOpen(false)}
          onLogin={handleLogin}
        />
      )}
    </header>
  );
};

export default Header;
