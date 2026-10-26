const storedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let tasks = storedTasks.map((task) => ({
    ...task,
    id: task.id || createTaskId(),
    completed: Boolean(task.completed)
}));
let currentFilter = "all";

function createTaskId() {
    return window.crypto?.randomUUID?.() ||
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function addTask() {
    const taskInput = document.getElementById("taskInput");
    const priority = document.getElementById("priority");
    const deadline = document.getElementById("deadline");
    const taskText = taskInput.value.trim();

    if (!taskText) {
        alert("Enter a task");
        taskInput.focus();
        return;
    }

    tasks.push({
        id: createTaskId(),
        text: taskText,
        priority: priority.value,
        deadline: deadline.value,
        completed: false
    });

    taskInput.value = "";
    deadline.value = "";
    saveTasks();
    displayTasks();
    taskInput.focus();
}

function displayTasks() {
    const taskList = document.getElementById("taskList");
    const searchValue = document.getElementById("searchInput").value.trim().toLowerCase();
    const filteredTasks = tasks.filter((task) => {
        const matchesSearch = task.text.toLowerCase().includes(searchValue);
        const matchesFilter = currentFilter === "all" ||
            (currentFilter === "completed" ? task.completed : !task.completed);
        return matchesSearch && matchesFilter;
    });

    taskList.replaceChildren();

    filteredTasks.forEach((task) => {
        const li = document.createElement("li");
        const info = document.createElement("div");
        const text = document.createElement("span");
        const priority = document.createElement("span");
        const actions = document.createElement("div");
        const completeButton = document.createElement("button");
        const editButton = document.createElement("button");
        const deleteButton = document.createElement("button");

        info.className = `task-info${task.completed ? " completed" : ""}`;
        text.textContent = task.text;
        priority.className = `priority priority-${task.priority.toLowerCase()}`;
        priority.textContent = `(${task.priority})`;
        info.append(text, priority);

        if (task.deadline) {
            const date = document.createElement("time");
            date.className = "deadline";
            date.dateTime = task.deadline;
            date.textContent = new Date(`${task.deadline}T00:00:00`).toLocaleDateString();
            info.append(date);
        }

        actions.className = "actions";
        completeButton.className = "completeBtn";
        completeButton.type = "button";
        completeButton.textContent = "✔";
        completeButton.setAttribute("aria-label", task.completed ? "Mark pending" : "Complete task");
        completeButton.addEventListener("click", () => toggleTask(task.id));

        editButton.className = "editBtn";
        editButton.type = "button";
        editButton.textContent = "✎";
        editButton.setAttribute("aria-label", "Edit task");
        editButton.addEventListener("click", () => editTask(task.id));

        deleteButton.className = "deleteBtn";
        deleteButton.type = "button";
        deleteButton.textContent = "✖";
        deleteButton.setAttribute("aria-label", "Delete task");
        deleteButton.addEventListener("click", () => deleteTask(task.id));

        actions.append(completeButton, editButton, deleteButton);
        li.append(info, actions);
        taskList.append(li);
    });

    document.querySelectorAll(".filter-section button").forEach((button) => {
        button.classList.toggle("active", button.dataset.filter === currentFilter);
    });
}

function updateTask(id, updates) {
    tasks = tasks.map((task) => task.id === id ? { ...task, ...updates } : task);
    saveTasks();
    displayTasks();
}

function toggleTask(id) {
    const task = tasks.find((item) => item.id === id);
    if (task) updateTask(id, { completed: !task.completed });
}

function deleteTask(id) {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
    displayTasks();
}

function editTask(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    const updatedTask = prompt("Edit Task", task.text);
    if (updatedTask === null) return;

    const text = updatedTask.trim();
    if (!text) return;

    updateTask(id, { text });
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function filterTasks(type) {
    currentFilter = type;
    displayTasks();
}

function searchTask() {
    displayTasks();
}

function toggleTheme() {
    const isDark = document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", String(isDark));
    document.getElementById("themeToggle").textContent = isDark ? "Light Mode" : "Dark Mode";
}

document.getElementById("taskInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") addTask();
});

const darkMode = localStorage.getItem("darkMode") === "true";
document.body.classList.toggle("dark-mode", darkMode);
document.getElementById("themeToggle").textContent = darkMode ? "Light Mode" : "Dark Mode";
displayTasks();
