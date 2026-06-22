// Единая точка работы с пользовательской сессией в localStorage.
// Раньше JSON.parse(localStorage.getItem('session')) и чтение access_token были
// разбросаны по ~20 компонентам; теперь это инкапсулировано здесь.

const SESSION_KEY = 'session';

// Возвращает разобранный объект сессии или null (безопасно к битому JSON).
export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

// Токен доступа из сессии или null.
export function getToken() {
  return getSession()?.access_token ?? null;
}

// Сохраняет объект сессии.
export function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// Обновляет часть сессии, сохраняя остальные поля.
export function updateSession(patch) {
  setSession({ ...(getSession() || {}), ...patch });
}

// Удаляет сессию (выход / истёкший токен).
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// Сессия валидна, если есть токен и срок (expires_at) ещё не истёк.
export function isSessionValid(session = getSession()) {
  if (!session?.access_token) return false;
  return !session.expires_at || Date.now() <= session.expires_at;
}
