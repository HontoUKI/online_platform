import React, { useEffect, useState } from 'react';
import withSessionGuard from '../utils/withSessionGuard';
import { handleError } from '../utils/handleError';
import { apiRequest } from '../utils/apiRequest';
import { getSession } from '../utils/session';
import Header from '../sections/Header';
import LoadingFallback from '../components/LoadingFallback';
import ErrorFallback from '../components/ErrorFallback';
import { useNavigate } from 'react-router-dom';
import '../assets/style.css';

function ModulesTeacherPage() {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;
  const session = getSession();
  const token = session?.access_token;
  const role = session?.user?.role;

  useEffect(() => {
    (async () => {
      try {
        const endpoint =
          role === 'admin'
            ? `${API_URL}/access/admin-modules`
            : `${API_URL}/access/teacher-modules`;

        const data = await apiRequest(endpoint, { token });
        setModules(data);
      } catch (err) {
        handleError(err);
        setModules([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [API_URL, token, role]);

  if (loading) return <LoadingFallback message="Подгружаем модули..." />;
  if (!loading && modules.length === 0)
    return <ErrorFallback message="Модули не найдены или доступ ограничен." />;

  return (
    <div className="app full-center">
      <Header />
      <div className="page-container">
        <div className="content">
          <div className="header-bar">
            <h1 className="title">
              {role === 'admin' ? 'ВСЕ МОДУЛИ' : 'МОДУЛИ ПРЕПОДАВАТЕЛЯ'}
            </h1>
          </div>
          <div className="modules-grid">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="module-card clickable"
                onClick={() => navigate(`/teacher/module/${mod.id}`)}
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

export default withSessionGuard(ModulesTeacherPage);
