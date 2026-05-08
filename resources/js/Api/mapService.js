import { api } from './api.js';

export const mapConfigurationService = {

  /** GET /map_file */
  getAllFiles: () => api.get('/map_file'),

  /** GET /map_configuration */
  getAllConfigurations: () => api.get('/map_configuration'),

  /**
   * PUT /map_configuration
   * @param {Array<{entity_id: string, x: number, y: number, floor: number}>} entities
   */
  addEntities: (entities) => api.put('/map_configuration', { data: entities }),

  /** GET /map_configuration/{entity_id} */
  getByEntity: (entityId) => api.get(`/map_configuration/${entityId}`),

  /** DELETE /map_configuration/floor/{floor} */
  deleteFloor: (floor) => api.delete(`/map_configuration/floor/${floor}`),

  /** DELETE /map_configuration/entity/{entity_id} */
  deleteEntity: (entityId) => api.delete(`/map_configuration/entity/${entityId}`),
};


