import { api } from './api.js';

export const roomService = {
  /** GET /room */
  getAll: () => api.get('/room'),

  /**
   * PUT /room
   * @param {Array<{name: string, floor: number, points?: string}>} rooms
   */
  addRooms: (rooms) => api.put('/room', { data: rooms }),

  /** GET /room/{floor} */
  getByFloor: (floor) => api.get(`/room/${floor}`),

  /**
   * PATCH /room/{room_name}
   * @param {string} roomName
   * @param {string} newName
   */
  rename: (roomName, newName) =>
    api.patch(`/room/${roomName}`, { new_name: newName }),

  /** DELETE /room/{name} */
  remove: (name) => api.delete(`/room/${name}`),
};
