/**
 * SmartHire AI — API Client
 */
(function (global) {
  'use strict';

  // Local → :8000 | GitHub Pages → Render | Vercel / other → same origin
  const API_BASE = global.SMART_HIRE_API_URL || (function () {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:8000';
    if (host.includes('github.io')) return 'https://smarthire-ai.onrender.com';
    // Vercel deployment uses same-origin /api serverless functions
    return window.location.origin;
  })();

  async function request(path, options = {}) {
    const url = API_BASE + path;
    const controller = new AbortController();
    const timeoutMs = options.timeoutMs || 120000;
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      if (!response.ok) {
        let detail = 'Request failed';
        try {
          const err = await response.json();
          detail = err.detail || err.message || detail;
        } catch (_) {}
        throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
      }
      return response.json();
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('PDF analysis timed out. Please try again with a clearer PDF.');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  global.SmartHireAPI = {
    baseUrl: API_BASE,

    health: () => request('/api/health'),

    analyzeResume: async (file) => {
      const form = new FormData();
      form.append('file', file);
      return request('/api/analyze-resume', { method: 'POST', body: form, timeoutMs: 180000 });
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
