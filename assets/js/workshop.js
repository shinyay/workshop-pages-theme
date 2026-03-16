/**
 * Workshop Pages Theme — Interactive JavaScript
 * Theme toggle, TOC generation, mobile sidebar, smooth scroll,
 * copy buttons, progress tracking, scroll-spy, keyboard nav, back-to-top
 */
(function () {
  'use strict';

  // ─── Theme Toggle ───────────────────────────────────────────
  var themeToggle = document.getElementById('theme-toggle');
  var htmlEl = document.documentElement;

  function getPreferredTheme() {
    var saved = localStorage.getItem('workshop-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('workshop-theme', theme);
  }

  setTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = htmlEl.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem('workshop-theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // ─── Copy Button on Code Blocks ─────────────────────────────
  function addCopyButtons() {
    var codeBlocks = document.querySelectorAll('.content-body pre');
    codeBlocks.forEach(function (pre) {
      var wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.setAttribute('aria-label', 'Copy code');
      btn.innerHTML =
        '<svg class="copy-icon" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">' +
        '<path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>' +
        '<path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>' +
        '</svg>' +
        '<svg class="check-icon" viewBox="0 0 16 16" width="14" height="14" fill="currentColor" style="display:none">' +
        '<path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>' +
        '</svg>';

      wrapper.appendChild(btn);

      btn.addEventListener('click', function () {
        var code = pre.querySelector('code');
        var text = code ? code.textContent : pre.textContent;
        navigator.clipboard.writeText(text).then(function () {
          btn.classList.add('copied');
          btn.querySelector('.copy-icon').style.display = 'none';
          btn.querySelector('.check-icon').style.display = 'block';
          setTimeout(function () {
            btn.classList.remove('copied');
            btn.querySelector('.copy-icon').style.display = '';
            btn.querySelector('.check-icon').style.display = 'none';
          }, 2000);
        });
      });
    });
  }

  // ─── Progress Tracking & Step Completion ────────────────────
  function getWorkshopKey() {
    var path = window.location.pathname.split('/').filter(Boolean);
    return 'workshop-visited-' + (path[0] || 'default');
  }

  function getVisitedSteps() {
    try {
      return JSON.parse(localStorage.getItem(getWorkshopKey())) || [];
    } catch (e) {
      return [];
    }
  }

  function markStepVisited() {
    var stepLinks = document.querySelectorAll('.step-link[data-step]');
    var activeLink = document.querySelector('.step-link.active[data-step]');
    if (!activeLink) return;

    var stepNum = parseInt(activeLink.getAttribute('data-step'), 10);
    if (isNaN(stepNum) || stepNum <= 0) return;

    var visited = getVisitedSteps();
    if (visited.indexOf(stepNum) === -1) {
      visited.push(stepNum);
      localStorage.setItem(getWorkshopKey(), JSON.stringify(visited));
    }
  }

  function updateProgressUI() {
    var visited = getVisitedSteps();
    var progressEl = document.getElementById('sidebar-progress');
    if (!progressEl) return;

    var total = parseInt(progressEl.getAttribute('data-total'), 10) || 0;
    if (total <= 0) return;

    var count = visited.length;
    var pct = Math.round((count / total) * 100);

    var label = progressEl.querySelector('.progress-label');
    var fill = progressEl.querySelector('.progress-fill');
    if (label) label.textContent = 'Progress: ' + count + '/' + total;
    if (fill) fill.style.width = pct + '%';

    // Mark visited dots
    var stepLinks = document.querySelectorAll('.step-link[data-step]');
    stepLinks.forEach(function (link) {
      var num = parseInt(link.getAttribute('data-step'), 10);
      var dot = link.querySelector('.step-dot');
      if (dot && visited.indexOf(num) !== -1) {
        dot.classList.add('visited');
      }
    });
  }

  // ─── Table of Contents with Scroll Spy ──────────────────────
  function generateTOC() {
    var tocList = document.getElementById('toc-list');
    var contentBody = document.querySelector('.content-body');
    if (!tocList || !contentBody) return;

    var headings = contentBody.querySelectorAll('h2, h3');
    if (headings.length < 2) {
      var toc = document.getElementById('toc');
      if (toc) toc.style.display = 'none';
      return;
    }

    var html = '';
    headings.forEach(function (heading, i) {
      if (!heading.id) heading.id = 'heading-' + i;
      var level = heading.tagName === 'H3' ? 'toc-h3' : 'toc-h2';
      html += '<a href="#' + heading.id + '" class="toc-link ' + level + '" data-target="' + heading.id + '">' + heading.textContent + '</a>';
    });
    tocList.innerHTML = html;

    // Scroll spy via IntersectionObserver
    if ('IntersectionObserver' in window) {
      var tocLinks = tocList.querySelectorAll('.toc-link');
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            tocLinks.forEach(function (l) { l.classList.remove('toc-active'); });
            var active = tocList.querySelector('[data-target="' + entry.target.id + '"]');
            if (active) active.classList.add('toc-active');
          }
        });
      }, { rootMargin: '-80px 0px -60% 0px', threshold: 0 });

      headings.forEach(function (h) { observer.observe(h); });
    }
  }

  // ─── Mobile Sidebar Toggle ─────────────────────────────────
  var hamburger = document.getElementById('nav-hamburger');
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebar-overlay');

  function toggleSidebar() {
    if (sidebar) {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('open');
      document.body.classList.toggle('sidebar-open');
    }
  }

  if (hamburger) hamburger.addEventListener('click', toggleSidebar);
  if (overlay) overlay.addEventListener('click', toggleSidebar);

  // ─── Smooth Scroll for Anchor Links ─────────────────────────
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;

    var targetId = link.getAttribute('href').slice(1);
    var target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, null, '#' + targetId);
    }
  });

  // ─── Active Step Highlight ──────────────────────────────────
  function highlightActiveStep() {
    var stepLinks = document.querySelectorAll('.step-link');
    var currentPath = window.location.pathname;
    stepLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === currentPath ||
          link.getAttribute('href') === currentPath.replace(/\/$/, '') ||
          link.getAttribute('href') === currentPath + '/') {
        link.classList.add('active');
      }
    });
  }

  // ─── GitHub Callout Syntax Transform ────────────────────────
  function transformCallouts() {
    var blockquotes = document.querySelectorAll('.content-body blockquote');
    blockquotes.forEach(function (bq) {
      var firstP = bq.querySelector('p:first-child');
      if (!firstP) return;

      var text = firstP.innerHTML;
      var calloutTypes = {
        '[!NOTE]':      { icon: '📝', cls: 'callout-note',      title: 'Note' },
        '[!TIP]':       { icon: '💡', cls: 'callout-tip',       title: 'Tip' },
        '[!IMPORTANT]': { icon: '❗', cls: 'callout-important', title: 'Important' },
        '[!WARNING]':   { icon: '⚠️', cls: 'callout-warning',   title: 'Warning' },
        '[!CAUTION]':   { icon: '🔴', cls: 'callout-caution',   title: 'Caution' }
      };

      for (var marker in calloutTypes) {
        if (text.indexOf(marker) !== -1) {
          var info = calloutTypes[marker];
          bq.classList.add('callout', info.cls);
          firstP.innerHTML = text.replace(marker, '<strong>' + info.icon + ' ' + info.title + '</strong>');
          break;
        }
      }
    });
  }

  // ─── Deduplicate Step Headings ──────────────────────────────
  function deduplicateHeadings() {
    var stepTitle = document.querySelector('.step-title');
    var contentBody = document.querySelector('.content-body');
    if (!stepTitle || !contentBody) return;

    var firstHeading = contentBody.querySelector('h1, h2');
    if (!firstHeading) return;

    // Normalize text for comparison (strip emoji, whitespace, punctuation differences)
    function normalize(str) {
      return str.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
    }

    var titleText = normalize(stepTitle.textContent);
    var headingText = normalize(firstHeading.textContent);

    // Remove if the heading is substantially similar to the step title
    if (titleText === headingText ||
        headingText.indexOf(titleText) !== -1 ||
        titleText.indexOf(headingText) !== -1) {
      firstHeading.remove();
    }
  }

  // ─── Keyboard Navigation (← → for Prev/Next) ──────────────
  function setupKeyboardNav() {
    document.addEventListener('keydown', function (e) {
      // Skip if user is typing in an input
      var tag = document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement.isContentEditable) return;

      var prev = document.querySelector('.step-nav-btn:first-child');
      var next = document.querySelector('.step-nav-btn:last-child');

      if (e.key === 'ArrowLeft' && prev && !prev.classList.contains('disabled')) {
        window.location.href = prev.getAttribute('href');
      } else if (e.key === 'ArrowRight' && next && !next.classList.contains('disabled')) {
        window.location.href = next.getAttribute('href');
      }
    });
  }

  // ─── Back to Top Button ─────────────────────────────────────
  function setupBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;

    function toggleVisibility() {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─── Code Language Labels ────────────────────────────────────
  function addCodeLanguageLabels() {
    var codeBlocks = document.querySelectorAll('.content-body pre code[class*="language-"]');
    codeBlocks.forEach(function (code) {
      var cls = Array.from(code.classList).find(function (c) { return c.startsWith('language-'); });
      if (!cls) return;
      var lang = cls.replace('language-', '');
      var wrapper = code.closest('.code-block-wrapper');
      if (!wrapper || wrapper.querySelector('.code-lang-label')) return;

      var label = document.createElement('span');
      label.className = 'code-lang-label';
      label.textContent = lang;
      wrapper.appendChild(label);
    });
  }

  // ─── Init ───────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    generateTOC();
    highlightActiveStep();
    transformCallouts();
    addCopyButtons();
    addCodeLanguageLabels();
    deduplicateHeadings();
    markStepVisited();
    updateProgressUI();
    setupKeyboardNav();
    setupBackToTop();
  });
})();
