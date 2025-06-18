export async function apiRequest(
  url,
  { method = 'GET', data, token, headers = {}, silent = false } = {}
) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    ...(data && { body: JSON.stringify(data) }),
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const err = new Error(errorData?.detail || 'Ошибка при запросе');
    err.status = response.status;
    err.response = { data: errorData };
    throw err;
  }

  if (response.status === 204) return null;
  return await response.json();
}
