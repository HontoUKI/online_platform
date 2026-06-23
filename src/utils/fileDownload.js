// Скачивание/открытие файлов с защищённого эндпоинта /files/download,
// который теперь требует JWT. Обычная <a href> не шлёт заголовок Authorization,
// поэтому файл забираем fetch'ем с токеном и отдаём через blob URL.
import { getToken } from './session';

const isProtected = (url) => url.includes('/files/download/');

async function fetchBlobUrl(url) {
  const token = getToken();
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const err = new Error('Не удалось получить файл');
    err.status = res.status;
    err.response = { data: await res.json().catch(() => null) };
    throw err;
  }
  return URL.createObjectURL(await res.blob());
}

// Скачать файл (сохранить на диск).
export async function downloadFile(url, filename = '') {
  const blobUrl = await fetchBlobUrl(url);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}

// Открыть материал в новой вкладке. Внешние ссылки открываем напрямую,
// защищённые — через авторизованный blob.
export async function openFile(url) {
  if (!isProtected(url)) {
    window.open(url, '_blank', 'noopener');
    return;
  }
  const blobUrl = await fetchBlobUrl(url);
  window.open(blobUrl, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}
