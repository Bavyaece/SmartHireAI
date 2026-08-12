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
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
  }

  function setText(el, value) {
    if (el) el.textContent = value;
  }

  function setHtml(el, html) {
    if (el) el.innerHTML = html;
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

  function renderAnalysis(data) {
    const preview = document.querySelector('.analysis-preview');
    if (!preview || !data) return;

    setText(preview.querySelector('.analysis-badge'), 'Live');
    setText(preview.querySelector('.mini-score-value'), String(Math.round(data.score || 0)));

    const blocks = preview.querySelectorAll('.analysis-block');
    const skillsEl = blocks[0] ? blocks[0].querySelector('.skill-tags') : null;
    const skills = data.skills || [];
    setHtml(
      skillsEl,
      skills.length
        ? skills.map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')
        : '<span class="text-muted">No skills detected</span>'
    );

    const strengthsEl = preview.querySelector('.strength-tags');
    setHtml(
      strengthsEl,
      (data.strengths || []).map((s) => `<span class="strength-tag">${escapeHtml(s)}</span>`).join('')
    );

    const rolesEl = preview.querySelector('.role-list');
    setHtml(
      rolesEl,
      (data.recommended_roles || [])
        .map((r) => `<li><span class="role-dot"></span>${escapeHtml(r.role)} (${r.match_percent}%)</li>`)
        .join('')
    );

    const atsFill = preview.querySelector('.ats-fill');
    const atsLabel = preview.querySelector('.ats-label');
    if (atsFill) {
      atsFill.style.width = (data.ats_score || 0) + '%';
      atsFill.className = 'ats-fill ' + ((data.ats_score || 0) >= 65 ? 'good' : 'fair');
    }
    if (atsLabel) {
      atsLabel.textContent = data.ats_label || '';
      atsLabel.className = 'ats-label ' + ((data.ats_score || 0) >= 65 ? 'good' : 'fair');
    }

    renderDashboard(data);
    renderJobs(data.job_matches || []);
    if (data.skill_gaps) renderSkillGap(data.skill_gaps);
    updateHeroPreview(data);
  }

  function updateHeroPreview(data) {
    const hero = document.querySelector('.dashboard-preview');
    if (!hero || !data) return;

    setText(hero.querySelector('.score-value'), String(Math.round(data.score || 0)));
    const scoreFill = hero.querySelector('.score-fill');
    if (scoreFill) scoreFill.style.setProperty('--score', Math.round(data.score || 0));

    setHtml(
      hero.querySelector('.skill-tags'),
      (data.skills || [])
        .slice(0, 5)
        .map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`)
        .join('')
    );

    setHtml(
      hero.querySelector('.role-list'),
      (data.recommended_roles || [])
        .slice(0, 3)
        .map((r) => `<li><span class="role-dot"></span>${escapeHtml(r.role)}</li>`)
        .join('')
    );

    const topMatch =
      (data.recommended_roles && data.recommended_roles[0] && data.recommended_roles[0].match_percent) ||
      (data.job_matches && data.job_matches[0] && data.job_matches[0].match_percent) ||
      0;
    const matchFill = hero.querySelector('.match-fill');
    if (matchFill) matchFill.style.width = topMatch + '%';
    setText(hero.querySelector('.match-value'), Math.round(topMatch) + '%');
  }

  function renderDashboard(data) {
    const dash = document.querySelector('.career-dashboard');
    if (!dash || !data) return;

    const stats = dash.querySelectorAll('.stat-value');
    if (stats[0]) stats[0].textContent = Math.round(data.score || 0) + '%';
    if (stats[1]) stats[1].textContent = String((data.skills || []).length);
    if (stats[2]) stats[2].textContent = String((data.job_matches || []).length);
    if (stats[3]) {
      stats[3].textContent = String(
        ((data.skill_gaps && data.skill_gaps.skills) || []).filter((s) => s.status === 'missing').length
      );
    }

    const fill = dash.querySelector('.stat-bar .stat-fill');
    if (fill) fill.style.width = (data.score || 0) + '%';

    setHtml(
      dash.querySelector('.role-cards'),
      (data.recommended_roles || [])
        .slice(0, 3)
        .map(
          (r) =>
            `<div class="role-card"><span class="role-name">${escapeHtml(r.role)}</span>
             <div class="role-match"><div class="role-match-fill" style="width:${r.match_percent}%"></div></div></div>`
        )
        .join('')
    );

    setHtml(
      dash.querySelector('.activity-list'),
      `<li><span class="activity-dot"></span>Resume analyzed <time>just now</time></li>
       <li><span class="activity-dot"></span>${(data.skills || []).length} skills identified <time>just now</time></li>
       <li><span class="activity-dot"></span>${(data.job_matches || []).length} jobs matched <time>just now</time></li>`
    );

    const categories = categorizeSkills(data.skills || []);
    const values = [categories.technical, categories.soft, categories.tools, categories.domain];
    dash.querySelectorAll('.chart-bar-item').forEach((item, i) => {
      const bar = item.querySelector('.chart-bar div');
      if (bar) bar.style.width = values[i] + '%';
    });
  }

  function categorizeSkills(skills) {
    const lower = skills.map((s) => s.toLowerCase());
    const tech = ['python', 'java', 'javascript', 'react', 'sql', 'machine learning', 'deep learning'];
    const soft = ['communication', 'leadership', 'teamwork', 'problem solving'];
    const tools = ['git', 'docker', 'aws', 'tableau', 'power bi', 'excel'];
    const count = (list) =>
      Math.min(
        95,
        Math.round((lower.filter((s) => list.some((t) => s.includes(t))).length / Math.max(list.length, 1)) * 100 + 20)
      );
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
    jobs = jobs || [];

    if (!jobs.length) {
      setHtml(
        grid,
        '<p class="text-muted" style="grid-column:1/-1;text-align:center;padding:32px;">No jobs found yet. Upload your resume PDF to get matches.</p>'
      );
      return;
    }

    setHtml(
      grid,
      jobs
        .slice(0, 9)
        .map(
          (job) => `
      <article class="job-card glass-card fade-in visible">
        <div class="job-header">
          <h3>${escapeHtml(job.title)}</h3>
          <span class="match-badge ${job.match_percent >= 90 ? 'high' : ''}">${job.match_percent}% Match</span>
        </div>
        <p class="job-company text-muted">${escapeHtml(job.company)} · ${escapeHtml(job.location)}</p>
        <div class="skill-tags">${(job.skills || []).map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}</div>
        <div class="job-actions">
          <button class="btn btn-primary btn-sm" data-job-id="${job.id}">View Job</button>
          <button class="btn btn-outline btn-sm save-job-btn">Save Job</button>
        </div>
      </article>`
        )
        .join('')
    );

    grid.querySelectorAll('[data-job-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const job = jobs.find((j) => j.id === parseInt(btn.dataset.jobId, 10));
        if (job) alert(`${job.title} at ${job.company}\n\n${job.description || 'Great opportunity matching your profile!'}`);
      });
    });

    grid.querySelectorAll('.save-job-btn').forEach((btn) => {
      btn.addEventListener('click', async function () {
        const card = this.closest('.job-card');
        const jobId = card?.querySelector('[data-job-id]')?.dataset?.jobId;
        const job = jobs.find((j) => j.id === parseInt(jobId, 10));
        if (!window.SmartHireAuth?.isConfigured?.() || !window.SmartHireAuth.getUser?.()) {
          window.SmartHireAuth?.openAuthModal?.('login');
          return;
        }
        try {
          if (job) await window.SmartHireAuth.saveJob(job);
          this.classList.add('saved');
          this.textContent = 'Saved ✓';
        } catch (e) {
          alert(e.message || 'Could not save job');
        }
      });
    });
  }

  function renderSkillGap(gap) {
    const section = document.querySelector('#skill-gap');
    if (!section || !gap) return;

    const title = section.querySelector('#targetRoleTitle') || section.querySelector('.target-role h3');
    setText(title, gap.target_role);
    const select = document.getElementById('targetRoleSelect');
    if (select && gap.target_role) {
      try {
        select.value = gap.target_role;
      } catch (_) {}
    }

    setHtml(
      section.querySelector('.skill-checklist'),
      (gap.skills || [])
        .map((s) => {
          const cls = s.status === 'have' ? 'skill-have' : s.status === 'partial' ? 'skill-partial' : 'skill-missing';
          const icon = s.status === 'have' ? '✓' : s.status === 'partial' ? '⚠' : '✕';
          return `<li class="${cls}"><span class="check">${icon}</span> ${escapeHtml(s.name)}</li>`;
        })
        .join('')
    );

    const gapFill = section.querySelector('.gap-fill');
    if (gapFill) gapFill.style.width = (gap.readiness_percent || 0) + '%';
    setText(section.querySelector('.gap-percent'), (gap.readiness_percent || 0) + '%');

    setHtml(
      section.querySelector('.learning-steps'),
      (gap.learning_path || [])
        .map(
          (item) => `<li class="${item.status || ''}">
        <span class="step-indicator">${item.step}</span>
        <div><strong>${escapeHtml(item.title)}</strong>
        <div class="step-bar"><div style="width:${item.progress || 0}%"></div></div></div>
      </li>`
        )
        .join('')
    );
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
      if (window.SmartHireAuth?.getUser?.()) {
        try {
          await window.SmartHireAuth.saveAnalysis(data);
        } catch (_) {}
      }
      showUploadFeedback('Analysis complete for ' + file.name, 'success');
      document.querySelector('#dashboard')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error(err);
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

    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });
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

  document.querySelectorAll('.job-filters select').forEach((sel) => {
    sel.addEventListener('change', refreshJobs);
  });

  async function refreshSkillGap(role) {
    try {
      const gap = await SmartHireAPI.getSkillGap(role, state.profile.skills);
      state.profile.targetRole = role;
      renderSkillGap(gap);
    } catch (_) {}
  }

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
  chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  refreshJobs();
  refreshSkillGap(state.profile.targetRole || 'AI Engineer');

  SmartHireAPI.health()
    .then((h) => {
      if (h.status === 'ok') {
        console.log('SmartHire AI backend connected', h.ai_enabled ? '(AI enabled)' : '(OCR + rule-based)');
      }
    })
    .catch(() => {
      showUploadFeedback('Backend offline — run start.bat, then open http://localhost:8000', 'error');
    });

  window.SmartHireState = state;
  window.refreshSkillGap = refreshSkillGap;
})();
