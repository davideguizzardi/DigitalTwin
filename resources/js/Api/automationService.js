import { api } from './api.js';

export const automationService = {
  /**
   * GET /automation
   * @param {boolean} getSuggestions - include suggerimenti
   */
  getAll: (getSuggestions = false) =>
    api.get('/automation', getSuggestions ? { get_suggestions: true } : undefined),

  /**
   * POST /automation
   * @param {*} automation - oggetto automation (struttura libera)
   */
  add: (automation) => api.post('/automation', { automation }),

  /**
   * DELETE /automation/{automation_id}
   */
  remove: (automationId) => api.delete(`/automation/${automationId}`),

  /** GET /automation/matrix */
  getStateMatrix: () => api.get('/automation/matrix'),

  /**
   * POST /automation/simulate
   * @param {*} automation
   * @param {boolean} returnStateMatrix
   */
  simulate: (automation, returnStateMatrix = false) => {
    const path = returnStateMatrix
      ? '/automation/simulate?return_state_matrix=true'
      : '/automation/simulate?return_state_matrix=false';
    return api.post(path, { automation });
  },

  // --- Rulebot ---

  /**
   * PUT /rulebot/automation/state
   * @param {string} automationId
   * @param {string} state
   */
  updateState: (automationId, state) =>
    api.put('/rulebot/automation/state', { automation_id: automationId, state }),
};
