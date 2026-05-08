import { api } from './api.js';

export const historyService = {
  /**
   * GET /history/daily
   * @param {string} entities         - lista entità separata da virgole
   * @param {string} startTimestamp   - ISO datetime, es. "2025-01-01T00:00:00"
   * @param {string|null} endTimestamp
   */
  getDaily: (entities, startTimestamp, endTimestamp = null) => {
    const params = { entities, start_timestamp: startTimestamp };
    if (endTimestamp) params.end_timestamp = endTimestamp;
    return api.get('/history/daily', params);
  },

  /**
   * GET /history/device/{device_id}
   * @param {string} deviceId
   * @param {string} startTimestamp
   * @param {string|null} endTimestamp
   */
  getByDevice: (deviceId, startTimestamp, endTimestamp = null) => {
    const params = { start_timestamp: startTimestamp };
    if (endTimestamp) params.end_timestamp = endTimestamp;
    return api.get(`/history/device/${deviceId}`, params);
  },
};
