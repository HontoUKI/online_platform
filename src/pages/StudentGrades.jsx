import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../sections/Header';
import LoadingFallback from '../components/LoadingFallback';
import ErrorFallback from '../components/ErrorFallback';
import { apiRequest } from '../utils/apiRequest';
import { handleError } from '../utils/handleError';
import '../assets/style.css';

function StudentGrades() {
  const [grades, setGrades] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lessonType, setLessonType] = useState('all');
  const [collapsedSubjects, setCollapsedSubjects] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;
  const session = JSON.parse(localStorage.getItem('session'));
  const token = session?.access_token;

  const toggleSubject = (subject) => {
    setCollapsedSubjects((prev) => ({
      ...prev,
      [subject]: !prev[subject],
    }));
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await apiRequest(`${API_URL}/lessons/student/grades`, { token });
        setGrades(data);
        setFiltered(data);
      } catch (err) {
        setError('Ошибка загрузки данных об оценках');
        handleError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    const filteredList = grades
      .slice()
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at || 0))
      .filter(
        (g) =>
          g.lesson_title.toLowerCase().includes(lower) &&
          (lessonType === 'all' || g.lesson_type === lessonType)
      );
    setFiltered(filteredList);
  }, [grades, searchTerm, lessonType]);

  if (loading) return <LoadingFallback message="Загружаем список оценок..." />;
  if (error) return <ErrorFallback message={error} />;

  return (
    <div className="app full-center">
      <Header />
      <div className="page-container">
        <div className="main-content-container">
          <div className="content fade-in">
            <h1>Мои оценки</h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Поиск по названию урока..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  minWidth: '250px',
                }}
              />
              <select
                value={lessonType}
                onChange={(e) => setLessonType(e.target.value)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                }}
              >
                <option value="all">Все типы</option>
                <option value="тест">Тест</option>
              </select>
            </div>

            {filtered.length > 0 ? (
              Object.entries(
                filtered.reduce((acc, g) => {
                  const subj = g.subject_title;
                  if (!acc[subj]) acc[subj] = [];
                  acc[subj].push(g);
                  return acc;
                }, {})
              ).map(([subject, lessons]) => (
                <div key={subject} style={{ marginBottom: '2rem', width: '100%' }}>
                  <h3
                    onClick={() => toggleSubject(subject)}
                    style={{
                      marginTop: '1rem',
                      color: '#0046a0',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    {collapsedSubjects[subject] ? '+' : '-'} {subject}
                  </h3>
                  {!collapsedSubjects[subject] && (
                    <div className="table-wrapper">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Модуль</th>
                            <th>Урок</th>
                            <th>Тип</th>
                            <th>Оценка</th>
                            <th>Дата сдачи</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {lessons.map((g) => (
                            <tr key={`${g.source}-${g.submission_id}`}>
                              <td>{g.module_title}</td>
                              <td>{g.lesson_title}</td>
                              <td>{g.lesson_type}</td>
                              <td>
                                {g.grade !== null ? `${g.grade} / 100` : 'Ожидает проверки'}
                              </td>
                              <td>
                                {g.submitted_at
                                  ? new Date(g.submitted_at).toLocaleDateString()
                                  : '—'}
                              </td>
                              <td>
                                <Link
                                  to={`/lesson/${g.lesson_id}`}
                                  className="hero-btn"
                                  style={{
                                    padding: '0.3rem 0.8rem',
                                    width: '100%',
                                  }}
                                >
                                  Перейти
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>Нет результатов по запросу.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentGrades;
