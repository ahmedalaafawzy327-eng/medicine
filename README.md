# رابعة طب — Medical Study Management Suite

A complete, high-performance, interactive study management web application designed specifically for **Fourth-Year Medical Students (MBBCh Year 4)**.

The application title is rendered in Arabic as **رابعة طب**, with a luxurious geometric numeral **4** brand mark. The entire user interface, controls, widgets, analytics, and academic tools are presented in clean, professional English.

---

## 🌟 Key Features

### 1. Final Examination Countdown
- **Target Date**: Defaults to **February 19, 2027 at 09:00 AM**.
- **Live Updates**: Real-time second-by-second countdown (Days, Hours, Minutes, Seconds).
- **Customizable**: Change date and time anytime; immediately saved to persistent storage.
- **One-Click Reset**: Easily restore the original February 19, 2027 milestone.
- **Visual Alert States**: Distinct visual badges for normal schedule, approaching exam (≤ 30 days), examination day, and concluded.

### 2. Academic Dashboard
- **8 Dynamic KPI Cards**: Total Subjects, Total Lectures, Completed Lectures, Pending Lectures, Overall Lecture Completion (%), Tasks Done Today, Tasks Left Today, and Study Days Remaining.
- **Today's Focus Widget**: Shows scheduled study tasks for today with functional completion checkboxes, progress bar, and shortcuts.
- **Curriculum Snapshot**: Visual progress bars showing completion for every core subject.
- **Quick Action Bar**: Shortcuts to add tasks, subjects, lectures, open calendar, and view analytics.

### 3. Study Subjects Management
- **Preloaded Core Curriculum (89 Lectures Across 5 Subjects)**:
  1. **Pediatrics** (16 Categories, 45 Lectures): Neonatology, Nutritional Disorders, Respiratory, Hematology, Gastroenterology, Cardiology, Nephrology, Neurology, Endocrine, Infections, Allergy, Rheumatology, Immunology, Oncology, Genetics, Hepatology.
  2. **Anesthesia** (11 Lectures): Preoperative Care, General, Regional, Anesthetic Risk, Monitoring, Airway, BLS, Postoperative Pain & Complications, Fluid Therapy, Oxygen Therapy.
  3. **Psychiatry** (10 Lectures): Anxiety, Depressive & Bipolar, Schizophrenia, Somatic, Eating, Adjustment, Substance Use, Suicide, Psychopharmacology, Sleep Disorders.
  4. **Tropical Medicine** (17 Lectures): Approach to Fever, Travel Medicine, Nosocomial, Heat Disorders, Tropical Infections, H. pylori, Salmonellosis & Brucellosis, HIV, CMV/Tetanus/Rabies, GI Infections, TB, FUO, COVID-19, Hepatitis, HBV/HCV, Portal HTN, Acute Liver Failure.
  5. **Rheumatology** (6 Lectures): Rheumatoid Arthritis, SLE, Spondyloarthropathies, Systemic Sclerosis, Crystal-Induced Arthritis, Inflammatory Myopathies.
- **Interactive Tools**:
  - Add, edit, or delete subjects.
  - Add new categories within any subject.
  - Add, edit, reorder, or delete lectures.
  - Personal star rating (1–5 stars) per lecture and subject.
  - Self-reported difficulty labels: `Easy`, `Medium`, `Hard`.
  - Review status tracking: `Not Started`, `In Progress`, `Completed`, `Needs Revision`.
  - Real-time search by subject, category, or lecture title.
  - Multi-criteria filtering (All, Completed, Pending, Needs Revision) and sorting (Name, Priority, Completion %, Rating).

### 4. Real Interactive Calendar
- **3 Dynamic Views**: Full Month Grid, Week View, and Day Agenda View.
- **Real Calendar Engine**: Handles leap years, correct month lengths, and year boundaries accurately.
- **Configurable First Day**: Saturday (standard in Egyptian universities), Sunday, or Monday.
- **Task Markers & Inspector**: Visual indicator chips on dates with scheduled study sessions, plus an interactive selected-date inspector panel.
- **Task Management**: Add, edit, reschedule, or complete tasks directly from the calendar.
- **Filters**: Filter calendar tasks by subject, priority (Urgent, High, Medium, Low), or completion status.

### 5. Dedicated "Today's Tasks" Agenda
- Reads from the centralized persistent study task database.
- Date navigation (`Previous Day`, `Today`, `Next Day`) allowing flexible schedule review without altering stored records.
- Daily target progress bar and completion percentage.
- Grouping options by Priority or Time of Day (Morning, Afternoon, Evening, Anytime).
- Optional auto-completion of associated lectures upon task completion.

### 6. Topic Progression & Analytics
- **Genuine Data-Driven Metrics**: Zero fabricated statistics. All KPIs and curves reflect actual recorded activity.
- **Key KPIs**: Overall Lecture Completion %, Overall Task Completion %, Total Study Time (recorded/estimated hours), Current Study Streak (days), Best Study Streak, Highest Progress Subject, Subject Requiring Attention, Average Daily Completed Tasks.
- **Interactive Native SVG Charts**:
  1. *Daily Study Activity*: Completed tasks and lectures over 7, 30, 90, or 365 days.
  2. *Lecture Completion Trend*: Cumulative progression curve over time.
  3. *Subject Progress Comparison*: Comparative horizontal bar chart across all 5 subjects.
  4. *Task Completion Rate*: Circular SVG gauge/donut comparing completed vs pending tasks.
  5. *Study Time by Subject*: Distribution of study hours across subjects.
  6. *Weekly Productivity*: Task completion frequency mapped across days of the week.
  7. *Subject Difficulty Distribution*: Breakdown of Easy, Medium, and Hard topics.

### 7. Persistence & Backup Management
- **Zero-Backend Privacy**: Powered by a versioned browser `localStorage` engine (`rabea_med_v1_store`).
- **Complete JSON Backup**: One-click download of all subjects, lectures, ratings, tasks, and settings.
- **Safe JSON Restore**: Validates structure before replacing data, with confirmation dialog.
- **CSV Data Export**: Download curriculum progress and study tasks as CSV spreadsheets.
- **Danger Zone**: Safe restoration of default curriculum or complete database wipe.

---

## 🎨 Visual Identity & Design System

- **Primary Colors**:
  - Deep Navy: `#101D35`
  - Secondary Navy: `#172947`
  - Rich Gold: `#D4A62F`
  - Dark Gold: `#B88A20`
  - Light Gold: `#F2D98A`
  - Main Background: `#F5F6F8`
  - Card Background: `#FFFFFF`
  - Success Green: `#27966B`
  - Danger Red: `#D94A4A`
- **Right Sidebar**: Anchored to the right side of the screen on desktop displays, providing effortless thumb/mouse reach, and collapsing into a smooth right-sliding drawer on mobile devices.
- **Clean Typography**: Combines `Cairo` for the Arabic title **رابعة طب** with `Inter` for all English interface labels.
- **No Third-Party Frameworks**: Built exclusively with semantic HTML5, modern CSS3 (Custom Properties & Flex/Grid), and vanilla ECMAScript.

---

## 📂 Project Architecture

```
d:\رابعة/
├── index.html              # Main application shell with semantic markup and modals
├── README.md               # Project documentation and deployment guide
├── assets/
│   └── logo.svg            # Custom geometric numeral 4 luxury brand mark
├── css/
│   ├── variables.css       # Navy & Gold color tokens, typography, radii, transitions
│   ├── main.css            # Base reset, layout (right sidebar + topbar), mobile drawer
│   ├── components.css      # Reusable cards, buttons, badges, modals, toasts, progress bars
│   └── views.css           # View-specific styles for Dashboard, Subjects, Calendar, Analytics
└── js/
    ├── data-default.js     # Official initial curriculum dataset (5 subjects, 89 lectures)
    ├── storage.js          # Centralized versioned storage service, import/export & events
    ├── ui.js               # SPA navigation router, modal manager, toast notifications
    ├── countdown.js        # Live exam countdown engine with second-by-second updates
    ├── dashboard.js        # Dynamic overview cards, today focus widget, quick actions
    ├── subjects.js         # Curriculum manager, categories accordion, star ratings, filters
    ├── tasks.js            # Task controller & Today's Agenda with date shifting
    ├── calendar.js         # Month, week, day calendar engine with leap year logic
    ├── analytics.js        # True streak calculation, study time, native SVG charts
    ├── settings.js         # User preferences, exam date configuration, CSV & JSON backup
    └── app.js              # Application bootstrapper and lifecycle coordinator
```

---

## 🚀 How to Run Locally

Because the application is built entirely with vanilla web technologies and zero dependencies, you can run it in multiple easy ways:

### Method 1: Direct Browser Launch
Simply double-click `index.html` or drag and drop `index.html` into any modern desktop browser (Chrome, Edge, Firefox, Safari).

### Method 2: Local Static Server
If you prefer running through `http://localhost`:

**Using Node.js (`npx`):**
```bash
npx serve .
```

**Using Python 3:**
```bash
python -m http.server 8080
```
Then open `http://localhost:8080` in your browser.

**Using VS Code Live Server:**
Right-click `index.html` and click **"Open with Live Server"**.

---

## 🌐 How to Deploy Online

### 1. GitHub Pages
1. Push this repository to GitHub.
2. In your GitHub repository, navigate to **Settings > Pages**.
3. Under **Build and deployment > Branch**, select `main` (or `master`) branch and folder `/ (root)`.
4. Click **Save**. Your medical study suite will be live at `https://<username>.github.io/<repo-name>/`.

### 2. Netlify
1. Log in to [Netlify](https://www.netlify.com/).
2. Drag and drop the `رابعة` folder directly into the Netlify dashboard.
3. Your application is instantly deployed with global CDN distribution and SSL enabled.

### 3. Vercel
1. Install Vercel CLI (`npm i -g vercel`) and run `vercel`, or import your GitHub repository directly from the Vercel dashboard.
2. Deployment is zero-config for static HTML/JS projects.

---

## 🔒 Multi-Device Data Synchronization Note

- **Current Implementation**: All study progress, completion checkboxes, ratings, notes, and scheduled tasks are stored locally on your device via browser `localStorage`.
- **Privacy First**: Your study data never leaves your computer or browser without your explicit export.
- **Transferring Between Devices**: Use the **Export JSON** button in the Settings page to download your latest study progress, then click **Restore JSON** on your second computer or tablet to resume immediately.
- **Cloud Backend Roadmap**: The centralized `StorageService` in `js/storage.js` is structured cleanly with an event-driven architecture so that a RESTful or Firebase backend (e.g., Supabase, Firebase Firestore, or Node/Express) can be connected seamlessly in the future without rewriting UI components.
