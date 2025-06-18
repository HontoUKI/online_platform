import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../sections/Header';
import LoadingFallback from '../components/LoadingFallback';
import ErrorFallback from '../components/ErrorFallback';
import { apiRequest } from '../utils/apiRequest';
import { handleError } from '../utils/handleError';
import '../assets/TestPage.css';
import '../assets/style.css';

const TestPage = ({ setToast }) => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;
  const session = JSON.parse(localStorage.getItem('session'));
  const token = session?.access_token;

  useEffect(() => {
    (async () => {
      try {
        const data = await apiRequest(`${API_URL}/tests/${testId}`, { token });
        if (!data.questions?.length) throw new Error('Тест не содержит вопросов.');
        if (data.result) {
          setToast({
            message: 'Вы уже проходили этот тест.',
            type: 'info',
          });
          navigate(`/lesson/${data.lesson_id}`, { replace: true });
          return;
        }
        setTest(data);
      } catch (err) {
        handleError(err, setToast);
        setError('Ошибка загрузки теста или доступ запрещён.');
      } finally {
        setLoading(false);
      }
    })();
  }, [testId, token, API_URL, setToast, navigate]);

  const handleAnswerChange = (questionId, selectedIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedIndex }));
  };

  const confirmSubmit = () => {
    const unanswered = test.questions.filter((q) => !(q.id in answers)).length;

    if (Object.keys(answers).length === 0) {
      setToast({ message: 'Вы не выбрали ни одного ответа!', type: 'warning' });
      return;
    }

    if (unanswered > 0) {
      setToast({
        message: `Вы не ответили на ${unanswered} вопрос(ов). Всё равно завершить?`,
        type: 'warning',
        actionText: 'Завершить',
        onAction: handleSubmit,
      });
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = {
        test_id: test.id,
        answers: Object.entries(answers).map(([qid, index]) => ({
          question_id: Number(qid),
          selected_index: index,
        })),
      };

      const result = await apiRequest(`${API_URL}/tests/submit`, {
        method: 'POST',
        data: payload,
        token,
      });

      setToast({ message: 'Тест успешно завершён!', type: 'success' });
      navigate(`/lesson/${result.lesson_id}?score=true`);
    } catch (err) {
      handleError(err, setToast);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingFallback message="Загружаем тест..." />;
  if (error || !test) return <ErrorFallback message={error || 'Тест не найден или недоступен.'} />;

  const currentQuestion = test.questions[currentIndex];

  return (
    <div className="app full-center">
      <main className="main-section full-center">
        <div className="test-page">
          <Header />
          <div className="test-header">
            <div>Тестирование №{test.id}</div>
            <div>{test.title}</div>
          </div>

          <div className="question-nav">
            {test.questions.map((q, index) => {
              const answered = answers[q.id] !== undefined;
              const isCurrent = index === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`nav-button ${isCurrent ? 'current' : answered ? 'answered' : 'unanswered'}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <div className="question-box">
            <div className="question-text">{currentQuestion.question_text}</div>
            <div className="options">
              {currentQuestion.options.map((option, idx) => (
                <label key={idx} className="option-item">
                  <input
                    className="point"
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={idx}
                    checked={answers[currentQuestion.id] === idx}
                    onChange={() => handleAnswerChange(currentQuestion.id, idx)}
                  />
                  <span>{option.option_text}</span>
                </label>
              ))}
            </div>

            <div className="button-row">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="nav-action"
              >
                Назад
              </button>
              {currentIndex < test.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="nav-action"
                >
                  Далее
                </button>
              ) : (
                <button
                  onClick={confirmSubmit}
                  disabled={submitting}
                  className="submit-button"
                >
                  Завершить тест
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestPage;
