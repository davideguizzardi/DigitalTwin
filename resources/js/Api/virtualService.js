import { api } from './api.js';

export const virtualService = {
  /** GET /virtual/device  — getOnlyNames: ritorna solo i nomi */
  getAllDevices: (getOnlyNames = false) =>
    api.get('/virtual/device', getOnlyNames ? { get_only_names: true } : undefined),

  /** GET /virtual/device/{home} */
  getDevicesByHome: (home) => api.get(`/virtual/device/${home}`),

  /** GET /virtual/entity */
  getAllEntities: () => api.get('/virtual/entity'),

  /** GET /virtual/entity/{entity_id} */
  getEntityById: (entityId) => api.get(`/virtual/entity/${entityId}`),

  /** GET /virtual/automation */
  getAutomationsContext: () => api.get('/virtual/automation'),
};
