export function handleError(err, setMessage) {
  if (err.message === 'Failed to fetch') {
    setMessage('Сервер временно недоступен. Проверьте подключение.');
  } else if (err.response) {
    // если fetch заменён на axios и есть err.response
    setMessage(err.response.data?.detail || 'Произошла ошибка при обработке запроса.');
  } else {
    setMessage('Что-то пошло не так. Попробуйте позже.');
  }
}
