import { api } from './api.js';

export const logService = {
  /**
   * PUT /log
   * @param {Array<{actor, event, target, payload}>} logs
   */
  add: (logs) => api.put('/log', { data: logs }),

  /** GET /log/sessions */
  getSessions: () => api.get('/log/sessions'),

  /** GET /log/sessions/{actor} */
  getSessionsByActor: (actor) => api.get(`/log/sessions/${actor}`),
};
