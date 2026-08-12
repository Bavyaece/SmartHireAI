/**
 * SmartHire AI — API Client
 */
(function (global) {
  'use strict';

  const API_BASE = global.SMART_HIRE_API_URL ||
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8000'
      : window.location.origin);

  async function request(path, options = {}) {
    const url = API_BASE + path;
    const response = await fetch(url, options);
    if (!response.ok) {
      let detail = 'Request failed';
      try {
        const err = await response.json();
        detail = err.detail || err.message || detail;
      } catch (_) {}
      throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    }
    return response.json();
  }

  global.SmartHireAPI = {
    baseUrl: API_BASE,

    health: () => request('/api/health'),

    analyzeResume: async (file) => {
      const form = new FormData();
      form.append('file', file);
      return request('/api/analyze-resume', { method: 'POST', body: form });
    },

    getJobs: (filters = {}, userSkills = []) => {
      const params = new URLSearchParams();
      if (filters.role && filters.role !== 'All Roles') params.set('role', filters.role);
      if (filters.location && filters.location !== 'All Locations') params.set('location', filters.location);
      if (filters.experience && filters.experience !== 'All Levels') params.set('experience', filters.experience);
      if (filters.remote && filters.remote !== 'Any') params.set('remote', filters.remote);
      if (filters.skills && filters.skills !== 'All Skills') params.set('skills', filters.skills);
      if (userSkills.length) params.set('user_skills', userSkills.join(','));
      const qs = params.toString();
      return request('/api/jobs' + (qs ? '?' + qs : ''));
    },

    getSkillGap: (targetRole, skills) =>
      request('/api/skill-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_role: targetRole, skills }),
      }),

    getRoles: () => request('/api/roles'),

    askMentor: (message, context = {}) =>
      request('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          skills: context.skills || [],
          target_role: context.targetRole || null,
          resume_score: context.resumeScore || null,
        }),
      }),
  };
})(window);
