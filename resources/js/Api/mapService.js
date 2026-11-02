import { api,apiUpload } from './api.js';

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

export const mapFileService = {
    /** GET /map_file */
    getAll: () => api.get('/map_file'),

    /** GET /map_file/{id} */
    getById: (id) => api.get(`/map_file/${id}`),

    /**
     * POST /map_file/upload
     * @param {Array<{floor: string|number, file: File}>} listMap
     */
    upload: (listMap) => {
        const formData = new FormData();
        listMap.forEach((el) => {
            formData.append('files', el.file);
            formData.append('floors', el.floor);
        });
        return apiUpload('/map_file/upload', formData);
    },

    /** DELETE /map_file/{id} */
    deleteById: (id) => api.delete(`/map_file/${id}`),
};
