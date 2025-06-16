export async function apiRequest(url, { method = 'GET', data, token, headers = {}, silent = false } = {}) {
  try {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers
      },
      ...(data && { body: JSON.stringify(data) })
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || 'Ошибка при запросе');
    }

    if (response.status === 204) return null; // No Content
    return await response.json();
  } catch (err) {
    if (!silent) {
      if (err.message === 'Failed to fetch') {
        alert('Сервер недоступен. Проверьте подключение.');
      } else {
        alert(err.message || 'Произошла ошибка запроса.');
      }
    }
    throw err;
  }
}
