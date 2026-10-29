/**
 * UI Controller for "رابعة طب"
 * Handles navigation switching, modals, toast alerts, mobile drawer, and safe rendering.
 */

(function () {
  'use strict';

  const UI = {
    currentView: 'dashboard',

    init() {
      this.setupNavigation();
      this.setupMobileDrawer();
      this.setupKeyboardShortcuts();
      this.setupToastContainer();
    },

    // Navigation Switcher
    setupNavigation() {
      const navItems = document.querySelectorAll('.nav-item[data-view]');
      navItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const targetView = item.getAttribute('data-view');
          this.switchView(targetView);
          this.closeMobileDrawer();
        });
      });

      // Handle direct URL hash navigation if present
      const initialHash = window.location.hash.replace('#', '');
      if (['dashboard', 'subjects', 'calendar', 'today', 'analytics', 'settings'].includes(initialHash)) {
        this.switchView(initialHash);
      } else {
        this.switchView('dashboard');
      }

      window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '');
        if (hash && hash !== this.currentView) {
          this.switchView(hash, false);
        }
      });
    },

    switchView(viewName, updateHash = true) {
      const validViews = ['dashboard', 'subjects', 'calendar', 'today', 'analytics', 'settings'];
      if (!validViews.includes(viewName)) return;

      this.currentView = viewName;
      if (updateHash) {
        window.location.hash = viewName;
      }

      // Update sidebar nav active state
      document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-view') === viewName);
      });

      // Update view section display
      document.querySelectorAll('.view-section').forEach(sec => {
        sec.classList.toggle('active', sec.id === `view-${viewName}`);
      });

      // Update topbar title & breadcrumb
      const titles = {
        dashboard: { title: 'Academic Dashboard', sub: 'Overview & Exam Readiness' },
        subjects: { title: 'Study Subjects & Curriculum', sub: 'Course Progress & Lectures' },
        calendar: { title: 'Academic Calendar', sub: 'Scheduled Tasks & Milestones' },
        today: { title: "Today's Study Agenda", sub: 'Focus & Daily Execution' },
        analytics: { title: 'Topic Progression & Analytics', sub: 'Data-driven Study Performance' },
        settings: { title: 'System Settings', sub: 'Preferences, Backup & Reset' }
      };

      const topTitle = document.getElementById('topbar-page-title');
      const topBreadcrumb = document.getElementById('topbar-breadcrumb');
      if (topTitle && titles[viewName]) {
        topTitle.textContent = titles[viewName].title;
      }
      if (topBreadcrumb && titles[viewName]) {
        topBreadcrumb.textContent = titles[viewName].sub;
      }

      // Notify view modules
      window.dispatchEvent(new CustomEvent('viewChanged', { detail: { view: viewName } }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // Mobile Drawer
    setupMobileDrawer() {
      const toggleBtn = document.getElementById('menu-toggle-btn');
      const closeBtn = document.getElementById('sidebar-close-btn');
      const sidebar = document.getElementById('app-sidebar');
      const backdrop = document.getElementById('sidebar-backdrop');

      if (toggleBtn && sidebar && backdrop) {
        toggleBtn.addEventListener('click', () => {
          sidebar.classList.add('open');
          backdrop.classList.add('show');
        });
      }

      if (closeBtn && sidebar && backdrop) {
        closeBtn.addEventListener('click', () => this.closeMobileDrawer());
      }

      if (backdrop) {
        backdrop.addEventListener('click', () => this.closeMobileDrawer());
      }
    },

    closeMobileDrawer() {
      const sidebar = document.getElementById('app-sidebar');
      const backdrop = document.getElementById('sidebar-backdrop');
      if (sidebar) sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('show');
    },

    // Modals
    openModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        const autoFocusInput = modal.querySelector('input:not([type=hidden]), textarea, select');
        if (autoFocusInput) {
          setTimeout(() => autoFocusInput.focus(), 150);
        }
      }
    },

    closeModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('active');
        // Check if any other modal is still active
        const hasActive = document.querySelector('.modal-backdrop.active');
        if (!hasActive) {
          document.body.style.overflow = '';
        }
      }
    },

    setupKeyboardShortcuts() {
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          // Close topmost modal
          const activeModals = document.querySelectorAll('.modal-backdrop.active');
          if (activeModals.length > 0) {
            const topModal = activeModals[activeModals.length - 1];
            topModal.classList.remove('active');
            document.body.style.overflow = '';
          }
          this.closeMobileDrawer();
        }
      });
    },

    // Toasts
    setupToastContainer() {
      if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
      }
    },

    showToast(message, type = 'info', duration = 3500) {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;

      let icon = 'fa-info-circle';
      if (type === 'success') icon = 'fa-check-circle';
      if (type === 'error') icon = 'fa-exclamation-triangle';

      toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${this.escapeHTML(message)}</span>
      `;

      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 250);
      }, duration);
    },

    // Safe HTML Escape
    escapeHTML(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    // Reusable Confirmation Dialog
    confirm(title, message, confirmText = 'Confirm', onConfirm = () => {}) {
      const dialog = document.getElementById('modal-confirm-dialog');
      if (!dialog) return;

      document.getElementById('confirm-dialog-title').textContent = title;
      document.getElementById('confirm-dialog-message').textContent = message;

      const confirmBtn = document.getElementById('confirm-dialog-btn');
      confirmBtn.textContent = confirmText;

      const newConfirmBtn = confirmBtn.cloneNode(true);
      confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

      newConfirmBtn.addEventListener('click', () => {
        this.closeModal('modal-confirm-dialog');
        onConfirm();
      });

      this.openModal('modal-confirm-dialog');
    }
  };

  window.UI = UI;
})();
