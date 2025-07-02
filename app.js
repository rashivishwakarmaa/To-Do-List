"use strict";

const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const newTaskInput = document.getElementById("new-task-input");
const categorySelect = document.getElementById("category-select");
const filterButtons = document.querySelectorAll(".filter-btn");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const stickyNote = document.getElementById("sticky-note");
const deskClock = document.getElementById("desk-clock");
const iconSun = document.getElementById("icon-sun");
const iconMoon = document.getElementById("icon-moon");

let tasks = [];
let currentFilter = "all";

const MOTIVATIONAL_QUOTES = [
    "Believe you can and you're halfway there.",
    "The only way to do great work is to love what you do.",
    "Don't watch the clock; do what it does. Keep going.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Push yourself, because no one else is going to do it for you.",
  ];

const STORAGE_KEY = "cozy-todo-tasks";
const STORAGE_DARK_MODE_KEY = "cozy-todo-dark-mode";

function loadTasks() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      tasks = JSON.parse(stored);
      if (!Array.isArray(tasks)) tasks = [];
    } catch {
      tasks = [];
    }
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function generateId() {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date)) return "";
  return date.toLocaleString(undefined, {
    hour12: false,
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderTasks() {
  taskList.innerHTML = "";

  let filteredTasks;

  if (currentFilter === "all") {
    filteredTasks = tasks;
  } else if (currentFilter === "pending") {
    filteredTasks = tasks.filter((t) => !t.completed);
  } else if (currentFilter === "completed") {
    filteredTasks = tasks.filter((t) => t.completed);
  }

  if (filteredTasks.length === 0) {
    const emptyMsg = document.createElement("li");
    emptyMsg.textContent = "No tasks to show!";
    emptyMsg.style.textAlign = "center";
    emptyMsg.style.color = "var(--muted-olive)";
    emptyMsg.style.fontStyle = "italic";
    emptyMsg.style.padding = "20px";
    taskList.appendChild(emptyMsg);
    return;
  }

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-card";
    if (task.completed) li.classList.add("completed");
    li.dataset.id = task.id;

    // Checkbox Container
    const checkboxContainer = document.createElement("label");
    checkboxContainer.className = "checkbox-container";
    checkboxContainer.setAttribute("aria-label", "Mark task complete");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkboxContainer.appendChild(checkbox);

    const checkCustom = document.createElement("span");
    checkCustom.className = "checkbox-custom";
    checkCustom.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
    checkboxContainer.appendChild(checkCustom);

    li.appendChild(checkboxContainer);

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;
    taskText.setAttribute("tabindex", "0");
    li.appendChild(taskText);

    const taskDate = document.createElement("time");
    taskDate.className = "task-date";
    taskDate.dateTime = task.createdAt;
    taskDate.textContent = formatDate(task.createdAt);
    li.appendChild(taskDate);

    const categoryTag = document.createElement("span");
    categoryTag.className = `task-category category-${task.category}`;
    categoryTag.textContent = task.category[0].toUpperCase() + task.category.slice(1);
    li.appendChild(categoryTag);

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.setAttribute("aria-label", "Edit task");
    editBtn.title = "Edit task";
    editBtn.type = "button";
    editBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" >
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
      </svg>
    `;
    actionsDiv.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.setAttribute("aria-label", "Delete task");
    deleteBtn.title = "Delete task";
    deleteBtn.type = "button";
    deleteBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" >
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
        <path d="M10 11v6"></path>
        <path d="M14 11v6"></path>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
      </svg>
    `;
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(actionsDiv);

    taskList.appendChild(li);

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    let isEditing = false;
    editBtn.addEventListener("click", () => {
      if (isEditing) {
        const newText = taskText.textContent.trim();
        if (newText === "") {
          alert("Task cannot be empty.");
          taskText.textContent = task.text;
        } else {
          task.text = newText;
          saveTasks();
        }
        taskText.contentEditable = "false";
        taskText.blur();
        isEditing = false;
        editBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" >
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        `;
        li.classList.remove("editing");
      } else {
        taskText.contentEditable = "true";
        taskText.focus();
        document.execCommand("selectAll", false, null);
        document.getSelection().collapseToEnd();
        isEditing = true;
        editBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" >
            <path d="M19 21H5a2 2 0 0 1-2-2v-2h18v2a2 2 0 0 1-2 2zm-7-9l6 6-1.41 1.41-6-6v-4.41h-2v6.41h2V12z"/>
          </svg>
        `;
        li.classList.add("editing");
      }
    });

    taskText.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && isEditing) {
        e.preventDefault();
        editBtn.click();
      }
      if (e.key === "Enter" && !isEditing) {
        e.preventDefault();
      }
    });

    deleteBtn.addEventListener("click", () => {
      li.classList.add("removing");
      li.style.pointerEvents = "none";
      setTimeout(() => {
        tasks = tasks.filter((t) => t.id !== task.id);
        saveTasks();
        renderTasks();
      }, 500);
    });
  });
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = newTaskInput.value.trim();
  if (!text) {
    alert("Please enter a task.");
    return;
  }

  const category = categorySelect.value;

  const newTask = {
    id: generateId(),
    text,
    completed: false,
    createdAt: new Date().toISOString(),
    category,
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();

  taskForm.reset();
  newTaskInput.focus();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.filter === currentFilter) return;

    currentFilter = btn.dataset.filter;

    filterButtons.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", "false");
    });

    btn.classList.add("active");
    btn.setAttribute("aria-pressed", "true");

    renderTasks();
  });
});

function loadDarkMode() {
  const isDark = localStorage.getItem(STORAGE_DARK_MODE_KEY) === "true";
  if (isDark) {
    document.body.classList.add("dark-mode");
    iconSun.style.display = "block";
    iconMoon.style.display = "none";
  } else {
    document.body.classList.remove("dark-mode");
    iconSun.style.display = "none";
    iconMoon.style.display = "block";
  }
}

darkModeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");
  if (isDark) {
    iconSun.style.display = "block";
    iconMoon.style.display = "none";
  } else {
    iconSun.style.display = "none";
    iconMoon.style.display = "block";
  }
  localStorage.setItem(STORAGE_DARK_MODE_KEY, isDark.toString());
});

function updateClock() {
  const now = new Date();
  deskClock.textContent = now.toLocaleTimeString(undefined, {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
setInterval(updateClock, 1000);
updateClock();

let quoteIndex = 0;
function rotateQuote() {
  quoteIndex = (quoteIndex + 1) % MOTIVATIONAL_QUOTES.length;
  stickyNote.textContent = MOTIVATIONAL_QUOTES[quoteIndex];
}
setInterval(rotateQuote, 15000);

function init() {
  loadDarkMode();
  loadTasks();
  renderTasks();
  newTaskInput.focus();
}

init();