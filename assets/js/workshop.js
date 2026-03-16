/**
 * Workshop Pages Theme — Interactive JavaScript
 * Theme toggle, TOC generation, mobile sidebar, smooth scroll
 */
(function () {
  'use strict';

  // ─── Theme Toggle ───────────────────────────────────────────
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  function getPreferredTheme() {
    const saved = localStorage.getItem('workshop-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('workshop-theme', theme);
  }

  // Apply theme immediately
  setTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const current = html.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem('workshop-theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // ─── Table of Contents ──────────────────────────────────────
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
      if (!heading.id) {
        heading.id = 'heading-' + i;
      }
      var level = heading.tagName === 'H3' ? 'toc-h3' : 'toc-h2';
      html += '<a href="#' + heading.id + '" class="toc-link ' + level + '">' + heading.textContent + '</a>';
    });
    tocList.innerHTML = html;
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

  if (hamburger) {
    hamburger.addEventListener('click', toggleSidebar);
  }
  if (overlay) {
    overlay.addEventListener('click', toggleSidebar);
  }

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

  // ─── Init ───────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    generateTOC();
    highlightActiveStep();
    transformCallouts();
  });
})();
