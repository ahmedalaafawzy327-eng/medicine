/**
 * Task Management & Today's Agenda Controller for "رابعة طب"
 * Handles task CRUD, Today's Tasks view with date navigation, and lecture synchronization.
 */

(function () {
  'use strict';

  const TasksManager = {
    selectedDate: new Date().toISOString().split('T')[0],
    filterPriority: 'all',
    filterStatus: 'all',
    groupBy: 'priority', // 'priority' | 'time'

    init() {
      this.bindEvents();
      this.renderTodayView();

      window.StorageService.subscribe((evt) => {
        if (evt === 'tasksChanged' || evt === 'dataImported' || evt === 'allDataReset') {
          this.renderTodayView();
        }
      });

      window.addEventListener('viewChanged', (e) => {
        if (e.detail.view === 'today') {
          this.renderTodayView();
        }
      });
    },

    bindEvents() {
      // Add task button on Today's page
      const btnAddToday = document.getElementById('btn-add-today-task');
      if (btnAddToday) {
        btnAddToday.addEventListener('click', () => {
          this.openTaskModal(null, this.selectedDate);
        });
      }

      // Date navigation on Today's page (Prev, Today, Next)
      const btnPrevDay = document.getElementById('btn-prev-day');
      const btnNextDay = document.getElementById('btn-next-day');
      const btnJumpToday = document.getElementById('btn-jump-today');

      if (btnPrevDay) {
        btnPrevDay.addEventListener('click', () => this.shiftDay(-1));
      }
      if (btnNextDay) {
        btnNextDay.addEventListener('click', () => this.shiftDay(1));
      }
      if (btnJumpToday) {
        btnJumpToday.addEventListener('click', () => {
          this.selectedDate = new Date().toISOString().split('T')[0];
          this.renderTodayView();
        });
      }

      // Save task from modal
      const btnSaveTask = document.getElementById('btn-save-task-modal');
      if (btnSaveTask) {
        btnSaveTask.addEventListener('click', () => this.saveTaskFromModal());
      }

      // Task filter and group controls
      const filterPri = document.getElementById('today-filter-priority');
      const filterStat = document.getElementById('today-filter-status');
      const groupSel = document.getElementById('today-group-by');

      if (filterPri) {
        filterPri.addEventListener('change', (e) => {
          this.filterPriority = e.target.value;
          this.renderTodayView();
        });
      }
      if (filterStat) {
        filterStat.addEventListener('change', (e) => {
          this.filterStatus = e.target.value;
          this.renderTodayView();
        });
      }
      if (groupSel) {
        groupSel.addEventListener('change', (e) => {
          this.groupBy = e.target.value;
          this.renderTodayView();
        });
      }
    },

    shiftDay(daysOffset) {
      const parts = this.selectedDate.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      d.setDate(d.getDate() + daysOffset);
      const pad = (n) => String(n).padStart(2, '0');
      this.selectedDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      this.renderTodayView();
    },

    getTasksForDate(dateStr) {
      let tasks = window.StorageService.getTasks().filter(t => t.date === dateStr);

      if (this.filterPriority !== 'all') {
        tasks = tasks.filter(t => t.priority === this.filterPriority);
      }
      if (this.filterStatus !== 'all') {
        tasks = tasks.filter(t => t.status === this.filterStatus);
      }

      return tasks;
    },

    renderTodayView() {
      const isActualToday = this.selectedDate === new Date().toISOString().split('T')[0];
      const parts = this.selectedDate.split('-');
      const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));

      // Update date header
      const dayNameEl = document.getElementById('today-day-name');
      const fullDateEl = document.getElementById('today-full-date');
      const isTodayBadge = document.getElementById('today-badge-indicator');

      const weekdayStr = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      const fullDateStr = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      if (dayNameEl) dayNameEl.textContent = weekdayStr;
      if (fullDateEl) fullDateEl.textContent = fullDateStr;
      if (isTodayBadge) {
        isTodayBadge.style.display = isActualToday ? 'inline-flex' : 'none';
      }

      const allTasksToday = window.StorageService.getTasks().filter(t => t.date === this.selectedDate);
      const completedTasks = allTasksToday.filter(t => t.status === 'Completed').length;
      const totalTasks = allTasksToday.length;
      const pendingTasks = totalTasks - completedTasks;
      const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Update progress metrics
      const setEl = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      setEl('today-total-tasks-count', totalTasks);
      setEl('today-completed-tasks-count', completedTasks);
      setEl('today-pending-tasks-count', pendingTasks);
      setEl('today-completion-pct', `${pct}%`);

      const progressBar = document.getElementById('today-progress-bar');
      if (progressBar) progressBar.style.width = `${pct}%`;

      // Render tasks list container
      const container = document.getElementById('today-tasks-list-container');
      if (!container) return;

      const tasksToDisplay = this.getTasksForDate(this.selectedDate);

      if (tasksToDisplay.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon"><i class="fas fa-clipboard-list"></i></div>
            <div class="empty-state-title">No tasks for this day</div>
            <div class="empty-state-text">Keep your momentum going! Schedule clinical topics, rounds review, or MCQ practice.</div>
            <button class="btn btn-gold" id="btn-add-first-task-today">
              <i class="fas fa-plus"></i> Add Your First Task
            </button>
          </div>
        `;
        const addFirstBtn = container.querySelector('#btn-add-first-task-today');
        if (addFirstBtn) {
          addFirstBtn.addEventListener('click', () => {
            this.openTaskModal(null, this.selectedDate);
          });
        }
        return;
      }

      // Group tasks
      let groups = {};
      if (this.groupBy === 'priority') {
        groups = { Urgent: [], High: [], Medium: [], Low: [] };
        tasksToDisplay.forEach(t => {
          const p = t.priority || 'Medium';
          if (!groups[p]) groups[p] = [];
          groups[p].push(t);
        });
      } else {
        // Group by Morning / Afternoon / Evening / Anytime
        groups = { 'Morning (Before 12 PM)': [], 'Afternoon (12 PM - 5 PM)': [], 'Evening (After 5 PM)': [], 'Flexible / Anytime': [] };
        tasksToDisplay.forEach(t => {
          if (!t.startTime) {
            groups['Flexible / Anytime'].push(t);
          } else {
            const hour = parseInt(t.startTime.split(':')[0], 10);
            if (hour < 12) groups['Morning (Before 12 PM)'].push(t);
            else if (hour < 17) groups['Afternoon (12 PM - 5 PM)'].push(t);
            else groups['Evening (After 5 PM)'].push(t);
          }
        });
      }

      let html = '';
      for (const [groupName, groupTasks] of Object.entries(groups)) {
        if (groupTasks.length === 0) continue;

        html += `
          <div style="margin-bottom: 22px;">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--navy-deep); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
              <span>${groupName}</span>
              <span class="badge badge-navy" style="font-size: 0.7rem;">${groupTasks.length}</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
        `;

        groupTasks.forEach(task => {
          const isCompleted = task.status === 'Completed';
          const subj = window.StorageService.getSubject(task.subjectId);
          const subjName = subj ? subj.name : 'General Task';
          const priorityClass = `badge-priority-${(task.priority || 'medium').toLowerCase()}`;
          const lec = task.lectureId ? window.StorageService.findLecture(task.lectureId)?.lecture : null;

          html += `
            <div class="task-item-card ${isCompleted ? 'completed' : ''}" data-task-id="${task.id}">
              <label class="custom-checkbox">
                <input type="checkbox" class="today-task-checkbox" ${isCompleted ? 'checked' : ''} data-task-id="${task.id}">
                <span class="checkmark"></span>
              </label>

              <div class="task-info-col">
                <div class="task-title">${window.UI.escapeHTML(task.title)}</div>
                ${task.description ? `<div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 4px;">${window.UI.escapeHTML(task.description)}</div>` : ''}
                
                <div class="task-meta">
                  <span class="task-meta-item"><i class="fas fa-book-medical"></i> ${window.UI.escapeHTML(subjName)}</span>
                  ${lec ? `<span class="task-meta-item" style="color: var(--gold-dark);"><i class="fas fa-graduation-cap"></i> ${window.UI.escapeHTML(lec.title)}</span>` : ''}
                  ${task.startTime ? `<span class="task-meta-item"><i class="far fa-clock"></i> ${task.startTime}${task.endTime ? ' - ' + task.endTime : ''}</span>` : ''}
                  ${task.estimatedMinutes ? `<span class="task-meta-item"><i class="fas fa-hourglass-start"></i> ${task.estimatedMinutes} mins</span>` : ''}
                  <span class="badge ${priorityClass}">${task.priority || 'Medium'}</span>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 8px;">
                <button class="btn btn-sm btn-ghost btn-icon btn-edit-today-task" title="Edit Task" data-id="${task.id}">
                  <i class="far fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-ghost btn-icon btn-delete-today-task" title="Delete Task" data-id="${task.id}" style="color: var(--danger);">
                  <i class="far fa-trash-alt"></i>
                </button>
              </div>
            </div>
          `;
        });

        html += `
            </div>
          </div>
        `;
      }

      container.innerHTML = html;

      // Checkbox event listeners
      container.querySelectorAll('.today-task-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
          const taskId = e.target.getAttribute('data-task-id');
          const isChecked = e.target.checked;
          const updated = window.StorageService.toggleTaskStatus(taskId);
          
          if (updated && isChecked && updated.lectureId) {
            const found = window.StorageService.findLecture(updated.lectureId);
            if (found && !found.lecture.completed) {
              // Ask user if they wish to mark lecture as completed
              window.UI.confirm(
                'Complete Associated Lecture?',
                `Would you also like to mark "${found.lecture.title}" as completed in ${found.subject.name}?`,
                'Mark Lecture Completed',
                () => {
                  window.StorageService.updateLecture(updated.lectureId, { completed: true, status: 'Completed' });
                  window.UI.showToast('Lecture and task completed!', 'success');
                }
              );
            }
          }
          window.UI.showToast(`Task marked as ${isChecked ? 'completed' : 'pending'}`, 'info');
        });
      });

      // Edit and Delete buttons
      container.querySelectorAll('.btn-edit-today-task').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          this.openTaskModal(id);
        });
      });

      container.querySelectorAll('.btn-delete-today-task').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          window.UI.confirm(
            'Delete Task',
            'Are you sure you want to permanently delete this task?',
            'Delete Task',
            () => {
              window.StorageService.deleteTask(id);
              window.UI.showToast('Task deleted', 'info');
            }
          );
        });
      });
    },

    // --- Task Modal ---
    openTaskModal(taskId = null, defaultDate = null) {
      const modalTitle = document.getElementById('task-modal-title');
      const idInput = document.getElementById('input-task-id');
      const titleInput = document.getElementById('input-task-title');
      const descInput = document.getElementById('input-task-desc');
      const dateInput = document.getElementById('input-task-date');
      const startInput = document.getElementById('input-task-start-time');
      const endInput = document.getElementById('input-task-end-time');
      const subjSelect = document.getElementById('select-task-subject');
      const lecSelect = document.getElementById('select-task-lecture');
      const priSelect = document.getElementById('select-task-priority');
      const statSelect = document.getElementById('select-task-status');
      const durInput = document.getElementById('input-task-duration');
      const notesInput = document.getElementById('input-task-notes');

      // Populate Subjects dropdown
      const subjects = window.StorageService.getSubjects();
      subjSelect.innerHTML = '<option value="">-- No Subject (General Study) --</option>' +
        subjects.map(s => `<option value="${s.id}">${window.UI.escapeHTML(s.name)}</option>`).join('');

      // Populate lectures based on chosen subject
      const updateLecturesDropdown = (subjectId, preselectedLecId = null) => {
        if (!subjectId) {
          lecSelect.innerHTML = '<option value="">-- No Associated Lecture --</option>';
          return;
        }
        const subj = window.StorageService.getSubject(subjectId);
        if (!subj) return;

        let options = '<option value="">-- No Associated Lecture --</option>';
        (subj.categories || []).forEach(cat => {
          if (cat.lectures && cat.lectures.length > 0) {
            options += `<optgroup label="${window.UI.escapeHTML(cat.name)}">`;
            cat.lectures.forEach(l => {
              options += `<option value="${l.id}">${window.UI.escapeHTML(l.title)}</option>`;
            });
            options += '</optgroup>';
          }
        });
        lecSelect.innerHTML = options;
        if (preselectedLecId) lecSelect.value = preselectedLecId;
      };

      subjSelect.onchange = () => updateLecturesDropdown(subjSelect.value);

      if (taskId) {
        modalTitle.textContent = 'Edit Task';
        const task = window.StorageService.getTask(taskId);
        if (!task) return;

        idInput.value = task.id;
        titleInput.value = task.title;
        descInput.value = task.description || '';
        dateInput.value = task.date;
        startInput.value = task.startTime || '';
        endInput.value = task.endTime || '';
        subjSelect.value = task.subjectId || '';
        updateLecturesDropdown(task.subjectId, task.lectureId);
        priSelect.value = task.priority || 'Medium';
        statSelect.value = task.status || 'Pending';
        durInput.value = task.estimatedMinutes || 60;
        notesInput.value = task.notes || '';
      } else {
        modalTitle.textContent = 'Create New Study Task';
        idInput.value = '';
        titleInput.value = '';
        descInput.value = '';
        dateInput.value = defaultDate || new Date().toISOString().split('T')[0];
        startInput.value = '10:00';
        endInput.value = '11:30';
        subjSelect.value = '';
        updateLecturesDropdown('');
        priSelect.value = window.StorageService.getSettings().defaultTaskPriority || 'Medium';
        statSelect.value = 'Pending';
        durInput.value = 60;
        notesInput.value = '';
      }

      window.UI.openModal('modal-task');
    },

    saveTaskFromModal() {
      const id = document.getElementById('input-task-id').value;
      const title = document.getElementById('input-task-title').value.trim();
      const description = document.getElementById('input-task-desc').value.trim();
      const date = document.getElementById('input-task-date').value;
      const startTime = document.getElementById('input-task-start-time').value;
      const endTime = document.getElementById('input-task-end-time').value;
      const subjectId = document.getElementById('select-task-subject').value || null;
      const lectureId = document.getElementById('select-task-lecture').value || null;
      const priority = document.getElementById('select-task-priority').value;
      const status = document.getElementById('select-task-status').value;
      const estimatedMinutes = Number(document.getElementById('input-task-duration').value) || 60;
      const notes = document.getElementById('input-task-notes').value.trim();

      if (!title) {
        window.UI.showToast('Please enter a task title', 'error');
        return;
      }
      if (!date) {
        window.UI.showToast('Please select a scheduled date', 'error');
        return;
      }

      window.StorageService.saveTask({
        id: id || undefined,
        title,
        description,
        date,
        startTime,
        endTime,
        subjectId,
        lectureId,
        priority,
        status,
        estimatedMinutes,
        notes
      });

      window.UI.closeModal('modal-task');
      window.UI.showToast('Task saved successfully', 'success');
      this.renderTodayView();
    }
  };

  window.TasksManager = TasksManager;
})();
