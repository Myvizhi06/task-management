live link
https://task-management-ruddy-chi.vercel.app/
# TaskFlow - Modern Kanban & Task Management System

A sleek, responsive project and task management dashboard built with **HTML5**, **CSS3**, and **Vanilla JavaScript**.

---

## 🚀 Live Demo & Deployment
- **GitHub Repository**: [https://github.com/Myvizhi06/task-management](https://github.com/Myvizhi06/task-management)
- **Vercel 1-Click Deploy Link**: [Deploy on Vercel](https://vercel.com/new/clone?repository-url=https://github.com/Myvizhi06/task-management)
- **GitHub Pages Link**: [https://myvizhi06.github.io/task-management/](https://myvizhi06.github.io/task-management/)

---

## 📁 File Structure

```text
task-management/
│
├── index.html       # Application layout (Sidebar, metrics bar, Kanban board, list view, task modal)
├── style.css        # Responsive styling, dual themes (Dark/Light), drag-and-drop visuals, badges
├── script.js        # HTML5 drag-and-drop, task CRUD, filter/search, progress calculation, LocalStorage
├── vercel.json      # Zero-config Vercel production routing
└── README.md        # Documentation and deployment guide
```

---

## 📋 Key Features

1. **Interactive HTML5 Drag-and-Drop Kanban Board**:
   - 4 Columns: **To Do**, **In Progress**, **Review / QA**, and **Done**.
   - Drag and drop tasks seamlessly between columns.
   - One-click advance / move-back buttons on each card for mobile convenience.
2. **Productivity Metrics Bar**:
   - Live counters for Total Tasks, In Progress, and Completed.
   - Dynamic sprint completion percentage (%) with an animated progress bar.
3. **Dual View Modes**:
   - **Kanban Board View**: Visual card-based board.
   - **Task List View**: Spreadsheet-style table view with checkboxes to mark tasks complete.
4. **Rich Task Creation & Editing**:
   - Modal form with Title, Description, Priority (High/Medium/Low), Tag (Dev, Design, Bug, etc.), Due Date, and Assignee.
5. **Real-Time Filters & Search**:
   - Search tasks by title, description, or assignee.
   - Filter by Priority and Label tag.
6. **Dark & Light Mode**:
   - Instant theme toggle persisted in `localStorage`.
7. **Local Storage**:
   - All tasks, edits, and column positions persist automatically across browser refreshes.
