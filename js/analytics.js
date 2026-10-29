/**
 * Topic Progression & Data Analytics Engine for "رابعة طب"
 * 100% data-driven metrics, genuine streak calculation, and interactive native SVG charts.
 */

(function () {
  'use strict';

  const Analytics = {
    dateRangeDays: 30, // 7 | 30 | 90 | 365
    filterSubject: 'all',

    init() {
      this.bindEvents();
      this.render();

      window.StorageService.subscribe((evt) => {
        if (['tasksChanged', 'subjectsChanged', 'lectureUpdated', 'dataImported', 'allDataReset'].includes(evt)) {
          this.render();
        }
      });

      window.addEventListener('viewChanged', (e) => {
        if (e.detail.view === 'analytics') {
          this.render();
        }
      });
    },

    bindEvents() {
      const rangeSelect = document.getElementById('analytics-range-select');
      if (rangeSelect) {
        rangeSelect.addEventListener('change', (e) => {
          this.dateRangeDays = parseInt(e.target.value, 10);
          this.render();
        });
      }

      const subjFilter = document.getElementById('analytics-subj-filter');
      if (subjFilter) {
        subjFilter.addEventListener('change', (e) => {
          this.filterSubject = e.target.value;
          this.render();
        });
      }
    },

    populateSubjectDropdown() {
      const subjFilter = document.getElementById('analytics-subj-filter');
      if (!subjFilter) return;
      const current = subjFilter.value;
      const subjects = window.StorageService.getSubjects();
      subjFilter.innerHTML = '<option value="all">All Subjects</option>' +
        subjects.map(s => `<option value="${s.id}">${window.UI.escapeHTML(s.name)}</option>`).join('');
      subjFilter.value = current || 'all';
    },

    // --- Data Processing & KPIs ---
    calculateMetrics() {
      const subjects = window.StorageService.getSubjects();
      const tasks = window.StorageService.getTasks();
      const activityLog = window.StorageService.getActivityLog();

      let totalLectures = 0;
      let completedLectures = 0;
      const subjectProgressList = [];

      subjects.forEach(subj => {
        let subTotal = 0;
        let subComp = 0;
        (subj.categories || []).forEach(c => {
          (c.lectures || []).forEach(l => {
            totalLectures++;
            subTotal++;
            if (l.completed) {
              completedLectures++;
              subComp++;
            }
          });
        });
        const pct = subTotal > 0 ? Math.round((subComp / subTotal) * 100) : 0;
        subjectProgressList.push({
          id: subj.id,
          name: subj.name,
          total: subTotal,
          completed: subComp,
          pct
        });
      });

      const remainingLectures = totalLectures - completedLectures;
      const overallLecturePct = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

      // Filter tasks if subject filter selected
      let filteredTasks = tasks;
      if (this.filterSubject !== 'all') {
        filteredTasks = tasks.filter(t => t.subjectId === this.filterSubject);
      }

      const totalTasks = filteredTasks.length;
      const completedTasks = filteredTasks.filter(t => t.status === 'Completed').length;
      const overallTaskPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Study time (minutes) from completed tasks
      let totalStudyMinutes = 0;
      filteredTasks.filter(t => t.status === 'Completed').forEach(t => {
        totalStudyMinutes += (Number(t.estimatedMinutes) || 60);
      });
      const studyHours = (totalStudyMinutes / 60).toFixed(1);

      // Streaks calculation:
      // A study day is any day with at least 1 completed task or 1 completed lecture.
      const studyDatesSet = new Set();
      tasks.filter(t => t.status === 'Completed' && t.date).forEach(t => studyDatesSet.add(t.date));
      activityLog.forEach(a => { if (a.date) studyDatesSet.add(a.date); });
      subjects.forEach(s => {
        (s.categories || []).forEach(c => {
          (c.lectures || []).forEach(l => {
            if (l.completed && l.completedAt) {
              studyDatesSet.add(l.completedAt.split('T')[0]);
            }
          });
        });
      });

      const { currentStreak, bestStreak } = this.calculateStreaks(studyDatesSet);

      // Best and lowest subjects
      let highestSubject = 'None';
      let lowestSubject = 'None';
      if (subjectProgressList.length > 0) {
        const sorted = [...subjectProgressList].sort((a, b) => b.pct - a.pct);
        highestSubject = `${sorted[0].name} (${sorted[0].pct}%)`;
        const lowestCandidate = [...subjectProgressList].sort((a, b) => a.pct - b.pct)[0];
        lowestSubject = `${lowestCandidate.name} (${lowestCandidate.pct}%)`;
      }

      // Average daily completed tasks over last 30 days
      const daysCounted = Math.max(1, this.dateRangeDays);
      const avgDailyTasks = (completedTasks / daysCounted).toFixed(2);

      return {
        totalLectures,
        completedLectures,
        remainingLectures,
        overallLecturePct,
        totalTasks,
        completedTasks,
        overallTaskPct,
        totalStudyMinutes,
        studyHours,
        currentStreak,
        bestStreak,
        highestSubject,
        lowestSubject,
        avgDailyTasks,
        subjectProgressList,
        studyDatesSet
      };
    },

    calculateStreaks(studyDatesSet) {
      if (studyDatesSet.size === 0) {
        return { currentStreak: 0, bestStreak: 0 };
      }

      const sortedDates = Array.from(studyDatesSet).sort();
      const dateObjects = sortedDates.map(dStr => {
        const [y, m, d] = dStr.split('-').map(Number);
        return new Date(y, m - 1, d);
      });

      let bestStreak = 1;
      let tempStreak = 1;

      for (let i = 1; i < dateObjects.length; i++) {
        const prev = dateObjects[i - 1];
        const curr = dateObjects[i];
        const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
          if (tempStreak > bestStreak) bestStreak = tempStreak;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }

      // Check current streak relative to today
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const pad = (n) => String(n).padStart(2, '0');
      const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
      const yesterdayStr = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;

      let currentStreak = 0;
      let checkDate = studyDatesSet.has(todayStr) ? today : (studyDatesSet.has(yesterdayStr) ? yesterday : null);

      if (checkDate) {
        currentStreak = 1;
        let runner = new Date(checkDate);
        while (true) {
          runner.setDate(runner.getDate() - 1);
          const rStr = `${runner.getFullYear()}-${pad(runner.getMonth() + 1)}-${pad(runner.getDate())}`;
          if (studyDatesSet.has(rStr)) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      return { currentStreak, bestStreak: Math.max(bestStreak, currentStreak) };
    },

    render() {
      this.populateSubjectDropdown();
      const metrics = this.calculateMetrics();

      // Render KPIs
      const setEl = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      setEl('kpi-overall-lecture-pct', `${metrics.overallLecturePct}%`);
      setEl('kpi-overall-task-pct', `${metrics.overallTaskPct}%`);
      setEl('kpi-completed-lectures', metrics.completedLectures);
      setEl('kpi-remaining-lectures', metrics.remainingLectures);
      setEl('kpi-completed-tasks', metrics.completedTasks);
      setEl('kpi-study-hours', `${metrics.studyHours} hrs`);
      setEl('kpi-current-streak', `${metrics.currentStreak} Days`);
      setEl('kpi-best-streak', `${metrics.bestStreak} Days`);
      setEl('kpi-highest-subject', metrics.highestSubject);
      setEl('kpi-lowest-subject', metrics.lowestSubject);
      setEl('kpi-avg-daily-tasks', metrics.avgDailyTasks);

      // Render Charts
      this.renderDailyActivityChart(metrics);
      this.renderLectureTrendChart();
      this.renderSubjectComparisonChart(metrics.subjectProgressList);
      this.renderTaskCompletionDonut(metrics);
      this.renderStudyTimeDistribution();
      this.renderWeeklyProductivityChart();
      this.renderDifficultyBreakdown();
    },

    // --- Chart 1: Daily Study Activity (Native SVG Bar Chart) ---
    renderDailyActivityChart(metrics) {
      const container = document.getElementById('chart-daily-activity');
      if (!container) return;

      const tasks = window.StorageService.getTasks();
      const activityLog = window.StorageService.getActivityLog();
      const daysCount = this.dateRangeDays;

      // Build daily buckets for the past X days
      const pad = (n) => String(n).padStart(2, '0');
      const now = new Date();
      const dataPoints = [];

      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const tasksDone = tasks.filter(t => t.status === 'Completed' && t.date === dateStr).length;
        const lecturesDone = activityLog.filter(a => a.type === 'lecture' && a.date === dateStr).length;

        dataPoints.push({ dateStr, label, count: tasksDone + lecturesDone, tasksDone, lecturesDone });
      }

      const maxVal = Math.max(4, ...dataPoints.map(p => p.count));
      const width = 600;
      const height = 240;
      const padding = { top: 20, right: 20, bottom: 40, left: 40 };
      const chartW = width - padding.left - padding.right;
      const chartH = height - padding.top - padding.bottom;
      const barW = Math.max(3, Math.min(24, (chartW / dataPoints.length) - 4));

      let svg = `<svg class="svg-chart" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

      // Y-axis grid lines
      for (let yStep = 0; yStep <= maxVal; yStep += Math.max(1, Math.ceil(maxVal / 4))) {
        const yPos = padding.top + chartH - (yStep / maxVal) * chartH;
        svg += `
          <line x1="${padding.left}" y1="${yPos}" x2="${width - padding.right}" y2="${yPos}" stroke="#E5E9F0" stroke-dasharray="3 3"/>
          <text x="${padding.left - 8}" y="${yPos + 4}" font-size="10" fill="#9BA6B8" text-anchor="end">${yStep}</text>
        `;
      }

      // Bars
      dataPoints.forEach((pt, idx) => {
        const xPos = padding.left + (idx * (chartW / dataPoints.length)) + ((chartW / dataPoints.length) - barW) / 2;
        const barH = (pt.count / maxVal) * chartH;
        const yPos = padding.top + chartH - barH;

        svg += `
          <rect x="${xPos}" y="${yPos}" width="${barW}" height="${barH}" rx="3" fill="#D4A62F" opacity="0.88" class="chart-bar-hover">
            <title>${pt.label}: ${pt.count} completed (${pt.tasksDone} tasks, ${pt.lecturesDone} lectures)</title>
          </rect>
        `;

        // X-axis labels (render every N days to prevent crowding)
        const step = Math.ceil(daysCount / 7);
        if (idx % step === 0 || idx === dataPoints.length - 1) {
          svg += `<text x="${xPos + barW / 2}" y="${height - 12}" font-size="10" fill="#788396" text-anchor="middle">${pt.label}</text>`;
        }
      });

      svg += '</svg>';
      container.innerHTML = svg;
    },

    // --- Chart 2: Lecture Completion Trend (SVG Area / Line Chart) ---
    renderLectureTrendChart() {
      const container = document.getElementById('chart-lecture-trend');
      if (!container) return;

      const subjects = window.StorageService.getSubjects();
      const activityLog = window.StorageService.getActivityLog().filter(a => a.type === 'lecture');

      // Also gather completed lectures with completedAt dates
      const datesList = [];
      subjects.forEach(s => {
        (s.categories || []).forEach(c => {
          (c.lectures || []).forEach(l => {
            if (l.completed && l.completedAt) {
              datesList.push(l.completedAt.split('T')[0]);
            }
          });
        });
      });
      activityLog.forEach(a => datesList.push(a.date));

      const sortedDates = Array.from(new Set(datesList)).sort();

      if (sortedDates.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="padding: 30px;">
            <div class="empty-state-text" style="font-size: 0.85rem;">Mark lectures as completed to visualize your progress curve over time.</div>
          </div>
        `;
        return;
      }

      let cumulative = 0;
      const points = sortedDates.map(dStr => {
        const countOnDay = datesList.filter(d => d === dStr).length;
        cumulative += countOnDay;
        return { dateStr: dStr, total: cumulative };
      });

      const width = 600;
      const height = 240;
      const padding = { top: 20, right: 25, bottom: 40, left: 40 };
      const chartW = width - padding.left - padding.right;
      const chartH = height - padding.top - padding.bottom;
      const maxVal = Math.max(5, cumulative);

      let pathD = '';
      let areaD = '';

      points.forEach((pt, idx) => {
        const x = padding.left + (idx / Math.max(1, points.length - 1)) * chartW;
        const y = padding.top + chartH - (pt.total / maxVal) * chartH;
        if (idx === 0) {
          pathD += `M ${x} ${y}`;
          areaD += `M ${x} ${padding.top + chartH} L ${x} ${y}`;
        } else {
          pathD += ` L ${x} ${y}`;
          areaD += ` L ${x} ${y}`;
        }
      });

      const lastX = padding.left + chartW;
      areaD += ` L ${lastX} ${padding.top + chartH} Z`;

      let svg = `
        <svg class="svg-chart" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#D4A62F" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#D4A62F" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <path d="${areaD}" fill="url(#trendGradient)" />
          <path d="${pathD}" fill="none" stroke="#D4A62F" stroke-width="3" stroke-linecap="round"/>
      `;

      // Circles for data points
      points.forEach((pt, idx) => {
        const x = padding.left + (idx / Math.max(1, points.length - 1)) * chartW;
        const y = padding.top + chartH - (pt.total / maxVal) * chartH;
        svg += `
          <circle cx="${x}" cy="${y}" r="4" fill="#101D35" stroke="#D4A62F" stroke-width="2">
            <title>${pt.dateStr}: ${pt.total} Cumulative Lectures</title>
          </circle>
          <text x="${x}" y="${height - 12}" font-size="9" fill="#788396" text-anchor="middle">${pt.dateStr.slice(5)}</text>
        `;
      });

      svg += '</svg>';
      container.innerHTML = svg;
    },

    // --- Chart 3: Subject Progress Comparison (Horizontal Bar Chart) ---
    renderSubjectComparisonChart(subjectList) {
      const container = document.getElementById('chart-subject-comparison');
      if (!container) return;

      if (!subjectList || subjectList.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-text">No subjects found.</div></div>';
        return;
      }

      let html = '<div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">';
      subjectList.forEach(subj => {
        html += `
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
              <span style="font-weight: 600; font-size: 0.88rem; color: var(--navy-deep);">${window.UI.escapeHTML(subj.name)}</span>
              <span style="font-weight: 700; font-size: 0.82rem; color: var(--gold-dark);">${subj.pct}% (${subj.completed}/${subj.total})</span>
            </div>
            <div class="progress-track" style="height: 10px;">
              <div class="progress-fill" style="width: ${subj.pct}%;"></div>
            </div>
          </div>
        `;
      });
      html += '</div>';

      container.innerHTML = html;
    },

    // --- Chart 4: Task Completion Rate (Donut Gauge) ---
    renderTaskCompletionDonut(metrics) {
      const container = document.getElementById('chart-task-completion-rate');
      if (!container) return;

      const total = metrics.totalTasks;
      const completed = metrics.completedTasks;
      const pending = total - completed;
      const pct = metrics.overallTaskPct;

      const radius = 60;
      const stroke = 14;
      const circumference = 2 * Math.PI * radius;
      const completedOffset = circumference - (pct / 100) * circumference;

      container.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 28px; width: 100%;">
          <div style="position: relative; width: 160px; height: 160px; display: flex; align-items: center; justify-content: center;">
            <svg width="160" height="160" viewBox="0 0 160 160" style="transform: rotate(-90deg);">
              <circle cx="80" cy="80" r="${radius}" fill="none" stroke="#E5E9F0" stroke-width="${stroke}" />
              <circle cx="80" cy="80" r="${radius}" fill="none" stroke="#D4A62F" stroke-width="${stroke}"
                stroke-dasharray="${circumference}" stroke-dashoffset="${completedOffset}" stroke-linecap="round" />
            </svg>
            <div style="position: absolute; text-align: center;">
              <div style="font-size: 1.6rem; font-weight: 800; color: var(--navy-deep);">${pct}%</div>
              <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Finished</div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem;">
              <span style="width: 12px; height: 12px; border-radius: 3px; background: #D4A62F; display: inline-block;"></span>
              <span>Completed: <strong>${completed}</strong></span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem;">
              <span style="width: 12px; height: 12px; border-radius: 3px; background: #E5E9F0; display: inline-block;"></span>
              <span>Pending: <strong>${pending}</strong></span>
            </div>
          </div>
        </div>
      `;
    },

    // --- Chart 5: Study Time Distribution by Subject ---
    renderStudyTimeDistribution() {
      const container = document.getElementById('chart-study-time-dist');
      if (!container) return;

      const tasks = window.StorageService.getTasks();
      const subjects = window.StorageService.getSubjects();

      const timeBySubject = {};
      subjects.forEach(s => { timeBySubject[s.id] = { name: s.name, minutes: 0 }; });
      timeBySubject['general'] = { name: 'General / Rounds', minutes: 0 };

      tasks.forEach(t => {
        const mins = Number(t.estimatedMinutes) || 60;
        if (t.subjectId && timeBySubject[t.subjectId]) {
          timeBySubject[t.subjectId].minutes += mins;
        } else {
          timeBySubject['general'].minutes += mins;
        }
      });

      const totalMins = Object.values(timeBySubject).reduce((acc, curr) => acc + curr.minutes, 0);

      if (totalMins === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-text">No study sessions recorded yet.</div></div>';
        return;
      }

      let html = '<div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">';
      Object.values(timeBySubject).filter(item => item.minutes > 0).forEach(item => {
        const pct = Math.round((item.minutes / totalMins) * 100);
        const hours = (item.minutes / 60).toFixed(1);
        html += `
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
              <span>${window.UI.escapeHTML(item.name)}</span>
              <strong>${hours} hrs (${pct}%)</strong>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
      });
      html += '</div>';

      container.innerHTML = html;
    },

    // --- Chart 6: Weekly Productivity Heatmap / Day Distribution ---
    renderWeeklyProductivityChart() {
      const container = document.getElementById('chart-weekly-productivity');
      if (!container) return;

      const tasks = window.StorageService.getTasks().filter(t => t.status === 'Completed');
      const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun(0) to Sat(6)
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      tasks.forEach(t => {
        if (t.date) {
          const parts = t.date.split('-');
          const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          dayCounts[d.getDay()]++;
        }
      });

      const maxCount = Math.max(1, ...dayCounts);

      let html = '<div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 8px; height: 160px; width: 100%; padding-top: 20px;">';
      dayNames.forEach((name, idx) => {
        const count = dayCounts[idx];
        const barHeight = Math.max(8, (count / maxCount) * 110);
        html += `
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;">
            <span style="font-size: 0.72rem; font-weight: 700; color: var(--gold-dark);">${count}</span>
            <div style="width: 100%; max-width: 32px; height: ${barHeight}px; background: var(--navy-surface); border-radius: 4px;" title="${name}: ${count} completed tasks"></div>
            <span style="font-size: 0.75rem; color: var(--text-secondary);">${name.substring(0, 3)}</span>
          </div>
        `;
      });
      html += '</div>';

      container.innerHTML = html;
    },

    // --- Chart 7: Subject Difficulty Breakdown ---
    renderDifficultyBreakdown() {
      const container = document.getElementById('chart-difficulty-breakdown');
      if (!container) return;

      const subjects = window.StorageService.getSubjects();
      let easyCount = 0;
      let medCount = 0;
      let hardCount = 0;

      subjects.forEach(s => {
        (s.categories || []).forEach(c => {
          (c.lectures || []).forEach(l => {
            const diff = (l.difficulty || 'Medium').toLowerCase();
            if (diff === 'easy') easyCount++;
            else if (diff === 'hard') hardCount++;
            else medCount++;
          });
        });
      });

      const total = easyCount + medCount + hardCount;
      if (total === 0) return;

      const easyPct = Math.round((easyCount / total) * 100);
      const medPct = Math.round((medCount / total) * 100);
      const hardPct = Math.round((hardCount / total) * 100);

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
              <span class="badge badge-diff-easy">Easy</span>
              <strong>${easyCount} lectures (${easyPct}%)</strong>
            </div>
            <div class="progress-track"><div class="progress-fill green" style="width: ${easyPct}%;"></div></div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
              <span class="badge badge-diff-medium">Medium</span>
              <strong>${medCount} lectures (${medPct}%)</strong>
            </div>
            <div class="progress-track"><div class="progress-fill" style="width: ${medPct}%;"></div></div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
              <span class="badge badge-diff-hard">Hard</span>
              <strong>${hardCount} lectures (${hardPct}%)</strong>
            </div>
            <div class="progress-track"><div class="progress-fill" style="width: ${hardPct}%; background: linear-gradient(90deg, #D94A4A 0%, #F1948A 100%);"></div></div>
          </div>
        </div>
      `;
    }
  };

  window.Analytics = Analytics;
})();
