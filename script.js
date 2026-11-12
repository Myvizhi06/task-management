/**
 * TaskFlow - Advanced Kanban & Task Management Application Logic
 * Pure Vanilla JavaScript with LocalStorage & HTML5 Drag and Drop
 */

// ============================================================================
// Default Tasks Seed
// ============================================================================
const DEFAULT_TASKS = [
  {
    id: "task-1",
    title: "Implement OAuth2 Social Login",
    description: "Support Google, GitHub, and Apple SSO with JWT token refresh flow.",
    status: "todo",
    priority: "High",
    tag: "Dev",
    assignee: "Alex Chen",
    dueDate: "2026-11-20"
  },
  {
    id: "task-2",
    title: "Redesign Checkout & Payment Flow",
    description: "Simplify credit card input, add Apple Pay one-click button, and conduct A/B testing.",
    status: "inprogress",
    priority: "High",
    tag: "Design",
    assignee: "Sarah Connor",
    dueDate: "2026-11-18"
  },
  {
    id: "task-3",
    title: "Database Query Index Optimization",
    description: "Add compound indexes on users and orders table to drop query response time below 50ms.",
    status: "inprogress",
    priority: "Medium",
    tag: "Dev",
    assignee: "Devin Brooks",
    dueDate: "2026-11-22"
  },
  {
    id: "task-4",
    title: "Fix Mobile Navigation Drawer Glitch",
    description: "Resolved z-index conflict causing hamburger menu to hide behind video container on iOS.",
    status: "review",
    priority: "Medium",
    tag: "Bug",
    assignee: "Maya Lin",
    dueDate: "2026-11-15"
  },
  {
    id: "task-5",
    title: "Q4 Growth & User Acquisition Plan",
    description: "Finalize partner affiliate programs and Google Ads budget allocation.",
    status: "done",
    priority: "Low",
    tag: "Marketing",
    assignee: "Sarah Connor",
    dueDate: "2026-11-10"
  },
  {
    id: "task-6",
    title: "Setup Automated CI/CD Deployment",
    description: "Automate automated linting, test suite execution, and push-to-deploy on Vercel.",
    status: "done",
    priority: "High",
    tag: "Dev",
    assignee: "Devin Brooks",
    dueDate: "2026-11-08"
  }
];

// ============================================================================
// State Management
// ============================================================================
const STORAGE_KEYS = {
  TASKS: "taskflow_board_tasks_v1",
  THEME: "taskflow_theme_pref"
};

let tasks = [];
let currentFilterTag = "all";
let currentFilterPriority = "all";
let currentSearch = "";
let currentView = "board"; // 'board' or 'list'
let draggedTaskId = null;

// ============================================================================
// DOM References
// ============================================================================
const listTodo = document.getElementById("listTodo");
const listInProgress = document.getElementById("listInProgress");
const listReview = document.getElementById("listReview");
const listDone = document.getElementById("listDone");

const countTodo = document.getElementById("countTodo");
const countInProgress = document.getElementById("countInProgress");
const countReview = document.getElementById("countReview");
const countDone = document.getElementById("countDone");

const totalTasksCount = document.getElementById("totalTasksCount");
const inProgressCount = document.getElementById("inProgressCount");
const completedCount = document.getElementById("completedCount");
const completionRateText = document.getElementById("completionRateText");
const progressBarFill = document.getElementById("progressBarFill");

const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const priorityFilter = document.getElementById("priorityFilter");
const tagFilters = document.getElementById("tagFilters");

// Views
const boardView = document.getElementById("boardView");
const listView = document.getElementById("listView");
const viewBoardBtn = document.getElementById("viewBoardBtn");
const viewListBtn = document.getElementById("viewListBtn");
const listTableBody = document.getElementById("listTableBody");

// Modal
const taskModalBackdrop = document.getElementById("taskModalBackdrop");
const closeTaskModalBtn = document.getElementById("closeTaskModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const openCreateModalBtn = document.getElementById("openCreateModalBtn");
const taskForm = document.getElementById("taskForm");
const modalTitle = document.getElementById("modalTitle");
const editTaskId = document.getElementById("editTaskId");

// Form inputs
const taskTitle = document.getElementById("taskTitle");
const taskDesc = document.getElementById("taskDesc");
const taskStatus = document.getElementById("taskStatus");
const taskPriority = document.getElementById("taskPriority");
const taskTag = document.getElementById("taskTag");
const taskDueDate = document.getElementById("taskDueDate");
const taskAssignee = document.getElementById("taskAssignee");

// Theme
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeIcon = document.getElementById("themeIcon");
const themeLabel = document.getElementById("themeLabel");
const toastContainer = document.getElementById("toastContainer");

// ============================================================================
// Initialization
// ============================================================================
function initApp() {
  loadTheme();
  loadTasks();
  renderAll();
  bindEvents();
}

// ----------------------------------------------------------------------------
// Local Storage Handling
// ----------------------------------------------------------------------------
function loadTasks() {
  const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
  if (stored) {
    try {
      tasks = JSON.parse(stored);
    } catch (e) {
      tasks = [...DEFAULT_TASKS];
    }
  } else {
    tasks = [...DEFAULT_TASKS];
    saveTasks();
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

// ----------------------------------------------------------------------------
// Theme Switching (Dark / Light)
// ----------------------------------------------------------------------------
function loadTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.THEME) || "dark";
  applyTheme(saved);
}

function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEYS.THEME, theme);

  if (theme === "light") {
    themeIcon.className = "fa-solid fa-moon";
    themeLabel.textContent = "Dark Mode";
  } else {
    themeIcon.className = "fa-solid fa-sun";
    themeLabel.textContent = "Light Mode";
  }
}

function toggleTheme() {
  const current = document.body.getAttribute("data-theme") || "dark";
  const target = current === "dark" ? "light" : "dark";
  applyTheme(target);
  showToast(`Switched to ${target} mode`);
}

// ============================================================================
// Rendering Logic
// ============================================================================
function getFilteredTasks() {
  return tasks.filter((t) => {
    const matchTag = currentFilterTag === "all" || t.tag.toLowerCase() === currentFilterTag.toLowerCase();
    const matchPriority = currentFilterPriority === "all" || t.priority === currentFilterPriority;
    const matchSearch =
      !currentSearch.trim() ||
      t.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(currentSearch.toLowerCase()) ||
      t.assignee.toLowerCase().includes(currentSearch.toLowerCase());
    return matchTag && matchPriority && matchSearch;
  });
}

function renderAll() {
  updateMetrics();
  if (currentView === "board") {
    renderKanbanBoard();
  } else {
    renderListView();
  }
}

function updateMetrics() {
  const total = tasks.length;
  const inProg = tasks.filter((t) => t.status === "inprogress").length;
  const completed = tasks.filter((t) => t.status === "done").length;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  totalTasksCount.textContent = total;
  inProgressCount.textContent = inProg;
  completedCount.textContent = completed;
  completionRateText.textContent = `${rate}%`;
  progressBarFill.style.width = `${rate}%`;
}

function renderKanbanBoard() {
  const filtered = getFilteredTasks();

  const groups = {
    todo: [],
    inprogress: [],
    review: [],
    done: []
  };

  filtered.forEach((t) => {
    if (groups[t.status]) {
      groups[t.status].push(t);
    } else {
      groups.todo.push(t);
    }
  });

  // Render columns
  renderColumn(listTodo, groups.todo);
  renderColumn(listInProgress, groups.inprogress);
  renderColumn(listReview, groups.review);
  renderColumn(listDone, groups.done);

  // Update counters
  countTodo.textContent = groups.todo.length;
  countInProgress.textContent = groups.inprogress.length;
  countReview.textContent = groups.review.length;
  countDone.textContent = groups.done.length;
}

function renderColumn(container, items) {
  container.innerHTML = "";
  if (items.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 20px 0; color: var(--text-dim); font-size: 0.8rem;">No tasks</div>`;
    return;
  }

  items.forEach((task) => {
    container.appendChild(createTaskCard(task));
  });
}

function createTaskCard(t) {
  const card = document.createElement("div");
  card.className = "task-card";
  card.draggable = true;
  card.dataset.id = t.id;

  const priorityClass = `priority-${t.priority.toLowerCase()}`;
  const tagClass = `tag-${t.tag.toLowerCase()}`;

  // Next and previous status triggers
  const statusSeq = ["todo", "inprogress", "review", "done"];
  const currIdx = statusSeq.indexOf(t.status);
  const prevStatus = currIdx > 0 ? statusSeq[currIdx - 1] : null;
  const nextStatus = currIdx < statusSeq.length - 1 ? statusSeq[currIdx + 1] : null;

  const prevBtn = prevStatus
    ? `<button class="btn-card-action btn-move" data-id="${t.id}" data-target="${prevStatus}" title="Move back"><i class="fa-solid fa-arrow-left"></i></button>`
    : "";
  const nextBtn = nextStatus
    ? `<button class="btn-card-action btn-move" data-id="${t.id}" data-target="${nextStatus}" title="Advance task"><i class="fa-solid fa-arrow-right"></i></button>`
    : "";

  card.innerHTML = `
    <div class="card-top">
      <span class="tag-badge ${tagClass}">${escapeHtml(t.tag)}</span>
      <span class="priority-badge ${priorityClass}">
        <i class="fa-solid fa-circle"></i> ${escapeHtml(t.priority)}
      </span>
    </div>
    <h4 class="card-title">${escapeHtml(t.title)}</h4>
    <p class="card-desc">${escapeHtml(t.description)}</p>
    <div class="card-bottom">
      <div class="card-due">
        <i class="fa-regular fa-calendar"></i>
        <span>${t.dueDate || "No deadline"}</span>
      </div>
      <div class="card-actions">
        ${prevBtn}
        ${nextBtn}
        <button class="btn-card-action btn-edit" data-id="${t.id}" title="Edit"><i class="fa-regular fa-pen-to-square"></i></button>
        <button class="btn-card-action delete btn-delete" data-id="${t.id}" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
      </div>
    </div>
  `;

  // Drag & drop event bindings
  card.addEventListener("dragstart", () => {
    draggedTaskId = t.id;
    card.classList.add("dragging");
  });

  card.addEventListener("dragend", () => {
    draggedTaskId = null;
    card.classList.remove("dragging");
  });

  return card;
}

function renderListView() {
  const filtered = getFilteredTasks();
  listTableBody.innerHTML = "";

  if (filtered.length === 0) {
    listTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 30px; color: var(--text-dim);">No tasks found.</td></tr>`;
    return;
  }

  filtered.forEach((t) => {
    const isDone = t.status === "done";
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>
        <input type="checkbox" class="task-checkbox" data-id="${t.id}" ${isDone ? "checked" : ""} />
      </td>
      <td style="font-weight: 700; ${isDone ? "text-decoration: line-through; opacity: 0.6;" : ""}">${escapeHtml(t.title)}</td>
      <td><span class="col-counter" style="text-transform: capitalize;">${t.status}</span></td>
      <td><span class="priority-badge priority-${t.priority.toLowerCase()}">${t.priority}</span></td>
      <td><span class="tag-badge tag-${t.tag.toLowerCase()}">${t.tag}</span></td>
      <td>${escapeHtml(t.assignee)}</td>
      <td>${t.dueDate || "-"}</td>
      <td>
        <button class="btn-card-action btn-edit" data-id="${t.id}" title="Edit"><i class="fa-regular fa-pen-to-square"></i></button>
        <button class="btn-card-action delete btn-delete" data-id="${t.id}" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
      </td>
    `;

    listTableBody.appendChild(tr);
  });
}

// ============================================================================
// Drag and Drop Column Handlers
// ============================================================================
function setupDragAndDrop() {
  const lists = [listTodo, listInProgress, listReview, listDone];

  lists.forEach((list) => {
    list.addEventListener("dragover", (e) => {
      e.preventDefault();
      list.classList.add("drag-over");
    });

    list.addEventListener("dragleave", () => {
      list.classList.remove("drag-over");
    });

    list.addEventListener("drop", (e) => {
      e.preventDefault();
      list.classList.remove("drag-over");

      const targetStatus = list.dataset.status;
      if (draggedTaskId && targetStatus) {
        moveTaskToStatus(draggedTaskId, targetStatus);
      }
    });
  });
}

function moveTaskToStatus(id, newStatus) {
  const task = tasks.find((t) => t.id === id);
  if (!task || task.status === newStatus) return;

  task.status = newStatus;
  saveTasks();
  renderAll();
  showToast(`Moved to ${newStatus.toUpperCase()}`);
}

// ============================================================================
// Task CRUD
// ============================================================================
function openCreateModal(defaultStatus = "todo") {
  editTaskId.value = "";
  taskForm.reset();
  taskStatus.value = defaultStatus;
  modalTitle.textContent = "Create New Task";
  taskModalBackdrop.style.display = "flex";
}

function openEditModal(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  editTaskId.value = task.id;
  taskTitle.value = task.title;
  taskDesc.value = task.description;
  taskStatus.value = task.status;
  taskPriority.value = task.priority;
  taskTag.value = task.tag;
  taskDueDate.value = task.dueDate || "";
  taskAssignee.value = task.assignee || "";

  modalTitle.textContent = "Edit Task";
  taskModalBackdrop.style.display = "flex";
}

function closeModal() {
  taskModalBackdrop.style.display = "none";
}

function handleSaveTask(e) {
  e.preventDefault();

  const id = editTaskId.value;
  const title = taskTitle.value.trim();
  const description = taskDesc.value.trim();
  const status = taskStatus.value;
  const priority = taskPriority.value;
  const tag = taskTag.value;
  const dueDate = taskDueDate.value;
  const assignee = taskAssignee.value.trim() || "Unassigned";

  if (!title) return;

  if (id) {
    // Editing existing task
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.title = title;
      task.description = description;
      task.status = status;
      task.priority = priority;
      task.tag = tag;
      task.dueDate = dueDate;
      task.assignee = assignee;
      showToast("Task updated!");
    }
  } else {
    // Creating new task
    const newTask = {
      id: "task-" + Date.now(),
      title,
      description,
      status,
      priority,
      tag,
      dueDate,
      assignee
    };
    tasks.unshift(newTask);
    showToast("Task created!");
  }

  saveTasks();
  closeModal();
  renderAll();
}

function deleteTask(id) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderAll();
  showToast("Task deleted.");
}

// ============================================================================
// Utilities
// ============================================================================
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--primary);"></i> <span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ============================================================================
// Event Listeners Binding
// ============================================================================
function bindEvents() {
  setupDragAndDrop();

  // Create Modal Triggers
  openCreateModalBtn.addEventListener("click", () => openCreateModal("todo"));
  closeTaskModalBtn.addEventListener("click", closeModal);
  cancelModalBtn.addEventListener("click", closeModal);
  taskModalBackdrop.addEventListener("click", (e) => {
    if (e.target === taskModalBackdrop) closeModal();
  });
  taskForm.addEventListener("submit", handleSaveTask);

  // Column inline add button delegation
  document.querySelectorAll(".btn-add-inline").forEach((btn) => {
    btn.addEventListener("click", () => {
      openCreateModal(btn.dataset.status);
    });
  });

  // Task actions delegation in board view
  boardView.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".btn-edit");
    if (editBtn) {
      openEditModal(editBtn.dataset.id);
      return;
    }

    const deleteBtn = e.target.closest(".btn-delete");
    if (deleteBtn) {
      deleteTask(deleteBtn.dataset.id);
      return;
    }

    const moveBtn = e.target.closest(".btn-move");
    if (moveBtn) {
      moveTaskToStatus(moveBtn.dataset.id, moveBtn.dataset.target);
      return;
    }
  });

  // Table actions delegation in list view
  listTableBody.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".btn-edit");
    if (editBtn) {
      openEditModal(editBtn.dataset.id);
      return;
    }

    const deleteBtn = e.target.closest(".btn-delete");
    if (deleteBtn) {
      deleteTask(deleteBtn.dataset.id);
      return;
    }

    const checkbox = e.target.closest(".task-checkbox");
    if (checkbox) {
      const id = checkbox.dataset.id;
      moveTaskToStatus(id, checkbox.checked ? "done" : "todo");
      return;
    }
  });

  // View switches
  viewBoardBtn.addEventListener("click", () => {
    currentView = "board";
    viewBoardBtn.classList.add("active");
    viewListBtn.classList.remove("active");
    boardView.style.display = "grid";
    listView.style.display = "none";
    document.getElementById("pageTitle").textContent = "Sprint Board";
    renderAll();
  });

  viewListBtn.addEventListener("click", () => {
    currentView = "list";
    viewListBtn.classList.add("active");
    viewBoardBtn.classList.remove("active");
    boardView.style.display = "none";
    listView.style.display = "block";
    document.getElementById("pageTitle").textContent = "Task List View";
    renderAll();
  });

  // Tag filters in sidebar
  tagFilters.addEventListener("click", (e) => {
    const pill = e.target.closest(".tag-pill");
    if (!pill) return;

    document.querySelectorAll(".tag-pill").forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    currentFilterTag = pill.dataset.tag;
    renderAll();
  });

  // Priority Filter
  priorityFilter.addEventListener("change", (e) => {
    currentFilterPriority = e.target.value;
    renderAll();
  });

  // Search input
  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value;
    clearSearchBtn.style.display = currentSearch ? "block" : "none";
    renderAll();
  });

  clearSearchBtn.addEventListener("click", () => {
    currentSearch = "";
    searchInput.value = "";
    clearSearchBtn.style.display = "none";
    renderAll();
  });

  // Theme toggle
  themeToggleBtn.addEventListener("click", toggleTheme);

  // Analytics click toast
  document.getElementById("navMetricsBtn").addEventListener("click", () => {
    showToast(`Sprint Analytics: ${tasks.filter((t) => t.status === "done").length} of ${tasks.length} tasks completed!`);
  });
}

// Start
document.addEventListener("DOMContentLoaded", initApp);
