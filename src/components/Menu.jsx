import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getSession, clearSession } from '../utils/session';

const Menu = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const logout = () => {
    clearSession();
    navigate('/');
  };

  const toggleMenu = (event) => {
    event?.stopPropagation?.();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const user = getSession()?.user;
    if (user?.role) {
      setRole(user.role);
    }

    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.menu-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="menu-wrapper">
      {!isOpen && (
        <div className="menu-toggle" onClick={toggleMenu}>
          <svg width="30" height="30" viewBox="0 0 24 25" fill="none">
            <path d="M3 6.76855H21M3 12.0186H21M3 17.2686H21" stroke="#0046a0" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {isOpen && (
        <div className="menu-container open">
          <div className="menu-header">
            <p className="menu-title">Меню</p>
            <div className="menu-close" onClick={toggleMenu}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6 6L18 18M18 6L6 18" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <Link to="/user" className="menu-item" onClick={toggleMenu}>Личный кабинет</Link>
          {role === 'teacher' && (
            <Link to="/teacher/module" className="menu-item" onClick={toggleMenu}>
              Модули (преподаватель)
            </Link>
          )}
          {role === 'student' && (
            <>
              <Link to="/module" className="menu-item" onClick={toggleMenu}>
                Модули
              </Link>
              <Link to="/grades" className="menu-item" onClick={toggleMenu}>
                Оценки
              </Link>
            </>
          )}

          {role === 'admin' && (
            <>
              <Link to="/admin" className="menu-item" onClick={toggleMenu}>Админ-панель</Link>
              <Link to="/teacher/module" className="menu-item" onClick={toggleMenu}>
                  Модули (преподаватель)
              </Link>
            </>
          )}
          <div onClick={logout} className="menu-item">Выход</div>
        </div>
      )}
    </div>
  );
};

export default Menu;
