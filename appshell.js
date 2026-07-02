/* ============================================================
   appshell.js — Terial app chrome behavior
   VENDORED from h12312315.github.io/terial-ai (George's canon),
   source page prototypes/crm-ai-1.html. Vendored: 2026-07-02.
   NEVER EDIT LOCALLY — re-vendor from source instead.
   Contents:
   1. Sidebar nav expand/collapse — GENERALIZED from George's
      per-id handlers (his are entangled with page routing);
      any .nav-row immediately followed by .nav-children toggles.
   2. Omnisearch dropdown — VERBATIM George IIFE (open/close,
      filter, tabs, recent pills, loading states).
   Everything is wrapped in DOMContentLoaded so the script can be
   linked from <head> with or without defer.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ====== Sidebar nav: expand/collapse + active states ======
  // (generalized from George's nav-admin-toggle / nav-reports-toggle
  //  handlers; visual-only — no page routing in the template)
  document.querySelectorAll('.app-nav .nav-row').forEach(function (row) {
    var children = row.nextElementSibling;
    if (!children || !children.classList.contains('nav-children')) return;
    row.addEventListener('click', function () {
      var isOpen = children.style.display !== 'none';
      children.style.display = isOpen ? 'none' : '';
      var caret = row.querySelector('.caret');
      if (caret) caret.textContent = isOpen ? '▾' : '▴';
      row.classList.toggle('is-section-active', !isOpen);
    });
  });

  document.querySelectorAll('.app-nav .nav-child').forEach(function (child) {
    child.addEventListener('click', function () {
      document.querySelectorAll('.app-nav .nav-child').forEach(function (c) {
        c.classList.remove('is-active');
      });
      child.classList.add('is-active');
      document.querySelectorAll('.app-nav .nav-row').forEach(function (r) {
        r.classList.remove('is-section-active');
      });
      var group = child.parentElement;
      var row = group && group.previousElementSibling;
      if (row && row.classList.contains('nav-row')) {
        row.classList.add('is-section-active');
      }
    });
  });

  // ====== Omnisearch dropdown ======
  (function () {
    var wrap = document.getElementById('omnisearch-wrap');
    var input = document.getElementById('omnisearch-input');
    var clearBtn = document.getElementById('omnisearch-clear');
    if (!wrap || !input || !clearBtn) return;

    // Wrap each .omni-item's content in a body + add trailing chevron
    document.querySelectorAll('.omnisearch-dropdown .omni-item').forEach(function (item) {
      if (item.querySelector('.omni-chevron')) return; // already processed
      var body = document.createElement('div');
      body.className = 'omni-item-body';
      while (item.firstChild) body.appendChild(item.firstChild);
      item.appendChild(body);
      var chev = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      chev.setAttribute('class', 'omni-chevron');
      chev.setAttribute('viewBox', '0 0 14 14');
      chev.setAttribute('fill', 'none');
      chev.setAttribute('stroke', 'currentColor');
      chev.setAttribute('stroke-width', '1.6');
      chev.setAttribute('stroke-linecap', 'round');
      chev.setAttribute('stroke-linejoin', 'round');
      chev.innerHTML = '<path d="M5 3l4 4-4 4"/>';
      item.appendChild(chev);
    });

    // Map panel slugs to display names for the no-results message
    var PANEL_NAMES = {
      companies: 'Companies',
      contacts: 'Contacts',
      properties: 'Properties',
      opportunities: 'CRM Opportunities',
      tickets: 'Tickets',
      projects: 'Projects',
      invoices: 'Invoices'
    };

    // Append "No results" text, plus a unified help section (CTA + Try prompts) to each panel
    document.querySelectorAll('.omni-panel').forEach(function (panel) {
      if (panel.getAttribute('data-omni-panel') === 'recent') return;
      if (panel.querySelector('.omni-help-section')) return;
      var slug = panel.getAttribute('data-omni-panel');
      var name = PANEL_NAMES[slug] || 'this category';
      var noResults = document.createElement('div');
      noResults.className = 'omni-no-results';
      noResults.textContent = 'There\u2019s no search result in ' + name;
      panel.appendChild(noResults);
      var help = document.createElement('div');
      help.className = 'omni-help-section';
      var cta = document.createElement('a');
      cta.className = 'omni-cta';
      cta.innerHTML = '<svg class="omni-cta-lead" viewBox="0 0 14 14" fill="currentColor"><path d="M8 1L2 8h4l-1 5 6-7H7l1-5z"/></svg>' +
        '<span class="omni-cta-text">Can\u2019t find what you\u2019re looking for? Ask Terial</span>' +
        '<svg class="omni-cta-icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3l4 4-4 4"/></svg>';
      help.appendChild(cta);
      var suggest = document.createElement('div');
      suggest.className = 'omni-suggest-row';
      suggest.setAttribute('data-suggest-for', slug);
      help.appendChild(suggest);
      panel.appendChild(help);
    });

    // Build 3 suggested prompts based on current query + category
    function renderSuggestions() {
      var q = (input.value || '').trim();
      var activePanel = document.querySelector('.omni-panel.is-active');
      if (!activePanel) return;
      var slug = activePanel.getAttribute('data-omni-panel');
      if (!slug || slug === 'recent') return;
      var row = activePanel.querySelector('.omni-suggest-row');
      if (!row) return;
      var catName = (PANEL_NAMES[slug] || 'items');
      var catLower = catName.toLowerCase();
      var phrase = q ? '"' + q + '"' : 'items';
      var prompts = [
        'Show ' + catLower + ' related to ' + phrase,
        q ? 'Summarize recent activity on ' + phrase : 'Most active ' + catLower + ' this month',
        q ? 'Find similar ' + catLower + ' to ' + phrase : 'Open ' + catLower + ' needing review'
      ];
      var pillsHtml = '';
      prompts.forEach(function (p) {
        pillsHtml += '<span class="omni-suggest-pill">' +
          '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="4"/><path d="M9.5 9.5L12 12"/></svg>' +
          p + '</span>';
      });
      row.innerHTML = pillsHtml;
    }

    var tabBtns = document.querySelectorAll('#omnisearch-tabs .omnisearch-tab');
    var panels = document.querySelectorAll('.omni-panel');
    var panelsContainer = document.getElementById('omnisearch-panels');
    var loadTimer = null;

    function openDropdown() { wrap.classList.add('is-active'); }
    function closeDropdown() {
      wrap.classList.remove('is-active');
      wrap.classList.remove('omni-hide-recent');
      wrap.classList.remove('omni-only-recent');
      input.value = '';
      hadQueryBefore = false;
      filterActivePanel();
    }
    function syncOnlyRecent() {
      var hasQuery = input.value.trim().length > 0;
      wrap.classList.toggle('omni-only-recent', !hasQuery && !wrap.classList.contains('omni-hide-recent'));
    }

    // Filter visible items in the currently active panel by query substring (title text)
    // Also filter the recent pills at the top of the dropdown.
    function filterActivePanel() {
      var q = input.value.trim().toLowerCase();
      var hasQuery = q.length > 0;

      // Filter recent pills
      document.querySelectorAll('.omni-pill').forEach(function (pill) {
        var kw = (pill.getAttribute('data-keyword') || '').toLowerCase();
        var match = !hasQuery || kw.indexOf(q) !== -1;
        pill.style.display = match ? '' : 'none';
      });

      // Filter active panel items + toggle empty state
      var activePanel = document.querySelector('.omni-panel.is-active');
      if (!activePanel) return;
      var items = activePanel.querySelectorAll('.omni-item');
      var visible = 0;
      items.forEach(function (it) {
        var text = (it.textContent || '').toLowerCase();
        var match = !hasQuery || text.indexOf(q) !== -1;
        it.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      activePanel.classList.toggle('is-empty', items.length > 0 && visible === 0);
      renderSuggestions();
    }

    var hadQueryBefore = false;
    input.addEventListener('input', function () {
      var hasQuery = input.value.trim().length > 0;
      // Typing re-shows the recent bar above the body
      wrap.classList.remove('omni-hide-recent');
      openDropdown();
      syncOnlyRecent();
      // If we just transitioned from empty → has query, show loading first
      if (hasQuery && !hadQueryBefore) {
        if (loadTimer) clearTimeout(loadTimer);
        panelsContainer.classList.add('is-loading');
        loadTimer = setTimeout(function () {
          panelsContainer.classList.remove('is-loading');
          filterActivePanel();
        }, 1500);
      } else {
        filterActivePanel();
      }
      hadQueryBefore = hasQuery;
    });
    input.addEventListener('focus', function () {
      openDropdown();
      syncOnlyRecent();
      filterActivePanel();
    });
    clearBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeDropdown();
      input.focus();
    });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) {
        wrap.classList.remove('is-active');
      }
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDropdown();
    });

    function switchToTab(target) {
      tabBtns.forEach(function (b) {
        b.classList.toggle('is-active', b.getAttribute('data-omni-tab') === target);
      });
      if (loadTimer) clearTimeout(loadTimer);
      panelsContainer.classList.add('is-loading');
      loadTimer = setTimeout(function () {
        panels.forEach(function (p) {
          p.classList.toggle('is-active', p.getAttribute('data-omni-panel') === target);
        });
        panelsContainer.classList.remove('is-loading');
        filterActivePanel();
      }, 1500);
    }

    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var target = btn.getAttribute('data-omni-tab');
        if (btn.classList.contains('is-active')) return;
        switchToTab(target);
      });
    });

    // Recent pill clicks: set input value, hide recent bar, filter companies
    document.querySelectorAll('.omni-pill').forEach(function (pill) {
      pill.addEventListener('click', function (e) {
        e.stopPropagation();
        var keyword = pill.getAttribute('data-keyword') || pill.textContent.trim();
        input.value = keyword;
        hadQueryBefore = true;
        openDropdown();
        // Reveal the body (if it was hidden because input was empty)
        wrap.classList.remove('omni-only-recent');
        // Hide the "Recent:" bar since the user has picked one
        wrap.classList.add('omni-hide-recent');
        // Set active tab = companies
        tabBtns.forEach(function (b) {
          b.classList.toggle('is-active', b.getAttribute('data-omni-tab') === 'companies');
        });
        panels.forEach(function (p) {
          p.classList.toggle('is-active', p.getAttribute('data-omni-panel') === 'companies');
        });
        // Show loading state before results appear
        if (loadTimer) clearTimeout(loadTimer);
        panelsContainer.classList.add('is-loading');
        loadTimer = setTimeout(function () {
          panelsContainer.classList.remove('is-loading');
          filterActivePanel();
        }, 1500);
      });
    });
  })();

});
