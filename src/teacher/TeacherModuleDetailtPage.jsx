import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../sections/Header';
import LessonModal from './LessonModal';
import LoadingFallback from '../components/LoadingFallback';
import ErrorFallback from '../components/ErrorFallback';
import withSessionGuard from '../utils/withSessionGuard';
import { apiRequest } from '../utils/apiRequest';
import { handleError } from '../utils/handleError';
import '../assets/style.css';

function ModuleDetailsTeacherPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [openedDisciplines, setOpenedDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const session = JSON.parse(localStorage.getItem('session'));
  const token = session?.access_token;
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchModule = async () => {
    try {
      const data = await apiRequest(`${API_URL}/access/teacher-modules/${id}`, { token });
      setModule(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModule();
  }, [id]);

  const toggleDiscipline = (disciplineId) => {
    setOpenedDisciplines((prev) =>
      prev.includes(disciplineId)
        ? prev.filter((openedId) => openedId !== disciplineId)
        : [...prev, disciplineId]
    );
  };

  const openModal = (subjectId) => {
    setSelectedSubject(subjectId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleLessonAdded = () => {
    fetchModule();
  };

  const handleDeleteLesson = async (lessonId) => {
    const confirmed = window.confirm(
      'Вы уверены, что хотите удалить урок и все вложенные файлы?'
    );
    if (!confirmed) return;

    try {
      await apiRequest(`${API_URL}/lessons/${lessonId}`, {
        method: 'DELETE',
        token,
        silent: true,
      });
      await fetchModule();
    } catch (err) {
      handleError(err);
    }
  };

  if (loading) return <LoadingFallback message="Подгружаем модуль..." />;
  if (!loading && !module)
    return <ErrorFallback message="Модуль не найден или доступ ограничен." />;

  return (
    <div className="app full-center">
      <Header />
      <div className="page-container">
        <div className="main-content-container">
          <div className="content">
            <div className="module-details-container">
              <div className="module-details">
                <h1 className="module-details-title">{module.title}</h1>
                <p className="module-date">
                  Дата добавления: {new Date(module.created_at).toLocaleDateString()}
                </p>
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
              <h3>Дисциплины курса:</h3>
              <div className="module-content-flex">
                {module.subjects.map((subject) => (
                  <div key={subject.id} className="module-item-container">
                    <div
                      className="module-item-container-tittle"
                      onClick={() => toggleDiscipline(subject.id)}
                    >
                      <h4 className="module-item-title clickable">{subject.title}</h4>
                      <button
                        className="add-lesson-btn"
                        onClick={() => openModal(subject.id)}
                      >
                        Добавить урок
                      </button>
                    </div>
                    {openedDisciplines.includes(subject.id) && (
                      <ul className="lesson-list">
                        {subject.lessons.map((lesson) => (
                          <li key={lesson.id} className="lesson-item">
                            <Link
                              to={`/teacher/lesson/${lesson.id}`}
                              state={{ lessonType: lesson.type }}
                              className="lesson-link"
                            >
                              {lesson.title} ({lesson.type})
                            </Link>
                            <button
                              className="delete-lesson-btn"
                              onClick={() => handleDeleteLesson(lesson.id)}
                              title="Удалить урок"
                            >
                              Удалить
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isModalOpen && (
              <LessonModal
                subjectId={selectedSubject}
                onClose={closeModal}
                onLessonAdded={handleLessonAdded}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withSessionGuard(ModuleDetailsTeacherPage);
