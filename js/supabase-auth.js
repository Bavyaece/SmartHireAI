/**
 * SmartHire AI — Supabase Auth & Data
 */
(function (global) {
  'use strict';

  const cfg = global.SMART_HIRE_SUPABASE || {};
  let client = null;
  let currentUser = null;

  function isConfigured() {
    return Boolean(cfg.url && cfg.anonKey && cfg.url.includes('supabase.co'));
  }

  function getClient() {
    if (!isConfigured()) return null;
    if (client) return client;
    if (!global.supabase || !global.supabase.createClient) {
      console.warn('Supabase JS SDK not loaded');
      return null;
    }
    client = global.supabase.createClient(cfg.url, cfg.anonKey);
    return client;
  }

  async function init() {
    const sb = getClient();
    if (!sb) {
      updateAuthUI(null);
      return null;
    }

    const { data } = await sb.auth.getSession();
    currentUser = data.session?.user || null;
    updateAuthUI(currentUser);

    sb.auth.onAuthStateChange((_event, session) => {
      currentUser = session?.user || null;
      updateAuthUI(currentUser);
    });

    return currentUser;
  }

  function updateAuthUI(user) {
    const loginBtn = document.querySelector('.nav-actions a.btn-ghost');
    const getStartedBtn = document.querySelector('.nav-actions a.btn-primary');
    const mobileActions = document.querySelector('.mobile-menu-actions');
    const badge = document.getElementById('authUserBadge');

    if (user) {
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Account';
      if (loginBtn) {
        loginBtn.textContent = 'Log Out';
        loginBtn.href = '#logout';
        loginBtn.onclick = async (e) => {
          e.preventDefault();
          await signOut();
        };
      }
      if (getStartedBtn) {
        getStartedBtn.textContent = name;
        getStartedBtn.href = '#resume-analyzer';
      }
      if (badge) {
        badge.style.display = 'inline-flex';
        badge.textContent = name;
      }
      if (mobileActions) {
        const links = mobileActions.querySelectorAll('a');
        if (links[0]) {
          links[0].textContent = 'Log Out';
          links[0].onclick = async (e) => {
            e.preventDefault();
            await signOut();
          };
        }
        if (links[1]) links[1].textContent = 'Analyze Resume';
      }
    } else {
      if (loginBtn) {
        loginBtn.textContent = 'Log In';
        loginBtn.href = '#login';
        loginBtn.onclick = (e) => {
          e.preventDefault();
          openAuthModal('login');
        };
      }
      if (getStartedBtn) {
        getStartedBtn.textContent = 'Get Started';
        getStartedBtn.href = '#signup';
        getStartedBtn.onclick = (e) => {
          e.preventDefault();
          openAuthModal('signup');
        };
      }
      if (badge) badge.style.display = 'none';
    }
  }

  function openAuthModal(mode) {
    const modal = document.getElementById('authModal');
    if (!modal) return;

    if (!isConfigured()) {
      alert(
        'Supabase is not configured yet.\n\n' +
          '1. Create a project at https://supabase.com/dashboard\n' +
          '2. Copy Project URL + anon key\n' +
          '3. Paste them into js/supabase-config.js\n' +
          '4. Run supabase/schema.sql in the SQL Editor'
      );
      return;
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    setAuthMode(mode || 'login');
  }

  function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    const err = document.getElementById('authError');
    if (err) err.textContent = '';
  }

  function setAuthMode(mode) {
    const title = document.getElementById('authTitle');
    const submit = document.getElementById('authSubmit');
    const switchBtn = document.getElementById('authSwitch');
    const nameField = document.getElementById('authNameField');
    const form = document.getElementById('authForm');
    if (form) form.dataset.mode = mode;

    if (mode === 'signup') {
      if (title) title.textContent = 'Create your account';
      if (submit) submit.textContent = 'Sign Up';
      if (switchBtn) switchBtn.innerHTML = 'Already have an account? <button type="button" class="auth-link" data-mode="login">Log In</button>';
      if (nameField) nameField.style.display = 'block';
    } else {
      if (title) title.textContent = 'Welcome back';
      if (submit) submit.textContent = 'Log In';
      if (switchBtn) switchBtn.innerHTML = 'New here? <button type="button" class="auth-link" data-mode="signup">Create account</button>';
      if (nameField) nameField.style.display = 'none';
    }
  }

  async function signUp(email, password, fullName) {
    const sb = getClient();
    if (!sb) throw new Error('Supabase not configured');
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName || '' } },
    });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    const sb = getClient();
    if (!sb) throw new Error('Supabase not configured');
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signInWithGoogle() {
    const sb = getClient();
    if (!sb) throw new Error('Supabase not configured');
    const redirectTo = window.location.origin + window.location.pathname;
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) throw error;
  }

  async function signOut() {
    const sb = getClient();
    if (!sb) return;
    await sb.auth.signOut();
    currentUser = null;
    updateAuthUI(null);
  }

  async function saveAnalysis(analysis) {
    const sb = getClient();
    if (!sb || !currentUser) return null;
    const { data, error } = await sb.from('resume_analyses').insert({
      user_id: currentUser.id,
      filename: analysis.filename,
      score: analysis.score,
      skills: analysis.skills || [],
      strengths: analysis.strengths || [],
      recommended_roles: analysis.recommended_roles || [],
      ats_score: analysis.ats_score,
      ats_label: analysis.ats_label,
    }).select().single();
    if (error) {
      console.warn('Could not save analysis to Supabase:', error.message);
      return null;
    }
    return data;
  }

  async function saveJob(job) {
    const sb = getClient();
    if (!sb || !currentUser) {
      throw new Error('Please log in to save jobs');
    }
    const { data, error } = await sb.from('saved_jobs').insert({
      user_id: currentUser.id,
      job_title: job.title,
      company: job.company,
      location: job.location,
      match_percent: job.match_percent,
      skills: job.skills || [],
    }).select().single();
    if (error) throw error;
    return data;
  }

  // Wire modal events
  document.addEventListener('DOMContentLoaded', () => {
    init();

    document.getElementById('authClose')?.addEventListener('click', closeAuthModal);
    document.getElementById('authOverlay')?.addEventListener('click', closeAuthModal);

    document.getElementById('authSwitch')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-mode]');
      if (btn) setAuthMode(btn.dataset.mode);
    });

    document.getElementById('authGoogle')?.addEventListener('click', async () => {
      const err = document.getElementById('authError');
      try {
        await signInWithGoogle();
      } catch (e) {
        if (err) err.textContent = e.message || 'Google sign-in failed. Enable Google provider in Supabase Auth settings.';
      }
    });

    document.getElementById('authForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const mode = form.dataset.mode || 'login';
      const email = document.getElementById('authEmail')?.value.trim();
      const password = document.getElementById('authPassword')?.value;
      const fullName = document.getElementById('authName')?.value.trim();
      const err = document.getElementById('authError');
      const submit = document.getElementById('authSubmit');
      if (err) err.textContent = '';
      if (submit) {
        submit.disabled = true;
        submit.textContent = mode === 'signup' ? 'Creating...' : 'Signing in...';
      }
      try {
        if (mode === 'signup') {
          await signUp(email, password, fullName);
          if (err) err.textContent = 'Check your email to confirm, or log in if confirmations are disabled.';
        } else {
          await signIn(email, password);
          closeAuthModal();
        }
      } catch (ex) {
        if (err) err.textContent = ex.message || 'Authentication failed';
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.textContent = mode === 'signup' ? 'Sign Up' : 'Log In';
        }
      }
    });

    // Hash routes
    if (location.hash === '#login') openAuthModal('login');
    if (location.hash === '#signup') openAuthModal('signup');
  });

  global.SmartHireAuth = {
    isConfigured,
    getClient,
    init,
    openAuthModal,
    closeAuthModal,
    signOut,
    saveAnalysis,
    saveJob,
    getUser: () => currentUser,
  };
})(window);
