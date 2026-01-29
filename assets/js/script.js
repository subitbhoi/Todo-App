const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");


let tasks = [];
let editingIndex = null;

addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});

function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        return;
    }

    tasks.push({
        text: taskText,
        completed: false
    });
    taskInput.value = "";
    saveTasks();
    renderTasks();
}

function loadTasks() {
  const storedTasks = localStorage.getItem("tasks");
if (storedTasks) {
    tasks = JSON.parse(storedTasks);
  }
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach(function (task, index) {
    const li = document.createElement("li");
    li.className = "task-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;

    checkbox.addEventListener("change", function (event) {
      event.stopPropagation();
      tasks[index].completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const leftGroup = document.createElement("div");
    leftGroup.className = "task-left";

    leftGroup.appendChild(checkbox);

    li.addEventListener("dblclick", function () {
        startEditTask(index);
    });

    if (editingIndex === index) {
      const input = document.createElement("input");
      input.type = "text";
      input.value = task.text;
      input.className = "task-edit-input";
      checkbox.setAttribute("aria-label", "Mark task as completed");


    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        saveEdit(index, input.value);
      }

      input.addEventListener("blur", function () {
        saveEdit(index, input.value);
      });

      if (event.key === "Escape") {
        cancelEdit();
      }
    });

    leftGroup.appendChild(input);

    setTimeout(() => {
       input.focus();
     }, 0);

    } else {
      const span = document.createElement("span");
      span.textContent = task.text;
      span.className = "task-text";

      leftGroup.appendChild(span);
    }
    li.appendChild(leftGroup);

    if (task.completed) {
      li.classList.add("completed");
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✕";
    deleteBtn.className = "task-delete";
    deleteBtn.setAttribute("aria-label", "Delete task");

    deleteBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}

function startEditTask(index) {
    editingIndex = index;
    renderTasks();
}

function saveEdit(index, newText) {
    const trimmedText = newText.trim();

    if (trimmedText === "") {
        cancelEdit();
        return;
    }

    tasks[index].text = trimmedText;
    editingIndex = null;
    saveTasks();
    renderTasks();
}

function cancelEdit() {
    editingIndex = null;
    renderTasks();
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

loadTasks();
renderTasks();