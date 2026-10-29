/**
 * Dashboard Controller for "رابعة طب"
 * Dynamic KPI calculation, Today's Focus widget, and Quick Actions.
 */

(function () {
  'use strict';

  const Dashboard = {
    init() {
      this.render();
      this.bindQuickActions();

      // Subscribe to Storage updates
      window.StorageService.subscribe((evt) => {
        this.render();
      });

      // Update when switching to dashboard view
      window.addEventListener('viewChanged', (e) => {
        if (e.detail.view === 'dashboard') {
          this.render();
        }
      });
    },

    bindQuickActions() {
      const btnAddTask = document.getElementById('quick-action-add-task');
      if (btnAddTask) {
        btnAddTask.addEventListener('click', () => {
          if (window.TasksManager) {
            window.TasksManager.openTaskModal(null, new Date().toISOString().split('T')[0]);
          }
        });
      }

      const btnAddSubject = document.getElementById('quick-action-add-subject');
      if (btnAddSubject) {
        btnAddSubject.addEventListener('click', () => {
          if (window.SubjectsManager) {
            window.SubjectsManager.openSubjectModal();
          }
        });
      }

      const btnAddLecture = document.getElementById('quick-action-add-lecture');
      if (btnAddLecture) {
        btnAddLecture.addEventListener('click', () => {
          if (window.SubjectsManager) {
            window.SubjectsManager.openLectureModal();
          }
        });
      }

      const btnOpenCalendar = document.getElementById('quick-action-open-calendar');
      if (btnOpenCalendar) {
        btnOpenCalendar.addEventListener('click', () => {
          window.UI.switchView('calendar');
        });
      }

      const btnViewAnalytics = document.getElementById('quick-action-view-analytics');
      if (btnViewAnalytics) {
        btnViewAnalytics.addEventListener('click', () => {
          window.UI.switchView('analytics');
        });
      }

      // Today Focus Actions
      const todayAddTaskBtn = document.getElementById('today-focus-add-task');
      if (todayAddTaskBtn) {
        todayAddTaskBtn.addEventListener('click', () => {
          if (window.TasksManager) {
            window.TasksManager.openTaskModal(null, new Date().toISOString().split('T')[0]);
          }
        });
      }

      const todayOpenCalendarBtn = document.getElementById('today-focus-open-calendar');
      if (todayOpenCalendarBtn) {
        todayOpenCalendarBtn.addEventListener('click', () => {
          window.UI.switchView('calendar');
        });
      }
    },

    computeStats() {
      const subjects = window.StorageService.getSubjects();
      const tasks = window.StorageService.getTasks();
      const todayStr = new Date().toISOString().split('T')[0];

      let totalLectures = 0;
      let completedLectures = 0;

      subjects.forEach(subj => {
        (subj.categories || []).forEach(cat => {
          (cat.lectures || []).forEach(lec => {
            totalLectures++;
            if (lec.completed) completedLectures++;
          });
        });
      });

      const pendingLectures = totalLectures - completedLectures;
      const lectureCompletionPct = totalLectures > 0
        ? Math.round((completedLectures / totalLectures) * 100)
        : 0;

      const todayTasks = tasks.filter(t => t.date === todayStr);
      const todayCompletedTasks = todayTasks.filter(t => t.status === 'Completed').length;
      const todayRemainingTasks = todayTasks.length - todayCompletedTasks;
      const todayCompletionPct = todayTasks.length > 0
        ? Math.round((todayCompletedTasks / todayTasks.length) * 100)
        : 0;

      const countdownCalc = window.Countdown ? window.Countdown.calculate() : { days: 0 };

      return {
        totalSubjects: subjects.length,
        totalLectures,
        completedLectures,
        pendingLectures,
        lectureCompletionPct,
        todayTasks,
        todayCompletedTasks,
        todayRemainingTasks,
        todayCompletionPct,
        studyDaysRemaining: countdownCalc.days
      };
    },

    render() {
      const stats = this.computeStats();

      // Render 8 Overview Cards
      const setEl = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      setEl('stat-total-subjects', stats.totalSubjects);
      setEl('stat-total-lectures', stats.totalLectures);
      setEl('stat-completed-lectures', stats.completedLectures);
      setEl('stat-pending-lectures', stats.pendingLectures);
      setEl('stat-overall-completion', `${stats.lectureCompletionPct}%`);
      setEl('stat-tasks-completed-today', stats.todayCompletedTasks);
      setEl('stat-tasks-remaining-today', stats.todayRemainingTasks);
      setEl('stat-study-days-remain', stats.studyDaysRemaining);

      // Overall Progress Bar on Dashboard
      const progressBar = document.getElementById('dashboard-overall-progress-bar');
      if (progressBar) {
        progressBar.style.width = `${stats.lectureCompletionPct}%`;
      }
      const progressLabel = document.getElementById('dashboard-overall-progress-label');
      if (progressLabel) {
        progressLabel.textContent = `${stats.lectureCompletionPct}% Complete (${stats.completedLectures}/${stats.totalLectures} lectures)`;
      }

      // Render Today's Focus List
      this.renderTodayFocus(stats);

      // Render Subjects Quick Overview in Dashboard
      this.renderSubjectsSummary();
    },

    renderTodayFocus(stats) {
      const container = document.getElementById('dashboard-today-focus-list');
      const progressFill = document.getElementById('dashboard-today-progress-fill');
      const progressText = document.getElementById('dashboard-today-progress-text');

      if (progressFill) progressFill.style.width = `${stats.todayCompletionPct}%`;
      if (progressText) progressText.textContent = `${stats.todayCompletionPct}% (${stats.todayCompletedTasks}/${stats.todayTasks.length} tasks)`;

      if (!container) return;

      if (stats.todayTasks.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="padding: 24px 16px;">
            <div class="empty-state-icon" style="width: 48px; height: 48px; font-size: 1.2rem; margin-bottom: 10px;">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="empty-state-title" style="font-size: 1rem;">No tasks scheduled for today</div>
            <div class="empty-state-text" style="font-size: 0.82rem; margin-bottom: 14px;">Plan your high-yield topics, clinical cases, or lecture revisions.</div>
            <button class="btn btn-sm btn-gold" id="btn-empty-today-add">
              <i class="fas fa-plus"></i> Add Today's First Task
            </button>
          </div>
        `;
        const addFirstBtn = container.querySelector('#btn-empty-today-add');
        if (addFirstBtn) {
          addFirstBtn.addEventListener('click', () => {
            if (window.TasksManager) {
              window.TasksManager.openTaskModal(null, new Date().toISOString().split('T')[0]);
            }
          });
        }
        return;
      }

      let html = '';
      stats.todayTasks.forEach(task => {
        const isCompleted = task.status === 'Completed';
        const subj = window.StorageService.getSubject(task.subjectId);
        const subjName = subj ? subj.name : 'General';
        const priorityClass = `badge-priority-${(task.priority || 'medium').toLowerCase()}`;

        html += `
          <div class="task-item-card ${isCompleted ? 'completed' : ''}" data-task-id="${task.id}">
            <label class="custom-checkbox">
              <input type="checkbox" class="task-checkbox" ${isCompleted ? 'checked' : ''} data-task-id="${task.id}">
              <span class="checkmark"></span>
            </label>
            <div class="task-info-col">
              <div class="task-title">${window.UI.escapeHTML(task.title)}</div>
              <div class="task-meta">
                <span class="task-meta-item"><i class="fas fa-book-medical"></i> ${window.UI.escapeHTML(subjName)}</span>
                ${task.startTime ? `<span class="task-meta-item"><i class="far fa-clock"></i> ${task.startTime}${task.endTime ? ' - ' + task.endTime : ''}</span>` : ''}
                <span class="badge ${priorityClass}">${task.priority || 'Medium'}</span>
              </div>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;

      // Bind checkbox handlers with delegation
      container.querySelectorAll('.task-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
          const taskId = e.target.getAttribute('data-task-id');
          window.StorageService.toggleTaskStatus(taskId);
          window.UI.showToast('Task status updated', 'success');
        });
      });
    },

    renderSubjectsSummary() {
      const container = document.getElementById('dashboard-subjects-summary-list');
      if (!container) return;

      const subjects = window.StorageService.getSubjects();
      if (subjects.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-text">No subjects added yet.</div></div>';
        return;
      }

      let html = '';
      subjects.forEach(subj => {
        let total = 0;
        let completed = 0;
        (subj.categories || []).forEach(c => {
          (c.lectures || []).forEach(l => {
            total++;
            if (l.completed) completed++;
          });
        });
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

        html += `
          <div style="margin-bottom: 14px; padding: 12px 14px; background: var(--bg-card-alt); border-radius: var(--border-radius-sm); border: 1px solid var(--border-light);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-weight: 700; color: var(--navy-deep); font-size: 0.92rem;">${window.UI.escapeHTML(subj.name)}</span>
              <span style="font-size: 0.8rem; font-weight: 700; color: var(--gold-dark);">${pct}% (${completed}/${total})</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
    }
  };

  window.Dashboard = Dashboard;
})();
