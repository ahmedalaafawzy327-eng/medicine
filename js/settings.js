/**
 * Settings & Backup Management for "رابعة طب"
 * Academic preferences, data export/import, CSV downloads, and reset procedures.
 */

(function () {
  'use strict';

  const SettingsManager = {
    init() {
      this.loadSettingsToUI();
      this.bindEvents();

      window.StorageService.subscribe((evt) => {
        if (evt === 'settingsChanged' || evt === 'dataImported' || evt === 'allDataReset') {
          this.loadSettingsToUI();
        }
      });

      window.addEventListener('viewChanged', (e) => {
        if (e.detail.view === 'settings') {
          this.loadSettingsToUI();
        }
      });
    },

    loadSettingsToUI() {
      const settings = window.StorageService.getSettings();
      const examDate = window.StorageService.getExamDate();

      // Exam Date Input
      const examInput = document.getElementById('settings-exam-date');
      if (examInput && examDate) {
        const d = new Date(examDate);
        if (!isNaN(d.getTime())) {
          const pad = (n) => String(n).padStart(2, '0');
          examInput.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }
      }

      // Theme
      const themeSelect = document.getElementById('settings-theme-select');
      if (themeSelect) {
        themeSelect.value = settings.theme || 'navy-gold-classic';
        document.documentElement.setAttribute('data-theme', themeSelect.value);
      }

      // Default Calendar View
      const calViewSelect = document.getElementById('settings-cal-view');
      if (calViewSelect) calViewSelect.value = settings.defaultCalendarView || 'month';

      // First Day of Week
      const firstDaySelect = document.getElementById('settings-first-day');
      if (firstDaySelect) firstDaySelect.value = String(settings.firstDayOfWeek ?? 6);

      // Auto Complete Lecture
      const autoLecToggle = document.getElementById('settings-auto-complete-lec');
      if (autoLecToggle) autoLecToggle.checked = !!settings.autoCompleteLectureWithTask;

      // Default Task Priority
      const defPrioritySelect = document.getElementById('settings-default-priority');
      if (defPrioritySelect) defPrioritySelect.value = settings.defaultTaskPriority || 'Medium';

      // Notifications
      const notifToggle = document.getElementById('settings-notifications-toggle');
      if (notifToggle) notifToggle.checked = !!settings.notificationsEnabled;
    },

    bindEvents() {
      // Save General Preferences
      const savePrefsBtn = document.getElementById('btn-save-settings');
      if (savePrefsBtn) {
        savePrefsBtn.addEventListener('click', () => this.savePreferences());
      }

      // Reset Exam Date in Settings
      const resetExamBtn = document.getElementById('btn-settings-reset-exam');
      if (resetExamBtn) {
        resetExamBtn.addEventListener('click', () => {
          window.StorageService.resetExamDate();
          this.loadSettingsToUI();
          window.UI.showToast('Reset exam date to February 19, 2027', 'info');
        });
      }

      // Notification Toggle Permission Request
      const notifToggle = document.getElementById('settings-notifications-toggle');
      if (notifToggle) {
        notifToggle.addEventListener('change', async (e) => {
          if (e.target.checked) {
            if ('Notification' in window) {
              const perm = await Notification.requestPermission();
              if (perm === 'granted') {
                window.UI.showToast('Browser notifications enabled', 'success');
              } else {
                e.target.checked = false;
                window.UI.showToast('Notification permission was denied by browser', 'error');
              }
            } else {
              e.target.checked = false;
              window.UI.showToast('Your browser does not support Web Notifications', 'error');
            }
          }
        });
      }

      // JSON Backup Export
      const exportJsonBtn = document.getElementById('btn-export-json');
      if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', () => this.downloadJSONBackup());
      }

      // JSON Backup Import
      const importInput = document.getElementById('input-import-json-file');
      const importJsonBtn = document.getElementById('btn-trigger-import-json');
      if (importJsonBtn && importInput) {
        importJsonBtn.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', (e) => this.handleJSONFileSelected(e));
      }

      // CSV Exports
      const exportSubjCsvBtn = document.getElementById('btn-export-subjects-csv');
      if (exportSubjCsvBtn) {
        exportSubjCsvBtn.addEventListener('click', () => this.downloadSubjectsCSV());
      }

      const exportTasksCsvBtn = document.getElementById('btn-export-tasks-csv');
      if (exportTasksCsvBtn) {
        exportTasksCsvBtn.addEventListener('click', () => this.downloadTasksCSV());
      }

      // Restore Default Subjects
      const restoreDefaultsBtn = document.getElementById('btn-restore-default-subjects');
      if (restoreDefaultsBtn) {
        restoreDefaultsBtn.addEventListener('click', () => {
          window.UI.confirm(
            'Restore Default Curriculum',
            'This will reload the official 5 fourth-year medical subjects and categories. Custom added subjects may be overwritten. Proceed?',
            'Restore Defaults',
            () => {
              window.StorageService.restoreDefaultSubjects();
              window.UI.showToast('Restored default medical curriculum', 'success');
            }
          );
        });
      }

      // Reset All Data
      const resetAllBtn = document.getElementById('btn-reset-all-data');
      if (resetAllBtn) {
        resetAllBtn.addEventListener('click', () => {
          window.UI.confirm(
            'Reset All Application Data',
            'DANGER: This action cannot be undone. All your custom subjects, lecture completions, calendar tasks, notes, and activity records will be cleared. Do you want to proceed?',
            'Wipe & Reset Everything',
            () => {
              window.StorageService.resetAllData();
              window.UI.showToast('All application data has been reset', 'info');
            }
          );
        });
      }
    },

    savePreferences() {
      const examInput = document.getElementById('settings-exam-date');
      const themeSelect = document.getElementById('settings-theme-select');
      const calViewSelect = document.getElementById('settings-cal-view');
      const firstDaySelect = document.getElementById('settings-first-day');
      const autoLecToggle = document.getElementById('settings-auto-complete-lec');
      const defPrioritySelect = document.getElementById('settings-default-priority');
      const notifToggle = document.getElementById('settings-notifications-toggle');

      const newSettings = {
        theme: themeSelect ? themeSelect.value : 'navy-gold-classic',
        defaultCalendarView: calViewSelect ? calViewSelect.value : 'month',
        firstDayOfWeek: firstDaySelect ? parseInt(firstDaySelect.value, 10) : 6,
        autoCompleteLectureWithTask: autoLecToggle ? autoLecToggle.checked : false,
        defaultTaskPriority: defPrioritySelect ? defPrioritySelect.value : 'Medium',
        notificationsEnabled: notifToggle ? notifToggle.checked : false
      };

      if (examInput && examInput.value) {
        newSettings.examDate = examInput.value;
        window.StorageService.setExamDate(examInput.value);
      }

      window.StorageService.saveSettings(newSettings);
      document.documentElement.setAttribute('data-theme', newSettings.theme);
      window.UI.showToast('Preferences saved successfully', 'success');
    },

    downloadJSONBackup() {
      const jsonStr = window.StorageService.exportJSON();
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `rabea_med_backup_${dateStr}.json`;

      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      window.UI.showToast('Application backup downloaded successfully', 'success');
    },

    handleJSONFileSelected(e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        window.UI.confirm(
          'Import Backup',
          `Are you sure you want to restore application data from "${file.name}"? This will replace your current study records.`,
          'Import & Replace',
          () => {
            const result = window.StorageService.importJSON(content);
            if (result.success) {
              window.UI.showToast('Backup restored successfully!', 'success');
              this.loadSettingsToUI();
            } else {
              window.UI.showToast(`Import failed: ${result.error}`, 'error');
            }
          }
        );
      };
      reader.readAsText(file);
      e.target.value = ''; // Reset input
    },

    downloadSubjectsCSV() {
      const csvStr = window.StorageService.exportSubjectsCSV();
      const dateStr = new Date().toISOString().split('T')[0];
      this.triggerDownload(`rabea_med_curriculum_${dateStr}.csv`, csvStr, 'text/csv');
      window.UI.showToast('Subjects CSV downloaded', 'success');
    },

    downloadTasksCSV() {
      const csvStr = window.StorageService.exportTasksCSV();
      const dateStr = new Date().toISOString().split('T')[0];
      this.triggerDownload(`rabea_med_tasks_${dateStr}.csv`, csvStr, 'text/csv');
      window.UI.showToast('Tasks CSV downloaded', 'success');
    },

    triggerDownload(filename, content, mimeType) {
      const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  window.SettingsManager = SettingsManager;
})();
