/**
 * SmartHire AI — Application Logic (real backend integration)
 */
(function () {
  'use strict';

  const state = {
    profile: {
      skills: [],
      score: null,
      strengths: [],
      recommendedRoles: [],
      targetRole: 'AI Engineer',
      skillGaps: null,
      filename: null,
    },
  };

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function setLoading(el, loading, text) {
    if (!el) return;
    el.disabled = loading;
    if (loading) {
      el.dataset.originalText = el.textContent;
      el.textContent = text || 'Processing...';
      el.classList.add('loading');
    } else {
      el.textContent = el.dataset.originalText || el.textContent;
      el.classList.remove('loading');
    }
  }

  function saveProfile(data) {
    state.profile.skills = data.skills || [];
    state.profile.score = data.score;
    state.profile.strengths = data.strengths || [];
    state.profile.recommendedRoles = data.recommended_roles || [];
    state.profile.skillGaps = data.skill_gaps;
    state.profile.filename = data.filename;
    if (data.recommended_roles && data.recommended_roles[0]) {
      state.profile.targetRole = data.recommended_roles[0].role;
    }
    try {
      sessionStorage.setItem('smarthire_profile', JSON.stringify(state.profile));
    } catch (_) {}
  }

  function loadProfile() {
    try {
      const saved = sessionStorage.getItem('smarthire_profile');
      if (saved) Object.assign(state.profile, JSON.parse(saved));
    } catch (_) {}
  }

  loadProfile();

  // ---- Resume Analysis UI ----
  function renderAnalysis(data) {
    const preview = document.querySelector('.analysis-preview');
    if (!preview) return;

    preview.querySelector('.analysis-badge').textContent = 'Live';
    preview.querySelector('.mini-score-value').textContent = Math.round(data.score);
    preview.querySelector('.analysis-score > span:last-child').textContent = 'Resume Score';

    const skillsEl = preview.querySelector('.analysis-block:nth-of-type(1) .skill-tags');
    skillsEl.innerHTML = data.skills.length
      ? data.skills.map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')
      : '<span class="text-muted">No skills detected — add technical keywords</span>';

    const strengthsEl = preview.querySelector('.strength-tags');
    strengthsEl.innerHTML = data.strengths.map(s =>
      `<span class="strength-tag">${escapeHtml(s)}</span>`
    ).join('');

    const rolesEl = preview.querySelector('.role-list');
    rolesEl.innerHTML = data.recommended_roles.map(r =>
      `<li><span class="role-dot"></span>${escapeHtml(r.role)} (${r.match_percent}%)</li>`
    ).join('');

    const atsFill = preview.querySelector('.ats-fill');
    const atsLabel = preview.querySelector('.ats-label');
    atsFill.style.width = data.ats_score + '%';
    atsFill.className = 'ats-fill ' + (data.ats_score >= 65 ? 'good' : 'fair');
    atsLabel.textContent = data.ats_label;
    atsLabel.className = 'ats-label ' + (data.ats_score >= 65 ? 'good' : 'fair');

    renderDashboard(data);
    renderJobs(data.job_matches || []);
    if (data.skill_gaps) renderSkillGap(data.skill_gaps);
    updateHeroPreview(data);
  }

  function updateHeroPreview(data) {
    const hero = document.querySelector('.dashboard-preview');
    if (!hero || !data) return;
    hero.querySelector('.score-value').textContent = Math.round(data.score);
    const scoreFill = hero.querySelector('.score-fill');
    if (scoreFill) scoreFill.style.setProperty('--score', Math.round(data.score));

    const tags = hero.querySelector('.skill-tags');
    tags.innerHTML = data.skills.slice(0, 5).map(s =>
      `<span class="skill-tag">${escapeHtml(s)}</span>`
    ).join('');

    const roles = hero.querySelector('.role-list');
    roles.innerHTML = data.recommended_roles.slice(0, 3).map(r =>
      `<li><span class="role-dot"></span>${escapeHtml(r.role)}</li>`
    ).join('');

    const topMatch = data.recommended_roles[0]?.match_percent || data.job_matches?.[0]?.match_percent || 0;
    hero.querySelector('.match-fill').style.width = topMatch + '%';
    hero.querySelector('.match-value').textContent = Math.round(topMatch) + '%';
  }

  function renderDashboard(data) {
    const dash = document.querySelector('.career-dashboard');
    if (!dash) return;

    const stats = dash.querySelectorAll('.stat-value');
    if (stats[0]) stats[0].textContent = Math.round(data.score) + '%';
    if (stats[1]) stats[1].textContent = data.skills.length;
    if (stats[2]) stats[2].textContent = (data.job_matches || []).length;
    if (stats[3]) stats[3].textContent = (data.skill_gaps?.skills || []).filter(s => s.status === 'missing').length;

    dash.querySelector('.stat-bar .stat-fill').style.width = data.score + '%';

    const roleCards = dash.querySelector('.role-cards');
    roleCards.innerHTML = data.recommended_roles.slice(0, 3).map(r =>
      `<div class="role-card"><span class="role-name">${escapeHtml(r.role)}</span>
       <div class="role-match"><div class="role-match-fill" style="width:${r.match_percent}%"></div></div></div>`
    ).join('');

    const activity = dash.querySelector('.activity-list');
    const now = new Date();
    activity.innerHTML = `
      <li><span class="activity-dot"></span>Resume analyzed <time>just now</time></li>
      <li><span class="activity-dot"></span>${data.skills.length} skills identified <time>just now</time></li>
      <li><span class="activity-dot"></span>${(data.job_matches || []).length} jobs matched <time>just now</time></li>
    `;

    const chartBars = dash.querySelectorAll('.chart-bar-item');
    const categories = categorizeSkills(data.skills);
    const values = [categories.technical, categories.soft, categories.tools, categories.domain];
    chartBars.forEach((item, i) => {
      item.querySelector('.chart-bar div').style.width = values[i] + '%';
    });
  }

  function categorizeSkills(skills) {
    const lower = skills.map(s => s.toLowerCase());
    const tech = ['python', 'java', 'javascript', 'react', 'sql', 'machine learning', 'deep learning'];
    const soft = ['communication', 'leadership', 'teamwork', 'problem solving'];
    const tools = ['git', 'docker', 'aws', 'tableau', 'power bi', 'excel'];
    const count = (list) => Math.min(95, Math.round((lower.filter(s => list.some(t => s.includes(t))).length / Math.max(list.length, 1)) * 100 + 20));
    return {
      technical: count(tech) || 30,
      soft: count(soft) || 25,
      tools: count(tools) || 35,
      domain: Math.min(90, skills.length * 8) || 20,
    };
  }

  function renderJobs(jobs) {
    const grid = document.querySelector('.jobs-grid');
    if (!grid) return;

    if (!jobs.length) {
      grid.innerHTML = '<p class="text-muted" style="grid-column:1/-1;text-align:center;padding:32px;">No jobs found. Upload your resume to get personalized matches.</p>';
      return;
    }

    grid.innerHTML = jobs.slice(0, 9).map(job => `
      <article class="job-card glass-card fade-in visible">
        <div class="job-header">
          <h3>${escapeHtml(job.title)}</h3>
          <span class="match-badge ${job.match_percent >= 90 ? 'high' : ''}">${job.match_percent}% Match</span>
        </div>
        <p class="job-company text-muted">${escapeHtml(job.company)} · ${escapeHtml(job.location)}</p>
        <div class="skill-tags">${job.skills.map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}</div>
        <div class="job-actions">
          <button class="btn btn-primary btn-sm" data-job-id="${job.id}">View Job</button>
          <button class="btn btn-outline btn-sm save-job-btn">Save Job</button>
        </div>
      </article>
    `).join('');

    grid.querySelectorAll('[data-job-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const job = jobs.find(j => j.id === parseInt(btn.dataset.jobId, 10));
        if (job) alert(`${job.title} at ${job.company}\n\n${job.description || 'Great opportunity matching your profile!'}`);
      });
    });

    grid.querySelectorAll('.save-job-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const saved = this.classList.toggle('saved');
        this.textContent = saved ? 'Saved ✓' : 'Save Job';
      });
    });
  }

  function renderSkillGap(gap) {
    const section = document.querySelector('#skill-gap');
    if (!section || !gap) return;

    const title = section.querySelector('#targetRoleTitle') || section.querySelector('.target-role h3');
    if (title) title.textContent = gap.target_role;
    const select = document.getElementById('targetRoleSelect');
    if (select) select.value = gap.target_role;

    const checklist = section.querySelector('.skill-checklist');
    checklist.innerHTML = gap.skills.map(s => {
      const cls = s.status === 'have' ? 'skill-have' : s.status === 'partial' ? 'skill-partial' : 'skill-missing';
      const icon = s.status === 'have' ? '✓' : s.status === 'partial' ? '⚠' : '✕';
      return `<li class="${cls}"><span class="check">${icon}</span> ${escapeHtml(s.name)}</li>`;
    }).join('');

    section.querySelector('.gap-fill').style.width = gap.readiness_percent + '%';
    section.querySelector('.gap-percent').textContent = gap.readiness_percent + '%';

    const steps = section.querySelector('.learning-steps');
    steps.innerHTML = gap.learning_path.map(item => {
      const cls = item.status;
      return `<li class="${cls}">
        <span class="step-indicator">${item.step}</span>
        <div><strong>${escapeHtml(item.title)}</strong>
        <div class="step-bar"><div style="width:${item.progress}%"></div></div></div>
      </li>`;
    }).join('');
  }

  async function analyzeResumeFile(file, analyzeBtn) {
    if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
      showUploadFeedback('Please upload a PDF resume only.', 'error');
      return;
    }
    setLoading(analyzeBtn, true, 'Reading PDF...');
    showUploadFeedback('Reading your PDF (OCR may take 15–40 seconds)...', 'success');
    try {
      const data = await SmartHireAPI.analyzeResume(file);
      saveProfile(data);
      renderAnalysis(data);
      showUploadFeedback('Analysis complete for ' + file.name, 'success');
      document.querySelector('#dashboard')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      showUploadFeedback(err.message || 'Analysis failed', 'error');
    } finally {
      setLoading(analyzeBtn, false);
    }
  }

  function showUploadFeedback(message, type) {
    const uploadZone = document.getElementById('uploadZone');
    if (!uploadZone) return;
    let feedback = uploadZone.querySelector('.upload-feedback');
    if (!feedback) {
      feedback = document.createElement('p');
      feedback.className = 'upload-feedback';
      feedback.style.marginTop = '16px';
      feedback.style.fontSize = '0.875rem';
      uploadZone.appendChild(feedback);
    }
    feedback.textContent = message;
    feedback.style.color = type === 'error' ? '#EF4444' : '#22C55E';
  }

  // ---- Init handlers ----
  const uploadZone = document.getElementById('uploadZone');
  const resumeInput = document.getElementById('resumeInput');
  const analyzeBtn = document.getElementById('analyzeBtn');

  if (uploadZone && resumeInput) {
    uploadZone.addEventListener('click', (e) => {
      if (e.target === analyzeBtn || e.target.tagName === 'BUTTON') return;
      resumeInput.click();
    });

    analyzeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (resumeInput.files.length) {
        analyzeResumeFile(resumeInput.files[0], analyzeBtn);
      } else {
        resumeInput.click();
      }
    });

    uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      if (e.dataTransfer.files.length) analyzeResumeFile(e.dataTransfer.files[0], analyzeBtn);
    });

    resumeInput.addEventListener('change', () => {
      if (resumeInput.files.length) analyzeResumeFile(resumeInput.files[0], analyzeBtn);
    });
  }

  // Job filters
  async function refreshJobs() {
    const filters = {
      role: document.getElementById('filterRole')?.value || '',
      location: document.getElementById('filterLocation')?.value || '',
      experience: document.getElementById('filterExperience')?.value || '',
      remote: document.getElementById('filterRemote')?.value || '',
      skills: document.getElementById('filterSkills')?.value || '',
    };
    try {
      const jobs = await SmartHireAPI.getJobs(filters, state.profile.skills);
      renderJobs(jobs);
    } catch (_) {}
  }

  document.querySelectorAll('.job-filters select').forEach(sel => {
    sel.addEventListener('change', refreshJobs);
  });

  // Skill gap role selector
  async function refreshSkillGap(role) {
    try {
      const gap = await SmartHireAPI.getSkillGap(role, state.profile.skills);
      state.profile.targetRole = role;
      renderSkillGap(gap);
    } catch (_) {}
  }

  // AI Mentor
  const chatInput = document.querySelector('.chat-input-area input');
  const chatSendBtn = document.querySelector('.chat-input-area .btn');
  const messagesContainer = document.querySelector('.chat-messages');

  async function sendChatMessage() {
    const message = chatInput?.value.trim();
    if (!message || !messagesContainer) return;

    messagesContainer.innerHTML += `<div class="message user"><p>${escapeHtml(message)}</p></div>`;
    chatInput.value = '';
    setLoading(chatSendBtn, true, '...');

    try {
      const res = await SmartHireAPI.askMentor(message, {
        skills: state.profile.skills,
        targetRole: state.profile.targetRole,
        resumeScore: state.profile.score,
      });
      messagesContainer.innerHTML += `<div class="message ai"><p>${escapeHtml(res.reply)}</p></div>`;
    } catch (err) {
      messagesContainer.innerHTML += `<div class="message ai"><p>Sorry, I couldn't respond right now. ${escapeHtml(err.message)}</p></div>`;
    } finally {
      setLoading(chatSendBtn, false);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  chatSendBtn?.addEventListener('click', sendChatMessage);
  chatInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChatMessage(); });

  // Load jobs and skill gap on startup
  refreshJobs();
  refreshSkillGap(state.profile.targetRole || 'AI Engineer');

  // API status indicator
  SmartHireAPI.health().then(h => {
    const badge = document.querySelector('.analysis-badge');
    if (badge && h.status === 'ok') {
      console.log('SmartHire AI backend connected', h.ai_enabled ? '(AI enabled)' : '(rule-based mode)');
    }
  }).catch(() => {
    const tip = (window.location.hostname.includes('github.io'))
      ? 'Connecting to cloud API… wait ~30s (Render free tier wakes up slowly), then refresh.'
      : 'Backend offline — run start.bat, then open http://localhost:8000';
    showUploadFeedback(tip, 'error');
  });

  // Expose for debugging
  window.SmartHireState = state;
  window.refreshSkillGap = refreshSkillGap;
})();
