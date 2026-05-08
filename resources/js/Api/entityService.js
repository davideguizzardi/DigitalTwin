import { api } from './api.js';

export const entityService = {
  /** GET /entity  — skip_services: omette le entità di tipo service */
  getAll: (skipServices = false) =>
    api.get('/entity', skipServices ? { skip_services: true } : undefined),

  /** GET /entity/{entity_id} */
  getById: (entityId) => api.get(`/entity/${entityId}`),

  /** GET /entity/services/{entity_id} */
  getServices: (entityId) => api.get(`/entity/services/${entityId}`),
};
