import { api } from './api.js';

export const serviceService = {
  /**
   * POST /service  — invia un comando a un'entità
   * @param {string} entityId
   * @param {string} service       - es. 'turn_on', 'turn_off'
   * @param {object|null} data     - parametri aggiuntivi del servizio
   * @param {string|null} user
   */
  call: (entityId, service, data = null, user = null) =>
    api.post('/service', { entity_id: entityId, service, data, user }),

  /** GET /service/logs */
  getLogs: () => api.get('/service/logs'),

  /**
   * PUT /service/logs
   * @param {Array<{user, service, target, payload, timestamp}>} logs
   */
  addLogs: (logs) => api.put('/service/logs', { data: logs }),

  /** GET /service/logs/{user} */
  getLogsByUser: (user) => api.get(`/service/logs/${user}`),
};
