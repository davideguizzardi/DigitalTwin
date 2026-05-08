import { api } from './api.js';

export const configurationService = {
  /** GET /configuration/initialize */
  initialize: () => api.get('/configuration/initialize'),

  /** GET /configuration */
  getAll: () => api.get('/configuration'),

  /**
   * PUT /configuration
   * @param {Array<{key: string, value: string, unit?: string}>} values
   */
  addValues: (values) => api.put('/configuration', { data: values }),

  /** GET /configuration/{key} */
  getByKey: (key) => api.get(`/configuration/${key}`),

  /** DELETE /configuration/{key} */
  deleteByKey: (key) => api.delete(`/configuration/${key}`),

  /**
   * PUT /configuration/energy/calendar
   * @param {number[][]} calendarData  - matrice di slot energetici
   */
  addEnergyCalendar: (calendarData) =>
    api.put('/configuration/energy/calendar', { data: calendarData }),
};

export const homeAssistantService = {
  /** GET /homeassistant */
  getConfig: () => api.get('/homeassistant'),

  /**
   * PUT /homeassistant
   * @param {string|null} token
   * @param {string|null} serverUrl
   */
  setConfig: (token, serverUrl) =>
    api.put('/homeassistant', { token, server_url: serverUrl }),
};
