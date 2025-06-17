import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import Header from '../sections/Header';
import LoadingFallback from '../components/LoadingFallback';
import ErrorFallback from '../components/ErrorFallback';
import { apiRequest } from '../utils/apiRequest';
import { handleError } from '../utils/handleError';
import withSessionGuard from '../utils/withSessionGuard';
import '../assets/style.css';

const triggerDownload = (url) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = '';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function LessonTeacher() {
  const { lessonId } = useParams();
  const location = useLocation();
  const [lessonType, setLessonType] = useState(location.state?.lessonType || null);
  const [submissions, setSubmissions] = useState([]);
  const [grades, setGrades] = useState({});
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const session = JSON.parse(localStorage.getItem('session'));
  const token = session?.access_token;
  const isTeacher = session?.user?.role === 'teacher';


  const API_URL = import.meta.env.VITE_API_URL;
  const serverURL = import.meta.env.VITE_SERVER_URL || API_URL;

  const getFullPath = (path) => {
    if (!path) return '';
    const normalized = path.replace(/\\/g, '/').replace(/^\/+/, '');
    return normalized.startsWith('static/')
      ? `${serverURL}/files/download/${normalized.replace(/^static\//, '')}`
      : normalized;
  };



  useEffect(() => {
    (async () => {
      try {
        const lesson = await apiRequest(`${API_URL}/lessons/${lessonId}`, { token });
        setLessonType(lesson.type);
        await fetchSubmissions(lesson.type);
      } catch (err) {
        setError('Урок не найден или доступ ограничен.');
        handleError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [lessonId]);

  const fetchSubmissions = async (type) => {
    const endpoint =
      type === 'Тест'
        ? `${API_URL}/lessons/${lessonId}/submissions/tests`
        : `${API_URL}/lessons/${lessonId}/submissions/files`;

    try {
      const data = await apiRequest(endpoint, { token });
      setSubmissions(data);

      if (type !== 'Тест') {
        const initialGrades = {};
        data.forEach((s) => {
          if (s.grade !== null) initialGrades[s.id] = s.grade;
        });
        setGrades(initialGrades);
      }
    } catch (err) {
      setError('Не удалось загрузить отправленные работы');
      handleError(err);
    }
  };

  const handleChange = (id, value) => {
    setGrades((prev) => ({ ...prev, [id]: value }));
  };

  const handleGradeSubmit = async (submissionId) => {
    const grade = grades[submissionId];
    try {
      await apiRequest(`${API_URL}/lessons/submission/${submissionId}/grade`, {
        method: 'PATCH',
        data: { grade: Number(grade) },
        token,
      });
      setMessage('Оценка сохранена');
    } catch (err) {
      setMessage('Ошибка при сохранении оценки');
      handleError(err);
    }
  };

  const handleDeleteResult = async (resultId) => {
    if (!window.confirm('Точно удалить результат?')) return;

    try {
      await apiRequest(`${API_URL}/lessons/result/${resultId}`, {
        method: 'DELETE',
        token,
      });
      setSubmissions((prev) => prev.filter((s) => s.id !== resultId));
      setMessage('Результат удалён');
    } catch (err) {
      setMessage('Ошибка при удалении результата');
      handleError(err);
    }
  };

  const filtered = submissions
    .filter((s) =>
      s.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at || 0));

  const averageScore = (() => {
    if (!filtered.length) return null;
    if (lessonType === 'Тест') {
      const total = filtered.reduce((sum, s) => sum + (s.score ?? 0), 0);
      return Math.round(total / filtered.length);
    } else {
      const graded = filtered.filter((s) => grades[s.id] !== undefined);
      const total = graded.reduce((sum, s) => sum + Number(grades[s.id] || 0), 0);
      return graded.length ? Math.round(total / graded.length) : null;
    }
  })();

  if (loading) return <LoadingFallback message="Загружаем данные урока..." />;
  if (error) return <ErrorFallback message={error} />;

  return (
    <div className="app full-center">
      <Header />
      <div className="page-container">
        <div className="main-content-container">
          <div className="content fade-in">
            <h1>Проверка заданий</h1>

            {averageScore !== null && (
              <div style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
                Средний балл: {averageScore}
              </div>
            )}

            <input
              type="text"
              placeholder="Поиск по ФИО студента..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.6rem',
                marginBottom: '1rem',
                fontSize: '1rem',
                width: '100%',
                borderRadius: '0.5rem',
                border: '1px solid #ccc',
              }}
            />

            {message && <p className="upload-status">{message}</p>}

            {filtered.length > 0 ? (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Студент</th>
                      {lessonType === 'Тест' ? (
                        <>
                          <th>Оценка</th>
                          <th>Дата сдачи</th>
                          <th>{isTeacher ? 'Действие' : ''}</th>
                        </>
                      ) : (
                        <>
                          <th>Файл</th>
                          <th>Комментарий</th>
                          <th>Оценка</th>
                          <th>Действие</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr key={s.id}>
                        <td>{s.student_name}</td>
                        {lessonType === 'Тест' ? (
                          <>
                            <td>{s.score}</td>
                            <td>{s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : '—'}</td>
                            <td>
                              {isTeacher && (
                                <button
                                  onClick={() => handleDeleteResult(s.id)}
                                  className="hero-btn"
                                  style={{ background: 'red', color: 'white' }}
                                >
                                  Удалить
                                </button>
                              )}
                            </td>
                          </>
                        ) : (
                          <>
                            <td>
                              <button
                                onClick={() => triggerDownload(getFullPath(s.file_path))}
                                className="lesson-link"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  color: '#0366d6',
                                  cursor: 'pointer'
                                }}
                              >
                                {s.file_path.split('/').pop()}
                              </button>
                            </td>
                            <td>{s.comment || '—'}</td>
                            <td>
                              <input
                                type="number"
                                value={grades[s.id] || ''}
                                onChange={(e) => handleChange(s.id, e.target.value)}
                                disabled={!isTeacher}
                              />
                            </td>
                            <td>
                              {isTeacher && (
                                <button onClick={() => handleGradeSubmit(s.id)} className="hero-btn">
                                  Сохранить
                                </button>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Пока нет отправленных работ.</p>
            )}

            <div style={{ marginTop: '2rem' }}>
              <Link to={-1} className="back-button">
                ← Назад к уроку
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withSessionGuard(LessonTeacher);
