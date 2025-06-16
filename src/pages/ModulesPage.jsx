import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from '../components/Menu';
import Header from '../sections/Header';
import LoadingFallback from '../components/LoadingFallback';
import ErrorFallback from '../components/ErrorFallback';
import { apiRequest } from '../utils/apiRequest';
import { handleError } from '../utils/handleError';
import '../assets/style.css';

function ModulesPage() {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;
  const session = JSON.parse(localStorage.getItem('session'));
  const token = session?.access_token;

  useEffect(() => {
    (async () => {
      try {
        const data = await apiRequest(`${API_URL}/access/my-modules`, { token });
        setModules(data);
      } catch (err) {
        setError('Не удалось загрузить модули');
        handleError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [API_URL, token]);

  const handleClick = (moduleId) => {
    navigate(`/module/${moduleId}`);
  };

  if (loading) return <LoadingFallback message="Загружаем модули..." />;
  if (error || modules.length === 0)
    return <ErrorFallback message={error || 'Нет доступных модулей или доступ ограничен.'} />;

  return (
    <div className="app full-center">
      <Header />
      <div className="page-container">
        <div className="content">
          <div className="header-bar">
            <h1 className="title">МОИ МОДУЛИ</h1>
          </div>
          <div className="modules-grid">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="module-card clickable"
                onClick={() => handleClick(mod.id)}
              >
                <div className="module-hover-effect">
                  <h2>{mod.title}</h2>
                  <p>от {new Date(mod.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModulesPage;
