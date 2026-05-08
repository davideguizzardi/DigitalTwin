import { api } from './api.js';

export const calendarService = {
  /** GET /calendar — tutti gli slot */
  getAll: () => api.get('/calendar'),

  /**
   * PUT /calendar
   * @param {number[][]} calendarData  - matrice di slot energetici
   */
  set: (calendarData) => api.put('/calendar', { data: calendarData }),

  /** DELETE /calendar — svuota tutti gli slot */
  clear: () => api.delete('/calendar'),

  /**
   * GET /calendar/{day}
   * @param {string} day
   * @param {string} entityId
   * @param {*} responseModel  - opzionale
   */
  getByDay: (day, entityId, responseModel = undefined) => {
    const params = { entity_id: entityId };
    if (responseModel !== undefined) params.response_model = responseModel;
    return api.get(`/calendar/${day}`, params);
  },
};
