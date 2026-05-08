import { api } from './api.js';

export const deviceConfigService = {
  /** GET /device_configuration */
  getAll: () => api.get('/device_configuration'),

  /**
   * PUT /device_configuration
   * @param {Array<{device_id, name, category, show?}>} devices
   */
  addDevices: (devices) => api.put('/device_configuration', { data: devices }),

  /** GET /device_configuration/{device_id} */
  getById: (deviceId) => api.get(`/device_configuration/${deviceId}`),
};
