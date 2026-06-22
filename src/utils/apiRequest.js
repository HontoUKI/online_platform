// Единая обёртка над fetch для всех запросов к API.
// Поддерживает JSON-тело (объект в `data`) и загрузку файлов (FormData в `data`):
// для FormData заголовок Content-Type не выставляется, чтобы браузер сам проставил
// multipart boundary.
export async function apiRequest(
  url,
  { method = 'GET', data, token, headers = {}, silent = false } = {}
) {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

  const config = {
    method,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    ...(data !== undefined && {
      body: isFormData ? data : JSON.stringify(data),
    }),
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const err = new Error(errorData?.detail || 'Ошибка при запросе');
    err.status = response.status;
    err.response = { data: errorData };
    err.silent = silent;
    throw err;
  }

  if (response.status === 204) return null;
  return await response.json();
}
