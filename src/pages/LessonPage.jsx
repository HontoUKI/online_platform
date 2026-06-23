import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams, Link, useLocation } from 'react-router-dom';
import Header from '../sections/Header';
import LoadingFallback from '../components/LoadingFallback';
import ErrorFallback from '../components/ErrorFallback';
import { apiRequest } from '../utils/apiRequest';
import { handleError } from '../utils/handleError';
import { getSession } from '../utils/session';
import { downloadFile, openFile } from '../utils/fileDownload';
import '../assets/style.css';

function LessonPage({ setToast }) {
  const { lessonId } = useParams();
  const location = useLocation();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [homeworkFiles, setHomeworkFiles] = useState([]);
  const [comment, setComment] = useState('');
  const [submittedFiles, setSubmittedFiles] = useState([]);

  const fileInputRef = useRef(null);

  const session = getSession();
  const token = session?.access_token;
  const API_URL = import.meta.env.VITE_API_URL;
  const serverURL = import.meta.env.VITE_SERVER_URL || API_URL;

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
        handleError(err, setToast);
        setError('Урок не найден или доступ запрещён.');
      } finally {
        setLoading(false);
      }
    };

    const fetchSubmissions = async () => {
      try {
        const data = await apiRequest(`${API_URL}/lessons/${lessonId}/my-submissions`, { token });
        setSubmittedFiles(data);
      } catch {
        setSubmittedFiles([]);
      }
    };

    fetchLesson();
    fetchSubmissions();
  }, [lessonId, token, API_URL, setToast]);

  const getFullPath = (path) => {
    if (!path) return '';
    const normalized = path.replace(/\\/g, '/').replace(/^\/+/, '');
    return normalized.startsWith('static/')
      ? `${serverURL}/files/download/${normalized.replace(/^static\//, '')}`
      : normalized;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);

    if (files.length > 5) {
      setToast({ message: 'Можно прикрепить не более 5 файлов', type: 'error' });
      setHomeworkFiles([]);
      return;
    }

    if (totalSize > 20 * 1024 * 1024) {
      setToast({ message: 'Общий размер файлов не должен превышать 20 МБ', type: 'error' });
      setHomeworkFiles([]);
      return;
    }

    setHomeworkFiles(files);
  };

  const handleHomeworkSubmit = async () => {
    if (homeworkFiles.length === 0 && !comment.trim()) {
      setToast({ message: 'Добавьте хотя бы файл или комментарий', type: 'info' });
      return;
    }

    const formData = new FormData();
    homeworkFiles.forEach((file) => formData.append('file', file));
    if (comment) formData.append('comment', comment);

    try {
      await apiRequest(`${API_URL}/lessons/${lessonId}/submit-homework`, {
        method: 'POST',
        data: formData,
        token,
      });

      setToast({ message: 'Задание успешно отправлено!', type: 'success' });
      setHomeworkFiles([]);
      setComment('');
      fileInputRef.current.value = null;

      const updated = await apiRequest(`${API_URL}/lessons/${lessonId}/my-submissions`, { token });
      setSubmittedFiles(updated);
    } catch (err) {
      handleError(err, setToast);
      setToast({ message: 'Не удалось отправить', type: 'error' });
    }
  };

  const confirmDeleteSubmission = (submissionId) => {
    setToast({
      message: 'Удалить отправленную работу?',
      type: 'error',
      actionText: 'Удалить',
      onAction: () => deleteSubmissionConfirmed(submissionId),
    });
  };

  const deleteSubmissionConfirmed = async (submissionId) => {
    try {
      await apiRequest(`${API_URL}/lessons/submission/${submissionId}`, {
        method: 'DELETE',
        token,
        silent: true,
      });

      setSubmittedFiles((prev) => prev.filter((f) => f.id !== submissionId));
      setToast({ message: 'Задание удалено', type: 'success' });
    } catch (err) {
      handleError(err, setToast);
      setToast({ message: 'Не удалось удалить задание', type: 'error' });
    }
  };

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
            <div>
              <p><strong>Описание урока</strong></p>
              <span>{lesson.description}</span>
            </div>
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
                    {lesson.description && <p className="lesson-description">{lesson.description}</p>}
                    <p className="u-text-error">Ссылка на тест недоступна</p>
                  </>
                )
              ) : lesson.has_access === false ? (
                <p className="u-text-error">Материал недоступен для вашего аккаунта</p>
              ) : (
                <>
                  {lesson.content_url ? (
                    <button
                      type="button"
                      onClick={() =>
                        openFile(getFullPath(lesson.content_url)).catch((err) =>
                          handleError(err, setToast)
                        )
                      }
                      className="lesson-link-button"
                    >
                      Перейти к материалу
                    </button>
                  ) : lesson.description ? (
                    <p className="lesson-description">{lesson.description}</p>
                  ) : (
                    <p className="u-text-error">Материал не прикреплён</p>
                  )}

                  <div className="homework-submit-box">
                    <h3>Загрузка домашнего задания</h3>
                    <p className="homework-hint">До 5 файлов любых форматов, суммарно до 20 МБ</p>
                    <textarea
                      placeholder="Комментарий преподавателю (необязательно)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="homework-comment"
                    />
                    <input type="file" multiple onChange={handleFileChange} ref={fileInputRef} />
                    <button
                      onClick={handleHomeworkSubmit}
                      disabled={homeworkFiles.length === 0 && !comment}
                      className="hero-btn"
                    >
                      Отправить
                    </button>
                  </div>

                  {submittedFiles.length > 0 && (
                    <div className="submitted-files">
                      <h4>Ваши отправленные задания</h4>
                      <ul>
                        {submittedFiles.map((f) => (
                          <li key={f.id}>
                            <button
                              onClick={() =>
                                downloadFile(
                                  getFullPath(f.file_path),
                                  f.file_path.split('/').pop()
                                ).catch((err) => handleError(err, setToast))
                              }
                              className="file-link-button"
                            >
                              {f.file_path.split('/').pop()}
                            </button>
                            {f.comment && (
                              <em className="submission-comment">— {f.comment}</em>
                            )}
                            {f.grade && (
                              <span className="submission-grade">
                                Оценка: {f.grade}
                              </span>
                            )}
                            <button
                              onClick={() => confirmDeleteSubmission(f.id)}
                              className="submission-delete"
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
              <Link to="/module" className="back-button">
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
