/**
 * Storage Service for "رابعة طب"
 * Centralized, versioned localStorage management with event emitter pattern.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'rabea_med_v1_store';
  const listeners = new Set();

  function getDefaultState() {
    return {
      version: 1,
      createdAt: new Date().toISOString(),
      examDate: window.DEFAULT_EXAM_DATE || '2027-02-19T09:00:00',
      settings: JSON.parse(JSON.stringify(window.DEFAULT_SETTINGS || {
        examDate: '2027-02-19T09:00:00',
        theme: 'navy-gold-classic',
        defaultCalendarView: 'month',
        firstDayOfWeek: 6,
        autoCompleteLectureWithTask: false,
        defaultTaskPriority: 'Medium',
        notificationsEnabled: false
      })),
      subjects: JSON.parse(JSON.stringify(window.DEFAULT_SUBJECTS || [])),
      tasks: [
        {
          id: 'task_sample_1',
          title: 'Review Pediatric Respiratory Distress',
          description: 'Focus on grading and urgent interventions',
          date: new Date().toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '11:30',
          subjectId: 'subj_pediatrics',
          lectureId: 'lec_ped_1',
          priority: 'High',
          status: 'Pending',
          estimatedMinutes: 90,
          notes: 'Prepare summary flashcards',
          completedAt: null,
          createdAt: new Date().toISOString()
        },
        {
          id: 'task_sample_2',
          title: 'Anesthesia Airway Management algorithms',
          description: 'Review Mallampati score and difficult airway cart',
          date: new Date().toISOString().split('T')[0],
          startTime: '14:00',
          endTime: '15:15',
          subjectId: 'subj_anesthesia',
          lectureId: 'lec_ane_6',
          priority: 'Medium',
          status: 'Pending',
          estimatedMinutes: 75,
          notes: '',
          completedAt: null,
          createdAt: new Date().toISOString()
        }
      ],
      activityLog: []
    };
  }

  const Storage = {
    state: null,

    init() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.version === 1 && Array.isArray(parsed.subjects)) {
            this.state = parsed;
            // Guarantee required fields exist if older format
            if (!this.state.tasks) this.state.tasks = [];
            if (!this.state.activityLog) this.state.activityLog = [];
            if (!this.state.settings) this.state.settings = getDefaultState().settings;
            if (!this.state.examDate) this.state.examDate = this.state.settings.examDate || '2027-02-19T09:00:00';
            return;
          }
        }
      } catch (e) {
        console.error('Failed to parse existing storage; initializing defaults.', e);
      }

      this.state = getDefaultState();
      this.persist();
    },

    persist() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
    },

    notify(eventType, data) {
      this.persist();
      listeners.forEach(fn => {
        try {
          fn(eventType, data);
        } catch (err) {
          console.error('Error in storage listener:', err);
        }
      });
    },

    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },

    // --- Exam Date & Settings ---
    getExamDate() {
      return this.state.examDate || this.state.settings.examDate || '2027-02-19T09:00:00';
    },

    setExamDate(dateTimeStr) {
      this.state.examDate = dateTimeStr;
      if (this.state.settings) {
        this.state.settings.examDate = dateTimeStr;
      }
      this.notify('examDateChanged', dateTimeStr);
    },

    resetExamDate() {
      this.setExamDate(window.DEFAULT_EXAM_DATE || '2027-02-19T09:00:00');
    },

    getSettings() {
      return this.state.settings;
    },

    saveSettings(newSettings) {
      this.state.settings = { ...this.state.settings, ...newSettings };
      if (newSettings.examDate) {
        this.state.examDate = newSettings.examDate;
      }
      this.notify('settingsChanged', this.state.settings);
    },

    // --- Subjects & Lectures ---
    getSubjects() {
      return this.state.subjects;
    },

    getSubject(id) {
      return this.state.subjects.find(s => s.id === id);
    },

    saveSubject(subjectData) {
      const idx = this.state.subjects.findIndex(s => s.id === subjectData.id);
      if (idx >= 0) {
        this.state.subjects[idx] = { ...this.state.subjects[idx], ...subjectData };
      } else {
        this.state.subjects.push(subjectData);
      }
      this.notify('subjectsChanged', this.state.subjects);
    },

    deleteSubject(subjectId) {
      this.state.subjects = this.state.subjects.filter(s => s.id !== subjectId);
      // Remove or unbind tasks associated with this subject
      this.state.tasks.forEach(t => {
        if (t.subjectId === subjectId) {
          t.subjectId = null;
          t.lectureId = null;
        }
      });
      this.notify('subjectsChanged', this.state.subjects);
    },

    findLecture(lectureId) {
      for (const subj of this.state.subjects) {
        for (const cat of subj.categories || []) {
          for (const lec of cat.lectures || []) {
            if (lec.id === lectureId) {
              return { lecture: lec, category: cat, subject: subj };
            }
          }
        }
      }
      return null;
    },

    updateLecture(lectureId, updates) {
      const found = this.findLecture(lectureId);
      if (!found) return null;

      const { lecture, subject } = found;
      const wasCompleted = lecture.completed;
      Object.assign(lecture, updates);

      if (updates.completed !== undefined) {
        if (updates.completed && !wasCompleted) {
          lecture.completedAt = new Date().toISOString();
          if (lecture.status === 'Not Started') lecture.status = 'Completed';
          this.logActivity('lecture', lecture.id, lecture.title, subject.id);
        } else if (!updates.completed && wasCompleted) {
          lecture.completedAt = null;
          if (lecture.status === 'Completed') lecture.status = 'In Progress';
          this.removeActivity('lecture', lecture.id);
        }
      }

      this.notify('lectureUpdated', { lecture, subjectId: subject.id });
      return lecture;
    },

    addCategory(subjectId, categoryName) {
      const subj = this.getSubject(subjectId);
      if (!subj) return null;
      const newCat = {
        id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: categoryName,
        lectures: []
      };
      if (!subj.categories) subj.categories = [];
      subj.categories.push(newCat);
      this.notify('subjectsChanged', this.state.subjects);
      return newCat;
    },

    deleteCategory(subjectId, categoryId) {
      const subj = this.getSubject(subjectId);
      if (!subj) return false;
      subj.categories = (subj.categories || []).filter(c => c.id !== categoryId);
      this.notify('subjectsChanged', this.state.subjects);
      return true;
    },

    addLecture(subjectId, categoryId, lectureData) {
      const subj = this.getSubject(subjectId);
      if (!subj) return null;
      const cat = (subj.categories || []).find(c => c.id === categoryId);
      if (!cat) return null;

      const newLecture = {
        id: 'lec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        title: lectureData.title || 'Untitled Lecture',
        rating: Number(lectureData.rating) || 0,
        difficulty: lectureData.difficulty || 'Medium',
        status: lectureData.status || 'Not Started',
        completed: !!lectureData.completed,
        completedAt: lectureData.completed ? new Date().toISOString() : null,
        notes: lectureData.notes || ''
      };

      if (!cat.lectures) cat.lectures = [];
      cat.lectures.push(newLecture);

      if (newLecture.completed) {
        this.logActivity('lecture', newLecture.id, newLecture.title, subj.id);
      }

      this.notify('subjectsChanged', this.state.subjects);
      return newLecture;
    },

    deleteLecture(subjectId, categoryId, lectureId) {
      const subj = this.getSubject(subjectId);
      if (!subj) return false;
      const cat = (subj.categories || []).find(c => c.id === categoryId);
      if (!cat) return false;

      cat.lectures = (cat.lectures || []).filter(l => l.id !== lectureId);
      this.removeActivity('lecture', lectureId);
      this.notify('subjectsChanged', this.state.subjects);
      return true;
    },

    // --- Tasks ---
    getTasks() {
      return this.state.tasks;
    },

    getTask(id) {
      return this.state.tasks.find(t => t.id === id);
    },

    saveTask(taskData) {
      const nowIso = new Date().toISOString();
      const idx = this.state.tasks.findIndex(t => t.id === taskData.id);
      let updatedTask;

      if (idx >= 0) {
        const existing = this.state.tasks[idx];
        const wasCompleted = existing.status === 'Completed';
        const isNowCompleted = taskData.status === 'Completed';

        updatedTask = {
          ...existing,
          ...taskData,
          completedAt: isNowCompleted ? (existing.completedAt || nowIso) : null
        };
        this.state.tasks[idx] = updatedTask;

        if (isNowCompleted && !wasCompleted) {
          this.logActivity('task', updatedTask.id, updatedTask.title, updatedTask.subjectId);
          // Check auto complete lecture preference
          if (this.state.settings.autoCompleteLectureWithTask && updatedTask.lectureId) {
            this.updateLecture(updatedTask.lectureId, { completed: true, status: 'Completed' });
          }
        } else if (!isNowCompleted && wasCompleted) {
          this.removeActivity('task', updatedTask.id);
        }
      } else {
        updatedTask = {
          id: taskData.id || 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          title: taskData.title || 'Untitled Task',
          description: taskData.description || '',
          date: taskData.date || new Date().toISOString().split('T')[0],
          startTime: taskData.startTime || '',
          endTime: taskData.endTime || '',
          subjectId: taskData.subjectId || null,
          lectureId: taskData.lectureId || null,
          priority: taskData.priority || this.state.settings.defaultTaskPriority || 'Medium',
          status: taskData.status || 'Pending',
          estimatedMinutes: Number(taskData.estimatedMinutes) || 60,
          notes: taskData.notes || '',
          completedAt: taskData.status === 'Completed' ? nowIso : null,
          createdAt: nowIso
        };
        this.state.tasks.push(updatedTask);

        if (updatedTask.status === 'Completed') {
          this.logActivity('task', updatedTask.id, updatedTask.title, updatedTask.subjectId);
        }
      }

      this.notify('tasksChanged', this.state.tasks);
      return updatedTask;
    },

    toggleTaskStatus(taskId) {
      const task = this.getTask(taskId);
      if (!task) return null;
      const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      return this.saveTask({ id: taskId, status: nextStatus });
    },

    deleteTask(taskId) {
      this.state.tasks = this.state.tasks.filter(t => t.id !== taskId);
      this.removeActivity('task', taskId);
      this.notify('tasksChanged', this.state.tasks);
      return true;
    },

    // --- Activity Log for Real Data-Driven Analytics ---
    getActivityLog() {
      return this.state.activityLog || [];
    },

    logActivity(type, targetId, title, subjectId) {
      const today = new Date().toISOString().split('T')[0];
      const entry = {
        id: 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        type,
        targetId,
        title,
        subjectId,
        date: today,
        timestamp: Date.now()
      };
      if (!this.state.activityLog) this.state.activityLog = [];
      this.state.activityLog.push(entry);
    },

    removeActivity(type, targetId) {
      if (!this.state.activityLog) return;
      this.state.activityLog = this.state.activityLog.filter(
        a => !(a.type === type && a.targetId === targetId)
      );
    },

    // --- Backup & Restore ---
    exportJSON() {
      return JSON.stringify(this.state, null, 2);
    },

    importJSON(jsonString) {
      try {
        const parsed = JSON.parse(jsonString);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid JSON structure: Root must be an object.');
        }
        if (!Array.isArray(parsed.subjects)) {
          throw new Error('Invalid backup: Missing or invalid "subjects" array.');
        }
        if (!Array.isArray(parsed.tasks)) {
          throw new Error('Invalid backup: Missing or invalid "tasks" array.');
        }

        // Migration/normalization
        this.state = {
          version: 1,
          createdAt: parsed.createdAt || new Date().toISOString(),
          examDate: parsed.examDate || parsed.settings?.examDate || window.DEFAULT_EXAM_DATE || '2027-02-19T09:00:00',
          settings: { ...getDefaultState().settings, ...(parsed.settings || {}) },
          subjects: parsed.subjects,
          tasks: parsed.tasks,
          activityLog: Array.isArray(parsed.activityLog) ? parsed.activityLog : []
        };

        this.notify('dataImported', this.state);
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },

    exportSubjectsCSV() {
      const headers = ['Subject Name', 'Category', 'Lecture Title', 'Status', 'Completed', 'Difficulty', 'Rating', 'Completion Date', 'Notes'];
      const rows = [];
      rows.push(headers.map(h => `"${h}"`).join(','));

      for (const subj of this.state.subjects) {
        for (const cat of subj.categories || []) {
          for (const lec of cat.lectures || []) {
            const row = [
              subj.name,
              cat.name,
              lec.title,
              lec.status,
              lec.completed ? 'Yes' : 'No',
              lec.difficulty || 'Medium',
              lec.rating || 0,
              lec.completedAt ? lec.completedAt.split('T')[0] : '',
              (lec.notes || '').replace(/"/g, '""')
            ];
            rows.push(row.map(r => `"${r}"`).join(','));
          }
        }
      }

      return rows.join('\r\n');
    },

    exportTasksCSV() {
      const headers = ['Task Title', 'Date', 'Start Time', 'End Time', 'Subject', 'Lecture', 'Priority', 'Status', 'Est Minutes', 'Description', 'Notes'];
      const rows = [];
      rows.push(headers.map(h => `"${h}"`).join(','));

      for (const task of this.state.tasks) {
        const subj = this.getSubject(task.subjectId);
        const lec = task.lectureId ? this.findLecture(task.lectureId)?.lecture : null;

        const row = [
          task.title,
          task.date,
          task.startTime || '',
          task.endTime || '',
          subj ? subj.name : '',
          lec ? lec.title : '',
          task.priority,
          task.status,
          task.estimatedMinutes || 60,
          (task.description || '').replace(/"/g, '""'),
          (task.notes || '').replace(/"/g, '""')
        ];
        rows.push(row.map(r => `"${r}"`).join(','));
      }

      return rows.join('\r\n');
    },

    restoreDefaultSubjects() {
      this.state.subjects = JSON.parse(JSON.stringify(window.DEFAULT_SUBJECTS || []));
      this.notify('subjectsChanged', this.state.subjects);
    },

    resetAllData() {
      this.state = getDefaultState();
      this.notify('allDataReset', this.state);
    }
  };

  // Auto-init
  Storage.init();
  window.StorageService = Storage;
})();
