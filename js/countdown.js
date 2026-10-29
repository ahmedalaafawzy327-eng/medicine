/**
 * Countdown Engine for "رابعة طب"
 * Live second-by-second countdown to the final medical examination.
 */

(function () {
  'use strict';

  let countdownInterval = null;

  const Countdown = {
    init() {
      this.updateCountdown();
      countdownInterval = setInterval(() => this.updateCountdown(), 1000);
      this.bindEvents();

      // Listen to storage changes
      window.StorageService.subscribe((evt) => {
        if (evt === 'examDateChanged' || evt === 'dataImported' || evt === 'allDataReset') {
          this.updateCountdown();
        }
      });
    },

    bindEvents() {
      // Edit exam date button in hero card
      const editBtn = document.getElementById('btn-edit-exam-date');
      if (editBtn) {
        editBtn.addEventListener('click', () => this.openEditModal());
      }

      // Quick action in dashboard
      const quickEditBtn = document.getElementById('quick-action-edit-exam');
      if (quickEditBtn) {
        quickEditBtn.addEventListener('click', () => this.openEditModal());
      }

      // Modal save button
      const saveBtn = document.getElementById('btn-save-exam-date');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => this.saveExamDate());
      }

      // Modal reset to default button
      const resetBtn = document.getElementById('btn-reset-exam-date');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => this.resetToDefault());
      }
    },

    openEditModal() {
      const currentIso = window.StorageService.getExamDate();
      const input = document.getElementById('input-exam-datetime');
      if (input) {
        // Format to YYYY-MM-DDTHH:mm
        const dateObj = new Date(currentIso);
        if (!isNaN(dateObj.getTime())) {
          const pad = (n) => String(n).padStart(2, '0');
          const localIso = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
          input.value = localIso;
        }
      }
      window.UI.openModal('modal-edit-exam-date');
    },

    saveExamDate() {
      const input = document.getElementById('input-exam-datetime');
      if (!input || !input.value) {
        window.UI.showToast('Please select a valid date and time.', 'error');
        return;
      }

      const selectedDate = new Date(input.value);
      if (isNaN(selectedDate.getTime())) {
        window.UI.showToast('Invalid date format.', 'error');
        return;
      }

      window.StorageService.setExamDate(input.value);
      window.UI.closeModal('modal-edit-exam-date');
      window.UI.showToast('Examination date and time updated successfully!', 'success');
      this.updateCountdown();
    },

    resetToDefault() {
      window.StorageService.resetExamDate();
      window.UI.closeModal('modal-edit-exam-date');
      window.UI.showToast('Reset examination date to February 19, 2027.', 'info');
      this.updateCountdown();
    },

    calculate() {
      const targetStr = window.StorageService.getExamDate();
      const targetDate = new Date(targetStr);
      const now = new Date();

      const diffMs = targetDate.getTime() - now.getTime();
      const totalSeconds = Math.floor(diffMs / 1000);

      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);

      let status = 'normal'; // 'normal' | 'approaching' | 'today' | 'passed'
      if (totalSeconds < 0) {
        status = 'passed';
      } else if (days === 0 && now.toDateString() === targetDate.toDateString()) {
        status = 'today';
      } else if (days <= 30) {
        status = 'approaching';
      }

      return {
        targetDate,
        diffMs,
        totalSeconds,
        days: Math.max(0, days),
        hours: Math.max(0, hours),
        minutes: Math.max(0, minutes),
        seconds: Math.max(0, seconds),
        status
      };
    },

    updateCountdown() {
      const calc = this.calculate();

      // Update Hero Elements
      const daysEl = document.getElementById('countdown-days');
      const hoursEl = document.getElementById('countdown-hours');
      const minsEl = document.getElementById('countdown-mins');
      const secsEl = document.getElementById('countdown-secs');
      const statusPill = document.getElementById('countdown-status-pill');
      const targetDateDisplay = document.getElementById('countdown-target-display');
      const sidebarDaysEl = document.getElementById('sidebar-ribbon-days');

      const pad = (n) => String(n).padStart(2, '0');

      if (daysEl) daysEl.textContent = calc.days;
      if (hoursEl) hoursEl.textContent = pad(calc.hours);
      if (minsEl) minsEl.textContent = pad(calc.minutes);
      if (secsEl) secsEl.textContent = pad(calc.seconds);

      // Sidebar ribbon
      if (sidebarDaysEl) {
        sidebarDaysEl.textContent = calc.days;
      }

      // Format target date for display
      if (targetDateDisplay && calc.targetDate) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        targetDateDisplay.textContent = calc.targetDate.toLocaleDateString('en-US', options);
      }

      // Status pill styling & text
      if (statusPill) {
        statusPill.className = 'countdown-pill';
        if (calc.status === 'passed') {
          statusPill.classList.add('status-passed');
          statusPill.innerHTML = '<i class="fas fa-flag-checkered"></i> Exam Concluded';
        } else if (calc.status === 'today') {
          statusPill.classList.add('status-today');
          statusPill.innerHTML = '<i class="fas fa-bell"></i> Examination Today!';
        } else if (calc.status === 'approaching') {
          statusPill.classList.add('status-approaching');
          statusPill.innerHTML = '<i class="fas fa-hourglass-half"></i> Approaching Exam';
        } else {
          statusPill.innerHTML = '<i class="fas fa-hourglass-start"></i> Academic Countdown';
        }
      }

      // Update study days remaining metric on dashboard if present
      const statDaysRemain = document.getElementById('stat-study-days-remain');
      if (statDaysRemain) {
        statDaysRemain.textContent = calc.days;
      }
    }
  };

  window.Countdown = Countdown;
})();
