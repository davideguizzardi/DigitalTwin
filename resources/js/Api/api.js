const API_BASE_URL = import.meta.env.VITE_DT_API_URL ?? 'http://192.168.1.118:8000';

// ---------- Token storage ----------
export const tokenStorage = {
  get: () => localStorage.getItem('dt_access_token'),
  set: (token) => localStorage.setItem('dt_access_token', token),
  clear: () => localStorage.removeItem('dt_access_token'),
};

// ---------- Core fetch ----------
export async function apiFetch(path, options = {}) {
  const token = tokenStorage.get();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    tokenStorage.clear();
    window.dispatchEvent(new Event('dt:unauthorized'));
    throw { status: 401, message: 'Unauthorized' };
  }

  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw { status: response.status, message: response.statusText, detail };
  }

  // 204 No Content o body vuoto
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Helpers per i metodi HTTP più comuni
export const api = {
  get: (path, params) => {
    const url = params ? `${path}?${new URLSearchParams(params)}` : path;
    return apiFetch(url, { method: 'GET' });
  },
  post: (path, body) => apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => apiFetch(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => apiFetch(path, { method: 'DELETE' }),
};
