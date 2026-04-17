// ============================================
// LOCKIN — App Logic
// Tasks, subtasks, timers, localStorage, sorting
// ============================================

const STORE_KEY = 'lockin_tasks';
const THEME_KEY = 'lockin_theme';

// --- State ---
let tasks = [];
let timerInterval = null;

// --- DOM refs ---
const $ = (sel) => document.querySelector(sel);
const heroDays   = $('#hero-days');
const heroHours  = $('#hero-hours');
const heroMins   = $('#hero-mins');
const heroSecs   = $('#hero-secs');
const heroName   = $('#hero-task-name');
const heroDeadline = $('#hero-deadline');
const heroEl     = $('#hero');
const taskListEl = $('#task-list');
const emptyState = $('#empty-state');
const addBtn     = $('#add-task-btn');
const addForm    = $('#add-task-form');
const titleInput = $('#task-title-input');
const deadlineInput = $('#task-deadline-input');
const cancelBtn  = $('#cancel-add-btn');
const themeToggle = $('#theme-toggle');

// --- Utility ---
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(tasks));
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  } catch {
    tasks = [];
  }
}

function formatCountdown(ms) {
  if (ms <= 0) {
    // Show count-up for overdue
    const overSec = Math.floor(Math.abs(ms) / 1000);
    const days  = String(Math.floor(overSec / 86400)).padStart(2, '0');
    const hours = String(Math.floor((overSec % 86400) / 3600)).padStart(2, '0');
    const mins  = String(Math.floor((overSec % 3600) / 60)).padStart(2, '0');
    const secs  = String(overSec % 60).padStart(2, '0');
    return { days, hours, mins, secs, overdue: true };
  }
  const totalSec = Math.floor(ms / 1000);
  const days  = String(Math.floor(totalSec / 86400)).padStart(2, '0');
  const hours = String(Math.floor((totalSec % 86400) / 3600)).padStart(2, '0');
  const mins  = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const secs  = String(totalSec % 60).padStart(2, '0');
  return { days, hours, mins, secs, overdue: false };
}

function formatTimerSmall(ms) {
  if (ms <= 0) {
    const overSec = Math.floor(Math.abs(ms) / 1000);
    const h = Math.floor(overSec / 3600);
    const m = Math.floor((overSec % 3600) / 60);
    const s = overSec % 60;
    return `overdue ${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
  }
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (days > 0) return `${days}d ${h}h ${m}m ${s}s`;
  if (h > 0)    return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function formatDeadline(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// --- Hero Timer ---
function updateHero() {
  const active = tasks.find(t => !t.completed);
  if (!active) {
    heroDays.textContent = '00';
    heroHours.textContent = '00';
    heroMins.textContent = '00';
    heroSecs.textContent = '00';
    heroName.textContent = 'all done 🎉';
    heroDeadline.textContent = '';
    heroEl.classList.remove('overdue');
    heroEl.classList.add('completed');
    return;
  }

  // Pick the task with the nearest deadline, or the first one
  const withDeadline = active.filter(t => t.deadline);
  const current = withDeadline.length > 0
    ? withDeadline.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0]
    : active[0];

  if (current.deadline) {
    const remaining = new Date(current.deadline).getTime() - Date.now();
    const cd = formatCountdown(remaining);
    heroDays.textContent = cd.days;
    heroHours.textContent = cd.hours;
    heroMins.textContent = cd.mins;
    heroSecs.textContent = cd.secs;
    heroEl.classList.toggle('overdue', cd.overdue);
    heroEl.classList.remove('completed');
  } else {
    heroDays.textContent = '—';
    heroHours.textContent = '—';
    heroMins.textContent = '—';
    heroSecs.textContent = '—';
    heroEl.classList.remove('overdue', 'completed');
  }

  heroName.textContent = current.title;
  heroDeadline.textContent = current.deadline ? formatDeadline(current.deadline) : 'no deadline';
}

// --- Task Timer Updates ---
function updateTaskTimers() {
  tasks.forEach(task => {
    const el = document.querySelector(`[data-id="${task.id}"] .task-timer`);
    if (!el) return;
    if (task.completed) {
      el.textContent = 'completed ✓';
      el.classList.remove('overdue', 'no-deadline');
      return;
    }
    if (!task.deadline) {
      el.textContent = 'no deadline';
      el.classList.add('no-deadline');
      el.classList.remove('overdue');
      return;
    }
    const remaining = new Date(task.deadline).getTime() - Date.now();
    el.textContent = formatTimerSmall(remaining);
    el.classList.toggle('overdue', remaining <= 0);
    el.classList.remove('no-deadline');
  });
}

// --- Rendering ---
function render() {
  taskListEl.innerHTML = '';
  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  // Show active tasks in their saved order
  activeTasks.forEach((task, i) => {
    taskListEl.appendChild(createTaskEl(task, i, activeTasks.length));
  });

  // Show completed at the bottom
  completedTasks.forEach((task) => {
    taskListEl.appendChild(createTaskEl(task, -1, -1));
  });

  emptyState.classList.toggle('visible', tasks.length === 0);
  updateHero();
  updateTaskTimers();
}

function createTaskEl(task, index, total) {
  const li = document.createElement('li');
  li.className = 'task-item';
  li.setAttribute('data-id', task.id);

  const remaining = task.deadline
    ? new Date(task.deadline).getTime() - Date.now()
    : null;

  const timerClass = task.completed ? '' : (remaining !== null && remaining <= 0 ? 'overdue' : (remaining === null ? 'no-deadline' : ''));
  const timerText = task.completed
    ? 'completed ✓'
    : (remaining !== null ? formatTimerSmall(remaining) : 'no deadline');

  li.innerHTML = `
    <div class="task-top">
      <button class="circle-check ${task.completed ? 'checked' : ''}" aria-label="Complete task" data-action="complete">
        <svg viewBox="0 0 16 16" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline class="check-path" points="3.5 8.5 6.5 11.5 12.5 5.5"/>
        </svg>
      </button>
      <div class="task-body">
        <div class="task-title">${escHtml(task.title)}</div>
        <div class="task-timer ${timerClass}">${timerText}</div>
        <ul class="subtask-list">
          ${task.subtasks.map((st, si) => `
            <li class="subtask-item">
              <button class="subtask-check ${st.done ? 'checked' : ''}" data-action="toggle-subtask" data-sub="${si}" aria-label="Toggle subtask">
                <svg viewBox="0 0 12 12" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><polyline points="2 6 5 9 10 3.5"/></svg>
              </button>
              <span class="subtask-label ${st.done ? 'checked' : ''}">${escHtml(st.text)}</span>
              <button class="subtask-delete" data-action="delete-subtask" data-sub="${si}" aria-label="Delete subtask">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </li>
          `).join('')}
        </ul>
        ${!task.completed ? `
        <div class="add-subtask-row">
          <input class="add-subtask-input" placeholder="add subtask…" data-action="add-subtask" autocomplete="off">
          <button class="add-subtask-btn" data-action="add-subtask-btn">add</button>
        </div>
        ` : ''}
      </div>
      <div class="task-actions">
        ${index >= 0 ? `
          <button class="action-btn" data-action="move-up" aria-label="Move up" ${index === 0 ? 'disabled' : ''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <button class="action-btn" data-action="move-down" aria-label="Move down" ${index >= total - 1 ? 'disabled' : ''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        ` : ''}
        <button class="action-btn delete-btn" data-action="delete" aria-label="Delete task">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
        </button>
      </div>
    </div>
  `;
  return li;
}

function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// --- Actions ---
function addTask(title, deadline) {
  const task = {
    id: uid(),
    title: title.trim(),
    deadline: deadline || null,
    completed: false,
    subtasks: [],
    createdAt: Date.now()
  };
  tasks.push(task);
  save();
  render();
}

function completeTask(id) {
  const el = document.querySelector(`[data-id="${id}"]`);
  const task = tasks.find(t => t.id === id);
  if (!task || task.completed) return;

  // Mark as completed in state and save immediately for data integrity
  task.completed = true;
  save();

  // Animate the checkbox first
  const check = el.querySelector('.circle-check');
  check.classList.add('checked');

  // Then animate the whole task out
  setTimeout(() => {
    el.classList.add('completing');
  }, 200);

  // After animation finishes, re-render (filter by animation name to avoid child animations)
  let handled = false;
  const finish = () => {
    if (handled) return;
    handled = true;
    render();
  };

  el.addEventListener('animationend', (e) => {
    if (e.animationName === 'task-complete' || e.target === el) {
      finish();
    }
  }, { once: true });

  // Fallback: if animationend doesn't fire (e.g. reduced motion), force after timeout
  setTimeout(finish, 800);
}

function uncompleteTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = false;
  save();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
}

function moveTask(id, direction) {
  const activeTasks = tasks.filter(t => !t.completed);
  const idx = activeTasks.findIndex(t => t.id === id);
  if (idx < 0) return;
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= activeTasks.length) return;

  // Swap in the full tasks array
  const fullIdx = tasks.findIndex(t => t.id === activeTasks[idx].id);
  const fullNewIdx = tasks.findIndex(t => t.id === activeTasks[newIdx].id);
  [tasks[fullIdx], tasks[fullNewIdx]] = [tasks[fullNewIdx], tasks[fullIdx]];
  save();
  render();
}

function addSubtask(taskId, text) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  task.subtasks.push({ text: text.trim(), done: false });
  save();
  render();
}

function toggleSubtask(taskId, subIndex) {
  const task = tasks.find(t => t.id === taskId);
  if (!task || !task.subtasks[subIndex]) return;
  task.subtasks[subIndex].done = !task.subtasks[subIndex].done;
  save();
  render();
}

function deleteSubtask(taskId, subIndex) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  task.subtasks.splice(subIndex, 1);
  save();
  render();
}

// --- Event Delegation ---
taskListEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const taskEl = btn.closest('.task-item');
  const taskId = taskEl?.dataset.id;
  if (!taskId) return;

  switch (action) {
    case 'complete':
      const task = tasks.find(t => t.id === taskId);
      if (task?.completed) {
        uncompleteTask(taskId);
      } else {
        completeTask(taskId);
      }
      break;
    case 'delete':
      deleteTask(taskId);
      break;
    case 'move-up':
      moveTask(taskId, -1);
      break;
    case 'move-down':
      moveTask(taskId, 1);
      break;
    case 'toggle-subtask':
      toggleSubtask(taskId, parseInt(btn.dataset.sub));
      break;
    case 'delete-subtask':
      deleteSubtask(taskId, parseInt(btn.dataset.sub));
      break;
    case 'add-subtask-btn': {
      const input = taskEl.querySelector('.add-subtask-input');
      if (input.value.trim()) {
        addSubtask(taskId, input.value);
      }
      break;
    }
  }
});

taskListEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.classList.contains('add-subtask-input')) {
    const taskEl = e.target.closest('.task-item');
    const taskId = taskEl?.dataset.id;
    if (taskId && e.target.value.trim()) {
      addSubtask(taskId, e.target.value);
    }
  }
});

// --- Add Task Form ---
addBtn.addEventListener('click', () => {
  addBtn.style.display = 'none';
  addForm.classList.add('visible');
  titleInput.focus();
});

cancelBtn.addEventListener('click', () => {
  addForm.classList.remove('visible');
  addBtn.style.display = '';
  addForm.reset();
});

addForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  addTask(title, deadlineInput.value || null);
  addForm.classList.remove('visible');
  addBtn.style.display = '';
  addForm.reset();
});

// --- Theme ---
function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem(THEME_KEY, 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem(THEME_KEY, 'dark');
  }
});

// --- Global Timer Loop ---
function startTimerLoop() {
  // Use a single interval — compute remaining time from absolute deadline each tick
  timerInterval = setInterval(() => {
    updateHero();
    updateTaskTimers();
  }, 1000);
}

// --- Init ---
function init() {
  loadTheme();
  load();
  render();
  startTimerLoop();
}

init();
