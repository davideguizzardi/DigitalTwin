import { api, tokenStorage } from './api.js';

export const authService = {
  /**
   * POST /auth/login
   * Effettua il login e salva automaticamente il token.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{access_token: string, token_type: string}>}
   */
  login: async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    tokenStorage.set(data.access_token);
    return data;
  },

  /**
   * POST /auth/register
   * @param {{username: string, email: string, password: string, use_sqlite?: boolean}} payload
   */
  register: (payload) => api.post('/auth/register', payload),

  /**
   * GET /auth/me
   * @returns {Promise<{user_id: number, email: string}>}
   */
  me: () => api.get('/auth/me'),

  /**
   * POST /auth/refresh
   * Rinnova il token e lo aggiorna in storage.
   */
  refresh: async () => {
    const data = await api.post('/auth/refresh');
    tokenStorage.set(data.access_token);
    return data;
  },

  /** Rimuove il token in locale (logout lato client). */
  logout: () => tokenStorage.clear(),
};
