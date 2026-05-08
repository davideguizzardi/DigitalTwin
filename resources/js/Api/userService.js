import { api } from './api.js';

export const userService = {
  // --- Preferences ---

  getUsers: () => api.get('/user'),

  /** GET /user/preferences */
  getAllPreferences: () => api.get('/user/preferences'),

  /**
   * PUT /user/preferences
   * @param {Array<{user_id: string, preferences: string[]}>} preferences
   */
  addPreferences: (preferences) =>
    api.put('/user/preferences', { data: preferences }),

  /** GET /user/preferences/{user_id} */
  getPreferencesByUser: (userId) => api.get(`/user/preferences/${userId}`),

  // --- Privacy ---

  /** GET /user/privacy */
  getAllPrivacy: () => api.get('/user/privacy'),

  /**
   * PUT /user/privacy
   * @param {Array<{user_id: string, data_collection: boolean, data_disclosure: boolean}>} privacyList
   */
  addPrivacy: (privacyList) => api.put('/user/privacy', { data: privacyList }),

  /** GET /user/privacy/{user_id} */
  getPrivacyByUser: (userId) => api.get(`/user/privacy/${userId}`),

  /** DELETE /user/{user_id} — elimina preferenze e dati utente */
  deleteUser: (userId) => api.delete(`/user/${userId}`),
};
