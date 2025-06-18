import React, { useState, useEffect } from 'react';
import Header from '../sections/Header';
import LoadingFallback from '../components/LoadingFallback';
import { apiRequest } from '../utils/apiRequest';
import { handleError } from '../utils/handleError';
import '../assets/PersonalAccountPage.css';

function PersonalAccountPage({ setToast }) {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [oldPass, setOldPass] = useState('');
  const [newPass1, setNewPass1] = useState('');
  const [newPass2, setNewPass2] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = JSON.parse(localStorage.getItem('session'))?.access_token;

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('session'));
    const userData = session?.user;
    if (userData) {
      setUser(userData);
      setPhone(userData.phone || '');

      if (userData.photo) {
        const fixedPath = userData.photo.replace(/\\/g, '/');
        const full = fixedPath.startsWith('http') ? fixedPath : `${API_URL}/${fixedPath}`;
        setPhotoPreview(full);
      }
    }
  }, []);

  const updateSessionUser = (newUser) => {
    const session = JSON.parse(localStorage.getItem('session'));
    localStorage.setItem('session', JSON.stringify({ ...session, user: newUser }));
    window.dispatchEvent(new Event('session-updated'));

    setUser(newUser);
    if (newUser.photo) {
      const fixed = newUser.photo.replace(/\\/g, '/');
      const full = fixed.startsWith('http') ? fixed : `${API_URL}/${fixed}`;
      setPhotoPreview(full);
    } else {
      setPhotoPreview(null);
    }
  };

  const handlePhoneChange = (e) => setPhone(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiRequest(`${API_URL}/user/update-phone`, {
        method: 'POST',
        data: { phone },
        token,
      });
      updateSessionUser(data.user);
      setToast({ message: 'Номер телефона успешно обновлён', type: 'success' });
    } catch (err) {
      handleError(err, setToast);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    if (e.target.files?.[0]) {
      setPhotoFile(e.target.files[0]);
      setPhotoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const uploadPhoto = async () => {
    if (!photoFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);

      const res = await fetch(`${API_URL}/user/upload-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Ошибка загрузки фото');
      const data = await res.json();
      updateSessionUser(data.user);
      setPhotoFile(null);
      setToast({ message: 'Фото успешно обновлено', type: 'success' });
    } catch (err) {
      handleError(err, setToast);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPass1 !== newPass2) {
      setToast({ message: 'Новые пароли не совпадают', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await apiRequest(`${API_URL}/user/change-password`, {
        method: 'PATCH',
        data: {
          old_password: oldPass,
          new_password: newPass1,
        },
        token,
      });
      setOldPass('');
      setNewPass1('');
      setNewPass2('');
      setShowPasswordForm(false);
      setToast({ message: 'Пароль успешно изменён', type: 'success' });
    } catch (err) {
      handleError(err, setToast);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <LoadingFallback message="Загружаем профиль..." />;

  return (
    <div className="personal-account-container">
      <Header />
      <div className="personal-account-content">
        <div className="personal-account-main">
          <h2>{user.full_name}</h2>
          <p>IIN: {user.iin}</p>

          <div className="upload-photo-container">
            <div className="photo-preview">
              <div className="profile-photo">
                {photoPreview ? <img src={photoPreview} alt="User avatar" /> : <span>Нет фото</span>}
              </div>
              <div className="profile-photo-small">
                {photoPreview ? <img src={photoPreview} alt="Avatar small" /> : <span>Нет фото</span>}
              </div>
              <div className="profile-photo-mini">
                {photoPreview ? <img src={photoPreview} alt="Avatar mini" /> : <span>Нет фото</span>}
              </div>
            </div>
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
            <button onClick={uploadPhoto} disabled={loading || !photoFile}>
              {loading ? 'Загрузка...' : 'Загрузить фото'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="phone-form">
            <label htmlFor="phone">Телефон:</label>
            <input
              className="input"
              id="phone"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="Номер телефона"
              maxLength="16"
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Обновление...' : 'Сменить номер'}
            </button>
          </form>

          {!showPasswordForm && (
            <button
              className="hero-btn"
              style={{ marginTop: '1rem', width: '100%' }}
              onClick={() => setShowPasswordForm(true)}
            >
              Редактировать пароль
            </button>
          )}

          {showPasswordForm && (
            <form onSubmit={handlePasswordChange} className="phone-form">
              <label htmlFor="oldPass">Смена пароля:</label>
              <input
                className="input"
                id="oldPass"
                type="password"
                placeholder="Старый пароль"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                required
              />
              <input
                className="input"
                type="password"
                placeholder="Новый пароль"
                value={newPass1}
                onChange={(e) => setNewPass1(e.target.value)}
                required
              />
              <input
                className="input"
                type="password"
                placeholder="Повторите новый пароль"
                value={newPass2}
                onChange={(e) => setNewPass2(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Обновление...' : 'Сменить пароль'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default PersonalAccountPage;
