import { api } from './api.js';

export const groupService = {
  /** GET /group */
  getAll: () => api.get('/group'),

  /**
   * PUT /group
   * @param {Array<{name: string}>} groups
   */
  addGroups: (groups) => api.put('/group', { data: groups }),

  /** GET /group/{group_id} */
  getById: (groupId) => api.get(`/group/${groupId}`),

  /**
   * PATCH /group/{group_id}
   * @param {number} groupId
   * @param {string} newName
   */
  rename: (groupId, newName) =>
    api.patch(`/group/${groupId}`, { new_name: newName }),

  /** DELETE /group/{group_id} */
  remove: (groupId) => api.delete(`/group/${groupId}`),
};

export const deviceGroupService = {
  /** GET /device-group/device/{device_id} — gruppi a cui appartiene un device */
  getGroupsForDevice: (deviceId) => api.get(`/device-group/device/${deviceId}`),

  /** GET /device-group/group/{group_id} — device appartenenti a un gruppo */
  getDevicesForGroup: (groupId) => api.get(`/device-group/group/${groupId}`),

  /**
   * PUT /device-group
   * @param {Array<{device_id: string, group_id: number}>} mappings
   */
  addMappings: (mappings) => api.put('/device-group', { data: mappings }),

  /** DELETE /device-group/{device_id}/{group_id} */
  removeMapping: (deviceId, groupId) =>
    api.delete(`/device-group/${deviceId}/${groupId}`),
};
