import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import withSessionGuard from '../utils/withSessionGuard';
import { handleError } from '../utils/handleError';
import { apiRequest } from '../utils/apiRequest';
import '../assets/TestPage.css';

function TestCreatePage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!testId;
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const subjectId = Number(searchParams.get('subject'));
  const fallbackSubjectId = 1;

  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState('');

  const session = JSON.parse(localStorage.getItem('session'));
  const token = session?.access_token;
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!isEditMode) {
      setQuestions([
        {
          id: crypto.randomUUID(),
          question: '',
          options: ['', '', ''],
          correct_option: 0,
        },
      ]);
      return;
    }

    (async () => {
      try {
        const data = await apiRequest(`${API_URL}/tests/${testId}`, { token });
        setTitle(data.title);
        setQuestions(
          data.questions.map((q) => ({
            id: q.id,
            question: q.question_text,
            correct_option: q.correct_option_index,
            options: q.options.map((o) => o.option_text),
          }))
        );
      } catch (err) {
        handleError(err);
        navigate(-1);
      }
    })();
  }, [isEditMode, testId, token, API_URL, navigate]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        question: '',
        options: ['', '', ''],
        correct_option: 0,
      },
    ]);
  };

  const deleteQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const addOptionToQuestion = (qIdx) => {
    const updated = [...questions];
    updated[qIdx].options.push('');
    setQuestions(updated);
  };

  const deleteOption = (qIdx, optIdx) => {
    const updated = [...questions];
    updated[qIdx].options.splice(optIdx, 1);
    setQuestions(updated);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = value;
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    const cleanQuestions = questions.filter(
      (q) => q.question.trim() && q.options.some((o) => o.trim())
    );

    const payload = {
      title,
      subject_id: subjectId || fallbackSubjectId,
      lesson_id: null,
      questions: cleanQuestions.map((q) => ({
        question_text: q.question,
        correct_option_index: q.correct_option,
        options: q.options.map((opt, idx) => ({
          option_text: opt,
          option_index: idx,
        })),
      })),
    };

    const endpoint = isEditMode
      ? `${API_URL}/tests/${testId}`
      : `${API_URL}/tests/create`;

    const method = isEditMode ? 'PUT' : 'POST';

    try {
      await apiRequest(endpoint, { method, data: payload, token });
      setMessage(isEditMode ? 'Тест обновлён!' : 'Тест создан!');
      setTimeout(() => navigate(-1), 1000);
    } catch (err) {
      handleError(err, setMessage);
    }
  };

  return (
    <div className="test-page editor">
      <h2>{isEditMode ? 'Редактирование теста' : 'Создание теста'}</h2>

      {message && <p className="upload-status">{message}</p>}

      <input
        type="text"
        placeholder="Название теста"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {questions.map((q, i) => (
        <div key={q.id} className="question-editor">
          <input
            type="text"
            placeholder={`Вопрос ${i + 1}`}
            value={q.question}
            onChange={(e) => handleQuestionChange(i, 'question', e.target.value)}
          />
          {q.options.map((opt, j) => (
            <div key={j} className="option-row">
              <input
                type="text"
                placeholder={`Вариант ${j + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(i, j, e.target.value)}
              />
              <input
                type="radio"
                name={`correct-${i}`}
                checked={q.correct_option === j}
                onChange={() =>
                  handleQuestionChange(i, 'correct_option', j)
                }
              />
              <label>Верный</label>
              <button
                onClick={() => deleteOption(i, j)}
                title="Удалить вариант"
              >
                X
              </button>
            </div>
          ))}
          <button onClick={() => addOptionToQuestion(i)}>+ Добавить вариант</button>
          <button onClick={() => deleteQuestion(i)}>Удалить вопрос</button>
        </div>
      ))}

      <button onClick={addQuestion}>+ Добавить вопрос</button>
      <button onClick={handleSubmit}>Сохранить тест</button>
    </div>
  );
}

export default withSessionGuard(TestCreatePage);
