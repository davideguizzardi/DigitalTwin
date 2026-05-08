import { api } from './api.js';

export const healthService = {
  /** GET /health/ */
  check: () => api.get('/health/'),

  /** GET /health/consumption */
  checkConsumption: () => api.get('/health/consumption'),
};
