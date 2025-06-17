import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/apiRequest';
import { handleError } from '../utils/handleError';
import '../assets/modal.css';

const LessonModal = ({ subjectId, onClose, onLessonAdded }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Лекция');
  const [description, setDescription] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [useUpload, setUseUpload] = useState(false);

  const [testId, setTestId] = useState('');
  const [testConflict, setTestConflict] = useState(false);
  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem('session'));
  const token = session?.access_token;
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (type === 'Тест') {
      (async () => {
        try {
          const data = await apiRequest(`${API_URL}/tests/by-subject/${subjectId}`, { token });
          setAvailableTests(data);
        } catch {
          setAvailableTests([]);
        }
      })();
    }
  }, [type, subjectId, token, API_URL]);

  useEffect(() => {
    if (testId) {
      const test = availableTests.find((t) => String(t.id) === String(testId));
      setSelectedTest(test || null);
      setTestConflict(test?.lesson_id !== null);
    } else {
      setSelectedTest(null);
      setTestConflict(false);
    }
  }, [testId, availableTests]);

  const handleAddLesson = async () => {
    setError('');

    try {
      let uploadedUrl = contentUrl;

      if (useUpload && uploadFile?.size > 10 * 1024 * 1024) {
        setError('Файл превышает допустимый размер (макс. 10 МБ)');
        return;
      }

      if (type !== 'Тест' && useUpload && uploadFile) {
        const formData = new FormData();
        formData.append('file', uploadFile);

        const uploadRes = await fetch(`${API_URL}/lessons/upload/lesson-file`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!uploadRes.ok) throw new Error('Ошибка загрузки файла');
        const uploadData = await uploadRes.json();
        uploadedUrl = uploadData.url;
      }

      const payload = {
        title,
        type,
        content_url: type === 'Тест' ? `/test/${testId}` : uploadedUrl,
        description,
        ...(type === 'Тест' && testId ? { test_id: Number(testId) } : {}),
      };

      await apiRequest(`${API_URL}/lessons/add/subjects/${subjectId}`, {
        method: 'POST',
        data: payload,
        token,
      });

      onLessonAdded();
      onClose();
    } catch (err) {
        if (err?.response?.status === 409) {
          setError(err.response.data.detail || 'Тест уже используется в другом уроке');
        } else {
          handleError(err, setError);
        }
    }
  };

  const handleOpenTestEditor = () => {
    if (testId) {
      navigate(`/test/edit/${testId}`);
    }};

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <h2>Добавление урока</h2>

        <input
          type="text"
          placeholder="Название урока"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Описание задания для студентов"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Лекция">Лекция</option>
          <option value="Практика">Практика</option>
          <option value="Тест">Тест</option>
        </select>

        {type === 'Тест' ? (
          <>
            <select
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              className="test-select"
            >
              <option value="">Выберите тест</option>
              {availableTests.map((test) => (
                <option key={test.id} value={test.id}>
                  {test.title}
                </option>
              ))}
            </select>

            {testConflict && (
              <p className="warning-text">
                Тест уже привязан к другому уроку. Он будет перепривязан.
              </p>
            )}

            {testId ? (
              <button className="add-lesson-btn" onClick={handleOpenTestEditor}>
                Редактировать тест
              </button>
            ) : (
              <button
                className="add-lesson-btn"
                onClick={() => {
                  const url = `/test/create`;
                  window.open(url, '_blank');
                }}
              >
                + Новый тест
              </button>
            )}
          </>
        ) : (
          <>
            <label className="upload-toggle">
              <input
                type="checkbox"
                checked={useUpload}
                onChange={() => {
                  setUseUpload(!useUpload);
                  setUploadFile(null);
                  setContentUrl('');
                }}
              />
              {' '}Загрузить файл вместо ссылки
            </label>

            {useUpload ? (
              <input
                type="file"
                accept=".pdf,.doc,.docx,.pptx,.zip"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            ) : (
              <input
                type="text"
                placeholder="Ссылка на видео или документ"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
              />
            )}
          </>
        )}

        {error && <p className="error-message">{error}</p>}

        <button className="add-lesson-btn" onClick={handleAddLesson}>
          Добавить урок
        </button>
      </div>
    </div>
  );
};

export default LessonModal;
