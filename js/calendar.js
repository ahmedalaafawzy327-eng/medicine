/**
 * Interactive Academic Calendar for "رابعة طب"
 * Full Month, Week, and Day views with real leap years, task indicators, and date details panel.
 */

(function () {
  'use strict';

  const Calendar = {
    currentDate: new Date(),
    selectedDateStr: new Date().toISOString().split('T')[0],
    viewMode: 'month', // 'month' | 'week' | 'day'
    filterSubject: 'all',
    filterPriority: 'all',
    filterStatus: 'all',

    init() {
      // Load preference from settings
      const settings = window.StorageService.getSettings();
      if (settings && settings.defaultCalendarView) {
        this.viewMode = settings.defaultCalendarView;
      }

      this.bindEvents();
      this.render();

      window.StorageService.subscribe((evt) => {
        if (evt === 'tasksChanged' || evt === 'subjectsChanged' || evt === 'dataImported' || evt === 'allDataReset') {
          this.render();
        }
      });

      window.addEventListener('viewChanged', (e) => {
        if (e.detail.view === 'calendar') {
          this.render();
        }
      });
    },

    bindEvents() {
      // Month/view navigation
      const prevBtn = document.getElementById('cal-btn-prev');
      const nextBtn = document.getElementById('cal-btn-next');
      const todayBtn = document.getElementById('cal-btn-today');
      const jumpPicker = document.getElementById('cal-jump-date-picker');

      if (prevBtn) prevBtn.addEventListener('click', () => this.navigate(-1));
      if (nextBtn) nextBtn.addEventListener('click', () => this.navigate(1));
      if (todayBtn) {
        todayBtn.addEventListener('click', () => {
          this.currentDate = new Date();
          this.selectedDateStr = new Date().toISOString().split('T')[0];
          this.render();
        });
      }
      if (jumpPicker) {
        jumpPicker.addEventListener('change', (e) => {
          if (e.target.value) {
            const parts = e.target.value.split('-');
            this.currentDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            this.selectedDateStr = e.target.value;
            this.render();
          }
        });
      }

      // View mode toggles
      document.querySelectorAll('.calendar-toggle-btn[data-mode]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.viewMode = e.currentTarget.getAttribute('data-mode');
          document.querySelectorAll('.calendar-toggle-btn').forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');
          this.render();
        });
      });

      // Filter controls
      const subFilter = document.getElementById('cal-filter-subject');
      const priFilter = document.getElementById('cal-filter-priority');
      const statFilter = document.getElementById('cal-filter-status');

      if (subFilter) {
        subFilter.addEventListener('change', (e) => {
          this.filterSubject = e.target.value;
          this.render();
        });
      }
      if (priFilter) {
        priFilter.addEventListener('change', (e) => {
          this.filterPriority = e.target.value;
          this.render();
        });
      }
      if (statFilter) {
        statFilter.addEventListener('change', (e) => {
          this.filterStatus = e.target.value;
          this.render();
        });
      }

      // Add task to selected date button in the details panel
      const addDateTaskBtn = document.getElementById('btn-cal-add-task-date');
      if (addDateTaskBtn) {
        addDateTaskBtn.addEventListener('click', () => {
          if (window.TasksManager) {
            window.TasksManager.openTaskModal(null, this.selectedDateStr);
          }
        });
      }
    },

    navigate(direction) {
      if (this.viewMode === 'month') {
        this.currentDate.setDate(1);
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
      } else if (this.viewMode === 'week') {
        this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
      } else if (this.viewMode === 'day') {
        this.currentDate.setDate(this.currentDate.getDate() + direction);
        const pad = (n) => String(n).padStart(2, '0');
        this.selectedDateStr = `${this.currentDate.getFullYear()}-${pad(this.currentDate.getMonth() + 1)}-${pad(this.currentDate.getDate())}`;
      }
      this.render();
    },

    getFilteredTasks() {
      let tasks = window.StorageService.getTasks();

      if (this.filterSubject !== 'all') {
        tasks = tasks.filter(t => t.subjectId === this.filterSubject);
      }
      if (this.filterPriority !== 'all') {
        tasks = tasks.filter(t => t.priority === this.filterPriority);
      }
      if (this.filterStatus !== 'all') {
        tasks = tasks.filter(t => t.status === this.filterStatus);
      }

      return tasks;
    },

    populateSubjectFilterOptions() {
      const subFilter = document.getElementById('cal-filter-subject');
      if (!subFilter) return;
      const currentVal = subFilter.value;
      const subjects = window.StorageService.getSubjects();
      subFilter.innerHTML = '<option value="all">All Subjects</option>' +
        subjects.map(s => `<option value="${s.id}">${window.UI.escapeHTML(s.name)}</option>`).join('');
      subFilter.value = currentVal || 'all';
    },

    render() {
      this.populateSubjectFilterOptions();

      // Update current month/year title
      const titleEl = document.getElementById('cal-current-label');
      if (titleEl) {
        if (this.viewMode === 'month') {
          titleEl.textContent = this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        } else if (this.viewMode === 'week') {
          titleEl.textContent = `Week of ${this.currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        } else {
          titleEl.textContent = this.currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        }
      }

      // Update active toggle button
      document.querySelectorAll('.calendar-toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-mode') === this.viewMode);
      });

      if (this.viewMode === 'month') {
        this.renderMonthView();
      } else if (this.viewMode === 'week') {
        this.renderWeekView();
      } else {
        this.renderDayView();
      }

      this.renderSelectedDatePanel();
    },

    renderMonthView() {
      const container = document.getElementById('cal-view-container');
      if (!container) return;

      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const totalDays = lastDayOfMonth.getDate();

      const pad = (n) => String(n).padStart(2, '0');
      const todayStr = new Date().toISOString().split('T')[0];

      // Settings: firstDayOfWeek (6 = Saturday, 0 = Sunday, 1 = Monday)
      const firstDaySetting = window.StorageService.getSettings().firstDayOfWeek ?? 6;
      const dayNames = firstDaySetting === 6
        ? ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
        : firstDaySetting === 1
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      const startDayIndex = (firstDayOfMonth.getDay() - firstDaySetting + 7) % 7;

      const filteredTasks = this.getFilteredTasks();

      let html = '<div class="calendar-month-grid">';

      // Header row
      dayNames.forEach(name => {
        html += `<div class="calendar-day-header">${name}</div>`;
      });

      // Previous month padding days
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = startDayIndex - 1; i >= 0; i--) {
        const dayNum = prevMonthLastDay - i;
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const dateStr = `${prevYear}-${pad(prevMonth + 1)}-${pad(dayNum)}`;

        html += `
          <div class="calendar-cell other-month" data-date="${dateStr}">
            <div class="cell-top">
              <span class="cell-date-num">${dayNum}</span>
            </div>
          </div>
        `;
      }

      // Current month days
      for (let d = 1; d <= totalDays; d++) {
        const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
        const isToday = dateStr === todayStr;
        const isSelected = dateStr === this.selectedDateStr;
        const dayTasks = filteredTasks.filter(t => t.date === dateStr);

        html += `
          <div class="calendar-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-date="${dateStr}">
            <div class="cell-top">
              <span class="cell-date-num">${d}</span>
              ${dayTasks.length > 0 ? `<span class="badge badge-gold" style="font-size: 0.68rem; padding: 1px 6px;">${dayTasks.length}</span>` : ''}
            </div>
            <div class="cell-tasks-list">
        `;

        // Render mini task chips (up to 3)
        dayTasks.slice(0, 3).forEach(task => {
          html += `
            <div class="calendar-task-chip ${task.status === 'Completed' ? 'completed' : ''} priority-${(task.priority || 'medium').toLowerCase()}" title="${window.UI.escapeHTML(task.title)}">
              ${task.startTime ? task.startTime + ' ' : ''}${window.UI.escapeHTML(task.title)}
            </div>
          `;
        });

        if (dayTasks.length > 3) {
          html += `<div style="font-size: 0.68rem; color: var(--gold-dark); font-weight: 600;">+${dayTasks.length - 3} more</div>`;
        }

        html += `
            </div>
          </div>
        `;
      }

      // Next month padding days to complete full grid
      const totalCells = startDayIndex + totalDays;
      const nextMonthPadding = (7 - (totalCells % 7)) % 7;
      for (let d = 1; d <= nextMonthPadding; d++) {
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        const dateStr = `${nextYear}-${pad(nextMonth + 1)}-${pad(d)}`;

        html += `
          <div class="calendar-cell other-month" data-date="${dateStr}">
            <div class="cell-top">
              <span class="cell-date-num">${d}</span>
            </div>
          </div>
        `;
      }

      html += '</div>';
      container.innerHTML = html;

      // Add cell click listener
      container.querySelectorAll('.calendar-cell').forEach(cell => {
        cell.addEventListener('click', () => {
          const clickedDate = cell.getAttribute('data-date');
          if (clickedDate) {
            this.selectedDateStr = clickedDate;
            container.querySelectorAll('.calendar-cell').forEach(c => c.classList.remove('selected'));
            cell.classList.add('selected');
            this.renderSelectedDatePanel();
          }
        });
      });
    },

    renderWeekView() {
      const container = document.getElementById('cal-view-container');
      if (!container) return;

      const pad = (n) => String(n).padStart(2, '0');
      const todayStr = new Date().toISOString().split('T')[0];

      // Determine start of week
      const curr = new Date(this.currentDate);
      const firstDaySetting = window.StorageService.getSettings().firstDayOfWeek ?? 6;
      const dayOffset = (curr.getDay() - firstDaySetting + 7) % 7;
      curr.setDate(curr.getDate() - dayOffset);

      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(curr);
        d.setDate(curr.getDate() + i);
        const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        weekDates.push({ dateObj: d, dateStr });
      }

      const filteredTasks = this.getFilteredTasks();

      let html = '<div class="calendar-month-grid">';
      weekDates.forEach(({ dateObj }) => {
        html += `<div class="calendar-day-header">${dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}</div>`;
      });

      weekDates.forEach(({ dateStr, dateObj }) => {
        const isToday = dateStr === todayStr;
        const isSelected = dateStr === this.selectedDateStr;
        const dayTasks = filteredTasks.filter(t => t.date === dateStr);

        html += `
          <div class="calendar-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-date="${dateStr}" style="min-height: 260px;">
            <div class="cell-top">
              <span class="cell-date-num">${dateObj.getDate()}</span>
              ${dayTasks.length > 0 ? `<span class="badge badge-gold">${dayTasks.length}</span>` : ''}
            </div>
            <div class="cell-tasks-list">
        `;

        dayTasks.forEach(task => {
          html += `
            <div class="calendar-task-chip ${task.status === 'Completed' ? 'completed' : ''} priority-${(task.priority || 'medium').toLowerCase()}" style="white-space: normal; margin-bottom: 4px;">
              <strong>${task.startTime || 'All-day'}:</strong> ${window.UI.escapeHTML(task.title)}
            </div>
          `;
        });

        html += `
            </div>
          </div>
        `;
      });

      html += '</div>';
      container.innerHTML = html;

      container.querySelectorAll('.calendar-cell').forEach(cell => {
        cell.addEventListener('click', () => {
          const clickedDate = cell.getAttribute('data-date');
          if (clickedDate) {
            this.selectedDateStr = clickedDate;
            container.querySelectorAll('.calendar-cell').forEach(c => c.classList.remove('selected'));
            cell.classList.add('selected');
            this.renderSelectedDatePanel();
          }
        });
      });
    },

    renderDayView() {
      const container = document.getElementById('cal-view-container');
      if (!container) return;

      const dateStr = this.selectedDateStr;
      const tasks = this.getFilteredTasks().filter(t => t.date === dateStr);

      let html = `
        <div class="card" style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--navy-deep);">
              Agenda for ${new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <span class="badge badge-gold">${tasks.length} Scheduled Tasks</span>
          </div>
      `;

      if (tasks.length === 0) {
        html += `
          <div class="empty-state">
            <div class="empty-state-icon"><i class="far fa-calendar-check"></i></div>
            <div class="empty-state-title">No tasks for this day</div>
            <div class="empty-state-text">You have no tasks scheduled on this date. Click below to add one.</div>
          </div>
        `;
      } else {
        html += '<div style="display: flex; flex-direction: column; gap: 12px;">';
        tasks.forEach(task => {
          const isCompleted = task.status === 'Completed';
          const subj = window.StorageService.getSubject(task.subjectId);
          html += `
            <div class="task-item-card ${isCompleted ? 'completed' : ''}">
              <label class="custom-checkbox">
                <input type="checkbox" class="cal-day-task-cb" ${isCompleted ? 'checked' : ''} data-id="${task.id}">
                <span class="checkmark"></span>
              </label>
              <div class="task-info-col">
                <div class="task-title">${window.UI.escapeHTML(task.title)}</div>
                <div class="task-meta">
                  <span>${subj ? subj.name : 'General'}</span>
                  ${task.startTime ? `<span><i class="far fa-clock"></i> ${task.startTime} - ${task.endTime || ''}</span>` : ''}
                  <span class="badge badge-priority-${(task.priority || 'medium').toLowerCase()}">${task.priority}</span>
                </div>
              </div>
            </div>
          `;
        });
        html += '</div>';
      }

      html += '</div>';
      container.innerHTML = html;

      container.querySelectorAll('.cal-day-task-cb').forEach(cb => {
        cb.addEventListener('change', (e) => {
          window.StorageService.toggleTaskStatus(e.target.getAttribute('data-id'));
          this.render();
        });
      });
    },

    renderSelectedDatePanel() {
      const titleEl = document.getElementById('cal-panel-selected-date');
      const listEl = document.getElementById('cal-panel-tasks-list');
      if (!titleEl || !listEl) return;

      const d = new Date(this.selectedDateStr + 'T00:00:00');
      titleEl.textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

      const tasks = this.getFilteredTasks().filter(t => t.date === this.selectedDateStr);

      if (tasks.length === 0) {
        listEl.innerHTML = `
          <div style="padding: 16px 0; color: var(--text-muted); font-size: 0.88rem;">
            No tasks scheduled for this day yet. Click "+ Add Task for This Date" above.
          </div>
        `;
        return;
      }

      let html = '';
      tasks.forEach(task => {
        const isCompleted = task.status === 'Completed';
        const subj = window.StorageService.getSubject(task.subjectId);
        const priorityBadge = `badge-priority-${(task.priority || 'medium').toLowerCase()}`;

        html += `
          <div class="task-item-card ${isCompleted ? 'completed' : ''}" style="margin-bottom: 8px;">
            <label class="custom-checkbox">
              <input type="checkbox" class="cal-panel-cb" ${isCompleted ? 'checked' : ''} data-id="${task.id}">
              <span class="checkmark"></span>
            </label>
            <div class="task-info-col">
              <div class="task-title">${window.UI.escapeHTML(task.title)}</div>
              <div class="task-meta">
                <span>${subj ? subj.name : 'General'}</span>
                ${task.startTime ? `<span><i class="far fa-clock"></i> ${task.startTime}${task.endTime ? ' - ' + task.endTime : ''}</span>` : ''}
                <span class="badge ${priorityBadge}">${task.priority}</span>
              </div>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-sm btn-ghost btn-icon btn-edit-cal-task" data-id="${task.id}" title="Edit Task">
                <i class="far fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-ghost btn-icon btn-del-cal-task" data-id="${task.id}" title="Delete Task" style="color: var(--danger);">
                <i class="far fa-trash-alt"></i>
              </button>
            </div>
          </div>
        `;
      });

      listEl.innerHTML = html;

      listEl.querySelectorAll('.cal-panel-cb').forEach(cb => {
        cb.addEventListener('change', (e) => {
          window.StorageService.toggleTaskStatus(e.target.getAttribute('data-id'));
          this.render();
        });
      });

      listEl.querySelectorAll('.btn-edit-cal-task').forEach(btn => {
        btn.addEventListener('click', () => {
          if (window.TasksManager) {
            window.TasksManager.openTaskModal(btn.getAttribute('data-id'));
          }
        });
      });

      listEl.querySelectorAll('.btn-del-cal-task').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          window.UI.confirm('Delete Task', 'Are you sure you want to delete this task?', 'Delete Task', () => {
            window.StorageService.deleteTask(id);
            this.render();
          });
        });
      });
    }
  };

  window.Calendar = Calendar;
})();
