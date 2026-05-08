import { api } from './api.js';

export const simulationService = {
  /** GET /Simulation/device/{device_id} */
  getByDevice: (deviceId) => api.get(`/Simulation/device/${deviceId}`),

  /** GET /Simulation/house/{house_id} */
  getByHouse: (houseId) => api.get(`/Simulation/house/${houseId}`),

  /**GET /Simulation/resample/{device_id} */
  resampleDeviceMode: (deviceId, mode, new_duration) => api.get(`/Simulation/resample/${deviceId}?mode=${mode}&new_length=${new_duration}`),
};
