/**
 * Main Application Bootstrapper — "رابعة طب"
 * Initializes all core modules in correct sequence.
 */

(function () {
  'use strict';

  function initApp() {
    console.log('Initializing "رابعة طب" (Fourth Year Medical Study Suite)...');

    // 1. Initialize Storage
    if (window.StorageService) {
      window.StorageService.init();
      const settings = window.StorageService.getSettings();
      if (settings && settings.theme) {
        document.documentElement.setAttribute('data-theme', settings.theme);
      }
    }

    // 2. Initialize UI Navigation, Modals, Toasts
    if (window.UI) {
      window.UI.init();
    }

    // 3. Initialize Countdown Timer
    if (window.Countdown) {
      window.Countdown.init();
    }

    // 4. Initialize Core Views
    if (window.Dashboard) {
      window.Dashboard.init();
    }

    if (window.SubjectsManager) {
      window.SubjectsManager.init();
    }

    if (window.TasksManager) {
      window.TasksManager.init();
    }

    if (window.Calendar) {
      window.Calendar.init();
    }

    if (window.Analytics) {
      window.Analytics.init();
    }

    if (window.SettingsManager) {
      window.SettingsManager.init();
    }

    console.log('"رابعة طب" loaded successfully and ready.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
