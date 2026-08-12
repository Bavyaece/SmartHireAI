/**
 * SmartHire AI — Main JavaScript
 * Handles navigation, animations, particles, and resume upload UI.
 * API integration points are stubbed for future Wix/backend connections.
 */

(function () {
  'use strict';

  // ============================================
  // Navbar scroll effect
  // ============================================
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  function handleNavbarScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // ============================================
  // Mobile menu
  // ============================================
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = mobileMenu.querySelectorAll('a');

  function toggleMobileMenu() {
    const isOpen = hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMobileMenu() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', toggleMobileMenu);

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });

  // ============================================
  // Smooth scroll for anchor links
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#login' || targetId === '#contact' || targetId === '#privacy' || targetId === '#terms') {
        e.preventDefault();
        return;
      }
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ============================================
  // Intersection Observer — fade-in animations
  // ============================================
  const fadeElements = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    fadeElements.forEach(function (el) {
      fadeObserver.observe(el);
    });
  } else {
    fadeElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ============================================
  // Floating particles background
  // ============================================
  const canvas = document.getElementById('particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = [];
      const count = Math.min(Math.floor(window.innerWidth / 40), 40);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.4 + 0.1
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139, 92, 246, ' + p.opacity + ')';
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      animationId = requestAnimationFrame(drawParticles);
    }

    function initParticles() {
      resizeCanvas();
      createParticles();
      drawParticles();
    }

    window.addEventListener('resize', function () {
      resizeCanvas();
      createParticles();
    });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!prefersReducedMotion.matches) {
      initParticles();
    }

    prefersReducedMotion.addEventListener('change', function (e) {
      if (e.matches) {
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        initParticles();
      }
    });
  }

  // ============================================
  // Score ring SVG gradient
  // ============================================
  const scoreSvg = document.querySelector('.score-svg');
  if (scoreSvg) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'scoreGrad');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#8B5CF6');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#3B82F6');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    scoreSvg.insertBefore(defs, scoreSvg.firstChild);
  }

  // ============================================
  // Resume upload zone
  // ============================================
  const uploadZone = document.getElementById('uploadZone');
  const resumeInput = document.getElementById('resumeInput');
  const analyzeBtn = document.getElementById('analyzeBtn');

  if (uploadZone && resumeInput && analyzeBtn) {
    uploadZone.addEventListener('click', function () {
      resumeInput.click();
    });

    analyzeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      resumeInput.click();
    });

    uploadZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', function () {
      uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', function (e) {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleResumeUpload(files[0]);
      }
    });

    resumeInput.addEventListener('change', function () {
      if (resumeInput.files.length > 0) {
        handleResumeUpload(resumeInput.files[0]);
      }
    });
  }

  /**
   * Handle resume file upload.
   * Future: connect to Wix backend / AI analysis API.
   * @param {File} file
   */
  function handleResumeUpload(file) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      showUploadFeedback('Please upload a PDF or DOCX file.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showUploadFeedback('File size must be under 10 MB.', 'error');
      return;
    }

    showUploadFeedback('Resume received: ' + file.name + '. Analysis will be available once connected to the AI backend.', 'success');

    // Future API integration point:
    // SmartHireAPI.analyzeResume(file).then(handleAnalysisResult).catch(handleError);
  }

  function showUploadFeedback(message, type) {
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

  // ============================================
  // Job filter UI (client-side demo)
  // ============================================
  const filterSelects = document.querySelectorAll('.job-filters select');
  filterSelects.forEach(function (select) {
    select.addEventListener('change', function () {
      // Future: connect to job matching API with filter params
      // SmartHireAPI.getJobs(getFilterParams()).then(renderJobs);
    });
  });

  // ============================================
  // Save job buttons
  // ============================================
  document.querySelectorAll('.job-actions .btn-outline').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const saved = this.classList.toggle('saved');
      this.textContent = saved ? 'Saved ✓' : 'Save Job';
      // Future: SmartHireAPI.saveJob(jobId);
    });
  });

  // ============================================
  // AI Mentor chat input
  // ============================================
  const chatInput = document.querySelector('.chat-input-area input');
  const chatSendBtn = document.querySelector('.chat-input-area .btn');

  if (chatInput && chatSendBtn) {
    function sendChatMessage() {
      const message = chatInput.value.trim();
      if (!message) return;

      const messagesContainer = document.querySelector('.chat-messages');

      const userMsg = document.createElement('div');
      userMsg.className = 'message user';
      userMsg.innerHTML = '<p>' + escapeHtml(message) + '</p>';
      messagesContainer.appendChild(userMsg);

      chatInput.value = '';

      // Demo response — future: SmartHireAPI.askMentor(message)
      setTimeout(function () {
        const aiMsg = document.createElement('div');
        aiMsg.className = 'message ai';
        aiMsg.innerHTML = '<p>Thank you for your question! Once the AI Mentor backend is connected, I\'ll provide personalized career guidance based on your profile.</p>';
        messagesContainer.appendChild(aiMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 800);

      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    chatSendBtn.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') sendChatMessage();
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================
  // API stub for future Wix integration
  // ============================================
  window.SmartHireAPI = {
    analyzeResume: function (file) {
      // POST to Wix backend / serverless function
      // return fetch('/_functions/analyzeResume', { method: 'POST', body: formData });
      return Promise.reject(new Error('API not connected'));
    },
    getJobs: function (filters) {
      // return fetch('/_functions/getJobs?' + new URLSearchParams(filters));
      return Promise.reject(new Error('API not connected'));
    },
    getSkillGap: function (targetRole) {
      // return fetch('/_functions/skillGap?role=' + targetRole);
      return Promise.reject(new Error('API not connected'));
    },
    askMentor: function (message) {
      // return fetch('/_functions/aiMentor', { method: 'POST', body: JSON.stringify({ message }) });
      return Promise.reject(new Error('API not connected'));
    }
  };
})();
