import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams, Link, useLocation } from 'react-router-dom';
import Header from '../sections/Header';
import LoadingFallback from '../components/LoadingFallback';
import ErrorFallback from '../components/ErrorFallback';
import { apiRequest } from '../utils/apiRequest';
import { handleError } from '../utils/handleError';
import '../assets/style.css';

function LessonPage() {
  const { lessonId } = useParams();
  const location = useLocation();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [homeworkFiles, setHomeworkFiles] = useState([]);
  const [comment, setComment] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [submittedFiles, setSubmittedFiles] = useState([]);

  const fileInputRef = useRef(null);


  const session = JSON.parse(localStorage.getItem('session'));
  const token = session?.access_token;
  const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();
  const role = session?.user?.role;


  useEffect(() => {
    if (role !== 'student') {
      navigate('/');
      return;
    }
    const fetchLesson = async () => {
      try {
        const data = await apiRequest(`${API_URL}/lessons/${lessonId}`, { token });
        setLesson(data);
      } catch (err) {
        handleError(err);
        setError('Урок не найден или доступ запрещён.');
      } finally {
        setLoading(false);
      }
    };

    const fetchSubmissions = async () => {
      try {
        const data = await apiRequest(`${API_URL}/lessons/${lessonId}/my-submissions`, { token });
        setSubmittedFiles(data);
      } catch (err) {
      }
    };

    fetchLesson();
    fetchSubmissions();
  }, [lessonId, token, API_URL]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);

    if (files.length > 5) {
      setUploadMessage('Можно прикрепить не более 5 файлов');
      setHomeworkFiles([]);
      return;
    }

    if (totalSize > 20 * 1024 * 1024) {
      setUploadMessage('Общий размер файлов не должен превышать 20 МБ');
      setHomeworkFiles([]);
      return;
    }

    setUploadMessage('');
    setHomeworkFiles(files);
  };

  const handleHomeworkSubmit = async () => {
    if (homeworkFiles.length === 0 && !comment) {
      setUploadMessage('Добавьте хотя бы файл или комментарий');
      return;
    }

    const formData = new FormData();
    homeworkFiles.forEach((file) => formData.append('file', file));
    if (comment) formData.append('comment', comment);

    try {
      const res = await fetch(`${API_URL}/lessons/${lessonId}/submit-homework`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Ошибка при отправке');
      await res.json();

      setUploadMessage('Задание успешно отправлено!');
      setHomeworkFiles([]);
      setComment('');
      fileInputRef.current.value = null;
      const updated = await apiRequest(`${API_URL}/lessons/${lessonId}/my-submissions`, { token });
      setSubmittedFiles(updated);
    } catch (err) {
      handleError(err);
      setUploadMessage('Не удалось отправить');
    }
  };

  const handleDeleteSubmission = async (submissionId) => {
    const confirmed = window.confirm('Удалить отправленную работу?');
    if (!confirmed) return;

    try {
      await apiRequest(`${API_URL}/lessons/submission/${submissionId}`, {
        method: 'DELETE',
        token,
        silent: true,
      });

      setSubmittedFiles((prev) => prev.filter((f) => f.id !== submissionId));
      setUploadMessage('Задание удалено');
    } catch (err) {
      handleError(err);
      setUploadMessage('Не удалось удалить задание');
    }
  };

  const serverURL = import.meta.env.VITE_SERVER_URL || API_URL;
  const getFullPath = (path) =>
    path?.startsWith('http')
      ? path
      : `${serverURL}/files/download/${path.replace(/\\/g, '/').replace(/^\/+/, '')}`



  if (loading) return <LoadingFallback message="Загружаем урок..." />;
  if (error || !lesson) return <ErrorFallback message={error || 'Ошибка загрузки урока'} />;

  const module = lesson.subject?.module;
  const scoreNotice = location.search.includes('score=');

  return (
    <div className="app full-center">
      <Header />
      <div className="page-container">
        <div className="main-content-container lesson-content">
          <div className="content">
            <h1 className="lesson-content-title">{lesson.title}</h1>

            {scoreNotice && <div className="score-toast">Тест успешно завершён!</div>}

            {module && <p className="module-course">Модуль: {module.title}</p>}
            {lesson.subject && <p className="module-item-type">Дисциплина: {lesson.subject.title}</p>}
            <p className="module-date">Тип урока: {lesson.type}</p>
            {lesson.created_at && (
              <p className="module-date">
                Дата добавления: {new Date(lesson.created_at).toLocaleDateString()}
              </p>
            )}

            <div className="lesson-view">
              {lesson.type === 'Тест' ? (
                lesson.result ? (
                  <div className="lesson-result-box">
                    <p><strong>Ваш результат: {lesson.result.score}%</strong></p>
                    <p>Дата прохождения: {new Date(lesson.result.submitted_at).toLocaleDateString()}</p>
                  </div>
                ) : lesson.content_url ? (
                  <Link to={lesson.content_url} className="lesson-link-button">
                    Пройти тест
                  </Link>
                ) : (
                  <>
                    {lesson.description && (
                      <p className="lesson-description">{lesson.description}</p>
                    )}
                    <p style={{ color: 'crimson' }}>Ссылка на тест недоступна</p>
                  </>
                )
              ) : lesson.has_access === false ? (
                <p style={{ color: 'crimson' }}>Материал недоступен для вашего аккаунта</p>
              ) : (
                <>
                  {lesson.content_url ? (
                    <a
                      href={getFullPath(lesson.content_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lesson-link-button"
                    >
                      Перейти к материалу
                    </a>
                  ) : lesson.description ? (
                    <p className="lesson-description">{lesson.description}</p>
                  ) : (
                    <p style={{ color: 'crimson' }}>Материал не прикреплён</p>
                  )}

                  <div className="homework-submit-box">
                    <h3>Загрузка домашнего задания</h3>
                    <p className="homework-hint">До 5 файлов любых форматов, суммарно до 20 МБ</p>
                    <textarea
                      placeholder="Комментарий преподавателю (необязательно)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      style={{ width: '100%', marginBottom: '1vw', padding: '0.5vw' }}
                    />
                    <input type="file" multiple onChange={handleFileChange} ref={fileInputRef} />
                    <button
                      onClick={handleHomeworkSubmit}
                      disabled={homeworkFiles.length === 0 && !comment}
                      className="hero-btn"
                    >
                      Отправить
                    </button>
                    {uploadMessage && <p className="upload-status">{uploadMessage}</p>}
                  </div>

                  {submittedFiles.length > 0 && (
                    <div className="submitted-files">
                      <h4>Ваши отправленные задания</h4>
                      <ul>
                        {submittedFiles.map((f) => (
                          <li key={f.id}>
                            <a href={getFullPath(f.file_path)} target="_blank" rel="noopener noreferrer">
                              {f.file_path.split('/').pop()}
                            </a>
                            {f.comment && <em style={{ marginLeft: '0.5vw' }}>— {f.comment}</em>}
                            {f.grade && (
                              <span style={{ marginLeft: '1vw', color: 'green' }}>
                                Оценка: {f.grade}
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteSubmission(f.id)}
                              style={{
                                marginLeft: '1vw',
                                color: 'crimson',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              Удалить
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>


            <div className="lesson-footer">
                <Link to={"/module"} className="back-button">
                  Назад
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LessonPage;
