import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../sections/Header';
import LoadingFallback from '../components/LoadingFallback';
import ErrorFallback from '../components/ErrorFallback';
import { apiRequest } from '../utils/apiRequest';
import { handleError } from '../utils/handleError';
import '../assets/style.css';

function ModuleDetailsPage() {
  const { id } = useParams();
  const [module, setModule] = useState(null);
  const [openedDisciplines, setOpenedDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;
  const session = JSON.parse(localStorage.getItem('session'));
  const token = session?.access_token;

  useEffect(() => {
    (async () => {
      try {
        const data = await apiRequest(`${API_URL}/access/my-modules/${id}`, { token });
        setModule(data);
      } catch (err) {
        setError('Модуль не найден или доступ отсутствует.');
        handleError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, API_URL, token]);

  const toggleDiscipline = (disciplineId) => {
    setOpenedDisciplines((prev) =>
      prev.includes(disciplineId)
        ? prev.filter((openedId) => openedId !== disciplineId)
        : [...prev, disciplineId]
    );
  };

  if (loading) return <LoadingFallback message="Загружаем модуль..." />;
  if (error || !module) return <ErrorFallback message={error || 'Не удалось загрузить модуль'} />;

  return (
    <div className="app full-center">
      <Header />
      <div className="page-container">
        <div className="main-content-container">
          <div className="content">
            <div className="module-details-container">
              <div className="module-details">
                <h1 className="title">{module.title}</h1>
                <p className="module-date">Дата добавления: {new Date(module.created_at).toLocaleDateString()}</p>
              </div>
              <div className="module-course">
                <p>Курс: {module.course}</p>
              </div>
            </div>

            <div className="module-description">
              <h2>Описание курса</h2>
              <p>{module.description}</p>
            </div>

            <div className="module-content-container">
              <h3>Предметы курса:</h3>
              <div className="module-content-flex">
                {module.subjects.map((item) => (
                  <div
                    key={item.id}
                    className="module-item-container"
                    onClick={() => toggleDiscipline(item.id)}
                  >
                    <h4 className="module-item-title clickable">{item.title}</h4>

                    {openedDisciplines.includes(item.id) && (
                      <ul className="lesson-list">
                        {item.lessons.map((lesson) => (
                          <li key={lesson.id} className="lesson-item">
                            <Link
                              to={`/lesson/${lesson.id}`}
                              className="lesson-link"
                            >
                              {lesson.title} ({lesson.type})
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModuleDetailsPage;
