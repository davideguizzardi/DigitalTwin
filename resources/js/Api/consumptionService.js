import { api } from './api.js';

/**
 * group: 'hourly' | 'daily' | 'weekly' | 'monthly'
 * entities/device_ids: stringa separata da virgole, es. "sensor.a,sensor.b"
 */
export const consumptionService = {
  /**
   * GET /consumption/entity
   * @param {string} entities      - lista entità separata da virgole
   * @param {string} startDate     - formato 'YYYY-MM-DD'
   * @param {string} endDate       - formato 'YYYY-MM-DD'
   * @param {string} group         - default 'hourly'
   */
  getByEntities: (entities, startDate, endDate, group = 'hourly') =>
    api.get('/consumption/entity', {
      entities,
      start_timestamp: startDate,
      end_timestamp: endDate,
      group,
    }),

  /**
   * GET /consumption/device
   * @param {string} deviceIds     - lista device_id separata da virgole
   * @param {string} startDate
   * @param {string} endDate
   * @param {string} group
   */
  getByDevices: (deviceIds, startDate, endDate, group = 'hourly') =>
    api.get('/consumption/device', {
      device_ids: deviceIds,
      start_timestamp: startDate,
      end_timestamp: endDate,
      group,
    }),

  /**
   * GET /consumption/total
   * @param {string} startDate
   * @param {string} endDate
   * @param {string} group
   */
  getTotal: (startDate, endDate, group = 'hourly') =>
    api.get('/consumption/total', {
      start_timestamp: startDate,
      end_timestamp: endDate,
      group,
    }),

  /**
   * GET /consumption/total_old  (endpoint legacy, mantenuto per compatibilità)
   */
  getTotalLegacy: (startDate, endDate, group = 'hourly', minutes = 60) =>
    api.get('/consumption/total_old', {
      start_timestamp: startDate,
      end_timestamp: endDate,
      group,
      minutes,
    }),
};
