import { api } from './api.js';

export const deviceService = {
  /** GET /device  — getOnlyNames: ritorna solo i nomi */
  getAll: (getOnlyNames = false) =>
    api.get('/device', getOnlyNames ? { get_only_names: true } : undefined),

  /** GET /device/{device_id} */
  getById: (deviceId) => api.get(`/device/${deviceId}`),

  /** GET /device/usage/single/{device_id} */
  getUsage: (deviceId) => api.get(`/device/usage/single/${deviceId}`),

  /** GET /device/usage/all */
  getAllUsage: () => api.get('/device/usage/all'),
};
