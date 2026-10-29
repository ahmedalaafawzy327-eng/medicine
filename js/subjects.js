/**
 * Study Subjects & Lecture Management for "رابعة طب"
 * Comprehensive curriculum manager with category accordions, star ratings, difficulty badges, and search/sort.
 */

(function () {
  'use strict';

  const SubjectsManager = {
    activeSubjectId: null,
    searchQuery: '',
    filterStatus: 'all',
    sortBy: 'default',

    init() {
      this.bindEvents();
      this.render();

      window.StorageService.subscribe((evt) => {
        if (evt === 'subjectsChanged' || evt === 'lectureUpdated' || evt === 'dataImported' || evt === 'allDataReset') {
          this.render();
          if (this.activeSubjectId) {
            this.renderSubjectDetail(this.activeSubjectId);
          }
        }
      });

      window.addEventListener('viewChanged', (e) => {
        if (e.detail.view === 'subjects') {
          this.render();
        }
      });
    },

    bindEvents() {
      // Add subject button
      const addSubjBtn = document.getElementById('btn-add-subject');
      if (addSubjBtn) {
        addSubjBtn.addEventListener('click', () => this.openSubjectModal());
      }

      // Search and Filter controls
      const searchInput = document.getElementById('subjects-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.toLowerCase().trim();
          this.render();
        });
      }

      const statusFilter = document.getElementById('subjects-filter-status');
      if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
          this.filterStatus = e.target.value;
          this.render();
        });
      }

      const sortSelect = document.getElementById('subjects-sort-by');
      if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
          this.sortBy = e.target.value;
          this.render();
        });
      }

      // Subject modal save button
      const saveSubjectBtn = document.getElementById('btn-save-subject-modal');
      if (saveSubjectBtn) {
        saveSubjectBtn.addEventListener('click', () => this.saveSubjectFromModal());
      }

      // Category modal save button
      const saveCategoryBtn = document.getElementById('btn-save-category-modal');
      if (saveCategoryBtn) {
        saveCategoryBtn.addEventListener('click', () => this.saveCategoryFromModal());
      }

      // Lecture modal save button
      const saveLectureBtn = document.getElementById('btn-save-lecture-modal');
      if (saveLectureBtn) {
        saveLectureBtn.addEventListener('click', () => this.saveLectureFromModal());
      }

      // Back to subjects list from subject details
      const backBtn = document.getElementById('btn-back-to-subjects');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          this.activeSubjectId = null;
          document.getElementById('subjects-list-view').style.display = 'block';
          document.getElementById('subject-detail-view').style.display = 'none';
        });
      }

      // Add Category button inside subject detail
      const addCategoryBtn = document.getElementById('btn-add-category');
      if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', () => {
          if (!this.activeSubjectId) return;
          this.openCategoryModal(this.activeSubjectId);
        });
      }
    },

    getProcessedSubjects() {
      let subjects = [...window.StorageService.getSubjects()];

      // Compute statistics for each
      subjects = subjects.map(s => {
        let total = 0;
        let completed = 0;
        let inProgress = 0;
        let needsRevision = 0;

        (s.categories || []).forEach(c => {
          (c.lectures || []).forEach(l => {
            total++;
            if (l.completed) completed++;
            if (l.status === 'In Progress') inProgress++;
            if (l.status === 'Needs Revision') needsRevision++;
          });
        });

        const remaining = total - completed;
        const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          ...s,
          totalLectures: total,
          completedLectures: completed,
          remainingLectures: remaining,
          completionPct,
          inProgress,
          needsRevision
        };
      });

      // Filter by search query
      if (this.searchQuery) {
        const q = this.searchQuery;
        subjects = subjects.filter(s => {
          if (s.name.toLowerCase().includes(q)) return true;
          if (s.code && s.code.toLowerCase().includes(q)) return true;
          // Search in categories or lectures
          for (const cat of s.categories || []) {
            if (cat.name.toLowerCase().includes(q)) return true;
            for (const lec of cat.lectures || []) {
              if (lec.title.toLowerCase().includes(q)) return true;
            }
          }
          return false;
        });
      }

      // Filter by completion status
      if (this.filterStatus !== 'all') {
        if (this.filterStatus === 'completed') {
          subjects = subjects.filter(s => s.totalLectures > 0 && s.completedLectures === s.totalLectures);
        } else if (this.filterStatus === 'pending') {
          subjects = subjects.filter(s => s.remainingLectures > 0);
        } else if (this.filterStatus === 'needs_revision') {
          subjects = subjects.filter(s => s.needsRevision > 0);
        }
      }

      // Sort
      const priorityOrder = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
      if (this.sortBy === 'name') {
        subjects.sort((a, b) => a.name.localeCompare(b.name));
      } else if (this.sortBy === 'priority') {
        subjects.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
      } else if (this.sortBy === 'completion') {
        subjects.sort((a, b) => b.completionPct - a.completionPct);
      } else if (this.sortBy === 'rating') {
        subjects.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      return subjects;
    },

    render() {
      const container = document.getElementById('subjects-cards-grid');
      if (!container) return;

      const subjects = this.getProcessedSubjects();

      if (subjects.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon"><i class="fas fa-search"></i></div>
            <div class="empty-state-title">No subjects found</div>
            <div class="empty-state-text">No courses match your active search and filter criteria.</div>
            <button class="btn btn-outline" id="btn-reset-subj-filter">Clear Filters</button>
          </div>
        `;
        const resetBtn = container.querySelector('#btn-reset-subj-filter');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            this.searchQuery = '';
            this.filterStatus = 'all';
            this.sortBy = 'default';
            const searchInput = document.getElementById('subjects-search-input');
            const statusFilter = document.getElementById('subjects-filter-status');
            const sortSelect = document.getElementById('subjects-sort-by');
            if (searchInput) searchInput.value = '';
            if (statusFilter) statusFilter.value = 'all';
            if (sortSelect) sortSelect.value = 'default';
            this.render();
          });
        }
        return;
      }

      let html = '';
      subjects.forEach(subj => {
        const priorityBadge = `badge-priority-${(subj.priority || 'medium').toLowerCase()}`;
        
        // Stars
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
          starsHtml += `<i class="fas fa-star star-icon ${i <= (subj.rating || 0) ? 'filled' : ''}"></i>`;
        }

        html += `
          <div class="subject-card" data-subject-id="${subj.id}">
            <div class="subject-card-header">
              <div class="subject-title-area">
                <span class="subject-code">${window.UI.escapeHTML(subj.code || 'MED-400')}</span>
                <h3 class="subject-name">${window.UI.escapeHTML(subj.name)}</h3>
              </div>
              <span class="badge ${priorityBadge}">${subj.priority || 'Medium'}</span>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 0.8rem; color: var(--text-secondary);">Personal Priority Rating:</span>
              <div class="star-rating">${starsHtml}</div>
            </div>

            <div class="subject-card-stats">
              <div>
                <div class="sub-stat-num">${subj.totalLectures}</div>
                <div class="sub-stat-label">Total</div>
              </div>
              <div>
                <div class="sub-stat-num" style="color: var(--success);">${subj.completedLectures}</div>
                <div class="sub-stat-label">Completed</div>
              </div>
              <div>
                <div class="sub-stat-num" style="color: var(--warning);">${subj.remainingLectures}</div>
                <div class="sub-stat-label">Remaining</div>
              </div>
            </div>

            <div class="progress-container">
              <div class="progress-header">
                <span>Curriculum Progress</span>
                <span class="progress-value">${subj.completionPct}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width: ${subj.completionPct}%;"></div>
              </div>
            </div>

            <div class="subject-card-actions">
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-sm btn-ghost btn-icon btn-edit-subj" title="Edit Subject" data-id="${subj.id}">
                  <i class="far fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-ghost btn-icon btn-del-subj" title="Delete Subject" data-id="${subj.id}" style="color: var(--danger);">
                  <i class="far fa-trash-alt"></i>
                </button>
              </div>
              <button class="btn btn-sm btn-primary btn-open-lectures" data-id="${subj.id}">
                <i class="fas fa-list-check"></i> Open Lectures
              </button>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;

      // Bind action handlers
      container.querySelectorAll('.btn-open-lectures').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          this.openSubjectDetail(id);
        });
      });

      container.querySelectorAll('.btn-edit-subj').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          this.openSubjectModal(id);
        });
      });

      container.querySelectorAll('.btn-del-subj').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const subj = window.StorageService.getSubject(id);
          if (!subj) return;
          window.UI.confirm(
            'Delete Subject',
            `Are you sure you want to permanently delete "${subj.name}" and all its categories and lectures?`,
            'Delete Subject',
            () => {
              window.StorageService.deleteSubject(id);
              window.UI.showToast(`Deleted ${subj.name}`, 'info');
            }
          );
        });
      });
    },

    // Subject Detail View (Lectures & Categories)
    openSubjectDetail(subjectId) {
      this.activeSubjectId = subjectId;
      document.getElementById('subjects-list-view').style.display = 'none';
      document.getElementById('subject-detail-view').style.display = 'block';
      this.renderSubjectDetail(subjectId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    renderSubjectDetail(subjectId) {
      const subj = window.StorageService.getSubject(subjectId);
      if (!subj) return;

      document.getElementById('detail-subject-title').textContent = subj.name;
      document.getElementById('detail-subject-code').textContent = subj.code || 'MED-400';
      document.getElementById('detail-subject-priority').textContent = subj.priority || 'Medium';
      document.getElementById('detail-subject-priority').className = `badge badge-priority-${(subj.priority || 'medium').toLowerCase()}`;

      // Calculate totals
      let totalLec = 0;
      let completedLec = 0;
      (subj.categories || []).forEach(c => {
        (c.lectures || []).forEach(l => {
          totalLec++;
          if (l.completed) completedLec++;
        });
      });
      const pct = totalLec > 0 ? Math.round((completedLec / totalLec) * 100) : 0;

      const pctEl = document.getElementById('detail-subject-pct');
      const barEl = document.getElementById('detail-subject-progress-bar');
      const ratioEl = document.getElementById('detail-subject-ratio');
      if (pctEl) pctEl.textContent = `${pct}%`;
      if (barEl) barEl.style.width = `${pct}%`;
      if (ratioEl) ratioEl.textContent = `${completedLec} of ${totalLec} Lectures Completed`;

      // Render Categories
      const container = document.getElementById('categories-accordion-container');
      if (!container) return;

      if (!subj.categories || subj.categories.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon"><i class="fas fa-folder-plus"></i></div>
            <div class="empty-state-title">No categories yet</div>
            <div class="empty-state-text">Create categories to structure topics and lectures.</div>
            <button class="btn btn-gold" id="btn-add-first-category"><i class="fas fa-plus"></i> Add Category</button>
          </div>
        `;
        const addFirstCatBtn = container.querySelector('#btn-add-first-category');
        if (addFirstCatBtn) {
          addFirstCatBtn.addEventListener('click', () => this.openCategoryModal(subjectId));
        }
        return;
      }

      let html = '';
      subj.categories.forEach((cat, catIdx) => {
        const lectures = cat.lectures || [];
        const catTotal = lectures.length;
        const catCompleted = lectures.filter(l => l.completed).length;
        const catPct = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0;

        html += `
          <div class="category-accordion" data-cat-id="${cat.id}">
            <div class="category-accordion-header">
              <div class="category-name-badge">
                <i class="fas fa-folder" style="color: var(--gold-rich);"></i>
                <span>Category ${catIdx + 1}: ${window.UI.escapeHTML(cat.name)}</span>
                <span class="badge badge-gold" style="font-size: 0.72rem;">${catCompleted}/${catTotal}</span>
                <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 500;">(${catPct}%)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button class="btn btn-sm btn-outline btn-add-lecture-to-cat" data-cat-id="${cat.id}" title="Add Lecture">
                  <i class="fas fa-plus"></i> Add Lecture
                </button>
                <button class="btn btn-sm btn-ghost btn-icon btn-del-category" data-cat-id="${cat.id}" title="Delete Category" style="color: var(--danger);">
                  <i class="far fa-trash-alt"></i>
                </button>
              </div>
            </div>
            <div class="category-accordion-body">
        `;

        if (lectures.length === 0) {
          html += `
            <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
              No lectures added in this category yet. Click "Add Lecture" to add one.
            </div>
          `;
        } else {
          lectures.forEach((lec, lecIdx) => {
            const isCompleted = !!lec.completed;
            const diffClass = `badge-diff-${(lec.difficulty || 'medium').toLowerCase()}`;

            let stars = '';
            for (let i = 1; i <= 5; i++) {
              stars += `<i class="fas fa-star star-icon ${i <= (lec.rating || 0) ? 'filled' : ''}"></i>`;
            }

            html += `
              <div class="lecture-row ${isCompleted ? 'completed' : ''}" data-lecture-id="${lec.id}">
                <div class="lecture-left-col">
                  <label class="custom-checkbox">
                    <input type="checkbox" class="lecture-checkbox" ${isCompleted ? 'checked' : ''} data-lecture-id="${lec.id}">
                    <span class="checkmark"></span>
                  </label>
                  <span class="lecture-seq-num">${lecIdx + 1}.</span>
                  <div style="display: flex; flex-direction: column;">
                    <span class="lecture-title-text">${window.UI.escapeHTML(lec.title)}</span>
                    ${lec.notes ? `<span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;"><i class="far fa-sticky-note"></i> ${window.UI.escapeHTML(lec.notes)}</span>` : ''}
                  </div>
                </div>

                <div class="lecture-right-actions">
                  <span class="badge ${diffClass}">${lec.difficulty || 'Medium'}</span>
                  <div class="star-rating">${stars}</div>
                  <span class="badge ${isCompleted ? 'badge-success' : 'badge-navy'}">${lec.status || (isCompleted ? 'Completed' : 'Not Started')}</span>
                  <button class="btn btn-sm btn-ghost btn-icon btn-edit-lecture" title="Edit Lecture" data-cat-id="${cat.id}" data-lecture-id="${lec.id}">
                    <i class="far fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-ghost btn-icon btn-del-lecture" title="Delete Lecture" data-cat-id="${cat.id}" data-lecture-id="${lec.id}" style="color: var(--danger);">
                    <i class="far fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            `;
          });
        }

        html += `
            </div>
          </div>
        `;
      });

      container.innerHTML = html;

      // Bind category & lecture actions
      container.querySelectorAll('.lecture-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
          const lecId = e.target.getAttribute('data-lecture-id');
          const isChecked = e.target.checked;
          window.StorageService.updateLecture(lecId, {
            completed: isChecked,
            status: isChecked ? 'Completed' : 'Not Started'
          });
          window.UI.showToast(`Lecture marked as ${isChecked ? 'completed' : 'incomplete'}`, 'success');
        });
      });

      container.querySelectorAll('.btn-add-lecture-to-cat').forEach(btn => {
        btn.addEventListener('click', () => {
          const catId = btn.getAttribute('data-cat-id');
          this.openLectureModal(subjectId, catId);
        });
      });

      container.querySelectorAll('.btn-del-category').forEach(btn => {
        btn.addEventListener('click', () => {
          const catId = btn.getAttribute('data-cat-id');
          window.UI.confirm(
            'Delete Category',
            'Are you sure you want to delete this category and all its contained lectures?',
            'Delete Category',
            () => {
              window.StorageService.deleteCategory(subjectId, catId);
              window.UI.showToast('Category deleted', 'info');
              this.renderSubjectDetail(subjectId);
            }
          );
        });
      });

      container.querySelectorAll('.btn-edit-lecture').forEach(btn => {
        btn.addEventListener('click', () => {
          const catId = btn.getAttribute('data-cat-id');
          const lecId = btn.getAttribute('data-lecture-id');
          this.openLectureModal(subjectId, catId, lecId);
        });
      });

      container.querySelectorAll('.btn-del-lecture').forEach(btn => {
        btn.addEventListener('click', () => {
          const catId = btn.getAttribute('data-cat-id');
          const lecId = btn.getAttribute('data-lecture-id');
          window.UI.confirm(
            'Delete Lecture',
            'Are you sure you want to delete this lecture?',
            'Delete Lecture',
            () => {
              window.StorageService.deleteLecture(subjectId, catId, lecId);
              window.UI.showToast('Lecture deleted', 'info');
              this.renderSubjectDetail(subjectId);
            }
          );
        });
      });
    },

    // --- Subject Modal ---
    openSubjectModal(subjectId = null) {
      const modal = document.getElementById('modal-subject');
      const titleEl = document.getElementById('subject-modal-title');
      const idInput = document.getElementById('input-subject-id');
      const nameInput = document.getElementById('input-subject-name');
      const codeInput = document.getElementById('input-subject-code');
      const prioritySelect = document.getElementById('select-subject-priority');
      const ratingSelect = document.getElementById('select-subject-rating');

      if (subjectId) {
        const subj = window.StorageService.getSubject(subjectId);
        if (!subj) return;
        titleEl.textContent = 'Edit Subject';
        idInput.value = subj.id;
        nameInput.value = subj.name;
        codeInput.value = subj.code || '';
        prioritySelect.value = subj.priority || 'Medium';
        ratingSelect.value = subj.rating || 4;
      } else {
        titleEl.textContent = 'Add New Subject';
        idInput.value = '';
        nameInput.value = '';
        codeInput.value = '';
        prioritySelect.value = 'Medium';
        ratingSelect.value = 4;
      }

      window.UI.openModal('modal-subject');
    },

    saveSubjectFromModal() {
      const id = document.getElementById('input-subject-id').value;
      const name = document.getElementById('input-subject-name').value.trim();
      const code = document.getElementById('input-subject-code').value.trim();
      const priority = document.getElementById('select-subject-priority').value;
      const rating = Number(document.getElementById('select-subject-rating').value) || 4;

      if (!name) {
        window.UI.showToast('Please enter a subject name', 'error');
        return;
      }

      if (id) {
        const existing = window.StorageService.getSubject(id);
        if (existing) {
          window.StorageService.saveSubject({
            ...existing,
            name,
            code: code || existing.code,
            priority,
            rating
          });
          window.UI.showToast('Subject updated successfully', 'success');
        }
      } else {
        const newSubject = {
          id: 'subj_' + Date.now(),
          name,
          code: code || 'MED-4' + Math.floor(Math.random() * 90 + 10),
          priority,
          rating,
          categories: []
        };
        window.StorageService.saveSubject(newSubject);
        window.UI.showToast('Subject created successfully', 'success');
      }

      window.UI.closeModal('modal-subject');
      this.render();
    },

    // --- Category Modal ---
    openCategoryModal(subjectId) {
      document.getElementById('input-category-subj-id').value = subjectId;
      document.getElementById('input-category-name').value = '';
      window.UI.openModal('modal-category');
    },

    saveCategoryFromModal() {
      const subjectId = document.getElementById('input-category-subj-id').value;
      const name = document.getElementById('input-category-name').value.trim();

      if (!name) {
        window.UI.showToast('Please enter a category name', 'error');
        return;
      }

      window.StorageService.addCategory(subjectId, name);
      window.UI.closeModal('modal-category');
      window.UI.showToast('Category created', 'success');
      this.renderSubjectDetail(subjectId);
    },

    // --- Lecture Modal ---
    openLectureModal(subjectId = null, categoryId = null, lectureId = null) {
      const subjSelect = document.getElementById('select-lecture-subject');
      const catSelect = document.getElementById('select-lecture-category');
      const idInput = document.getElementById('input-lecture-id');
      const titleInput = document.getElementById('input-lecture-title');
      const diffSelect = document.getElementById('select-lecture-difficulty');
      const statusSelect = document.getElementById('select-lecture-status');
      const ratingSelect = document.getElementById('select-lecture-rating');
      const notesInput = document.getElementById('input-lecture-notes');
      const modalTitle = document.getElementById('lecture-modal-title');

      // Populate Subjects dropdown
      const subjects = window.StorageService.getSubjects();
      subjSelect.innerHTML = subjects.map(s => `<option value="${s.id}">${window.UI.escapeHTML(s.name)}</option>`).join('');

      // Populate Categories when subject changes
      const updateCategories = (selectedSubjId, preselectCatId = null) => {
        const currentSubj = window.StorageService.getSubject(selectedSubjId);
        if (!currentSubj || !currentSubj.categories || currentSubj.categories.length === 0) {
          catSelect.innerHTML = '<option value="">No categories (Create one first)</option>';
          return;
        }
        catSelect.innerHTML = currentSubj.categories.map(c => `<option value="${c.id}">${window.UI.escapeHTML(c.name)}</option>`).join('');
        if (preselectCatId) catSelect.value = preselectCatId;
      };

      subjSelect.onchange = () => updateCategories(subjSelect.value);

      if (subjectId) {
        subjSelect.value = subjectId;
        updateCategories(subjectId, categoryId);
      } else if (subjects.length > 0) {
        subjSelect.value = subjects[0].id;
        updateCategories(subjects[0].id);
      }

      if (lectureId) {
        modalTitle.textContent = 'Edit Lecture';
        const found = window.StorageService.findLecture(lectureId);
        if (found) {
          const { lecture, category, subject } = found;
          subjSelect.value = subject.id;
          updateCategories(subject.id, category.id);
          idInput.value = lecture.id;
          titleInput.value = lecture.title;
          diffSelect.value = lecture.difficulty || 'Medium';
          statusSelect.value = lecture.status || 'Not Started';
          ratingSelect.value = lecture.rating || 0;
          notesInput.value = lecture.notes || '';
        }
      } else {
        modalTitle.textContent = 'Add Lecture';
        idInput.value = '';
        titleInput.value = '';
        diffSelect.value = 'Medium';
        statusSelect.value = 'Not Started';
        ratingSelect.value = 0;
        notesInput.value = '';
      }

      window.UI.openModal('modal-lecture');
    },

    saveLectureFromModal() {
      const subjectId = document.getElementById('select-lecture-subject').value;
      const categoryId = document.getElementById('select-lecture-category').value;
      const lectureId = document.getElementById('input-lecture-id').value;
      const title = document.getElementById('input-lecture-title').value.trim();
      const difficulty = document.getElementById('select-lecture-difficulty').value;
      const status = document.getElementById('select-lecture-status').value;
      const rating = Number(document.getElementById('select-lecture-rating').value) || 0;
      const notes = document.getElementById('input-lecture-notes').value.trim();

      if (!title) {
        window.UI.showToast('Please enter a lecture title', 'error');
        return;
      }
      if (!categoryId) {
        window.UI.showToast('Please select or create a category first', 'error');
        return;
      }

      const completed = (status === 'Completed');

      if (lectureId) {
        window.StorageService.updateLecture(lectureId, {
          title,
          difficulty,
          status,
          completed,
          rating,
          notes
        });
        window.UI.showToast('Lecture updated successfully', 'success');
      } else {
        window.StorageService.addLecture(subjectId, categoryId, {
          title,
          difficulty,
          status,
          completed,
          rating,
          notes
        });
        window.UI.showToast('Lecture added successfully', 'success');
      }

      window.UI.closeModal('modal-lecture');
      if (this.activeSubjectId) {
        this.renderSubjectDetail(this.activeSubjectId);
      }
      this.render();
    }
  };

  window.SubjectsManager = SubjectsManager;
})();
