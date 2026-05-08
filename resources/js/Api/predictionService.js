import { api } from './api.js';

export const predictionService = {
  /** GET /prediction/sequential */
  getSequential: () => api.get('/prediction/sequential'),

  /** GET /prediction/power */
  getPower: () => api.get('/prediction/power'),

  /**
   * GET /prediction/power/{device_id}/{service}
   * @param {string} deviceId
   * @param {string} service
   */
  getPowerForService: (deviceId, service) =>
    api.get(`/prediction/power/${deviceId}/${service}`),

  /** GET /prediction/recursive/cache */
  getCachedRecursive: () => api.get('/prediction/recursive/cache'),

  /** GET /prediction/recursive */
  getRecursive: () => api.get('/prediction/recursive'),
};
