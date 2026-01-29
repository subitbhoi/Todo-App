// ⚠️ EXPERIMENTAL BRANCH
// Swipe gesture exploration (touch + mouse)
// Not merged into main due to UX/accessibility complexity

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");


let tasks = [];
let editingIndex = null;
let startX = 0;
let currentX = 0;
let isSwiping = false;

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
        completed: false,
        archived: false
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
    if (task.archived) return;
     
    const li = document.createElement("li");
    li.className = "task-item";

    const leftGroup = document.createElement("div");
    leftGroup.className = "task-left";

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

    if (task.completed) {
      li.classList.add("completed");
    }
    if (task.completed) {
  li.classList.add("completed");
}

const taskContent = document.createElement("div");
taskContent.className = "task-content";
taskContent.dataset.index = index;
taskContent.addEventListener("touchstart", onSwipeStart, { passive: true });
taskContent.addEventListener("mousedown", onSwipeStart);

taskContent.appendChild(leftGroup);

const completeAction = document.createElement("div");
completeAction.className = "swipe-actions swipe-right";
completeAction.textContent = "Complete";

const archiveAction = document.createElement("div");
archiveAction.className = "swipe-actions swipe-left";
archiveAction.textContent = "Archive";

li.appendChild(completeAction);
li.appendChild(archiveAction);
li.appendChild(taskContent);taskList.appendChild(li);
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

function onSwipeStart(event) {
    if (event.type === "mousedown") {
        startX = event.clientX;
        document.addEventListener("mousemove", onSwipeMove);
        document.addEventListener("mouseup", onSwipeEnd);
    } else {
        startX = event.touches[0].clientX;
    }
    isSwiping = true;
}

function onSwipeMove(event) {
    if (!isSwiping) return;

    if (event.type === "mousemove") {
        currentX = event.clientX;
    } else {
        currentX = event.touches[0].clientX;
    }

    const deltaX = currentX - startX;

    const activeTask = event.target.closest(".task-content");
    if (!activeTask) return;

    activeTask.style.transform = `translateX(${deltaX}px)`;
}

function onSwipeEnd(event) {
  isSwiping = false;

  const activeTask = event.target.closest(".task-content");
  if (!activeTask) return;

  const deltaX = currentX - startX;

  handleSwipeAction(activeTask, deltaX);

  document.removeEventListener("mousemove", onSwipeMove);
  document.removeEventListener("mouseup", onSwipeEnd);
}

function handleSwipeAction(taskContent, deltaX) {
  const REVEAL_THRESHOLD = 60;
  const ACTION_THRESHOLD = 140;

  const index = Number(taskContent.dataset.index);

  taskContent.style.transition = "transform 0.2s ease";

  if (deltaX > ACTION_THRESHOLD) {
    // FULL RIGHT → COMPLETE
    taskContent.style.transform = "translateX(100%)";

    setTimeout(() => {
      tasks[index].completed = true;
      saveTasks();
      renderTasks();
    }, 200);
  } 
  else if (deltaX < -ACTION_THRESHOLD) {
    // FULL LEFT → ARCHIVE
    taskContent.style.transform = "translateX(-100%)";

    setTimeout(() => {
      tasks[index].archived = true;
      saveTasks();
      renderTasks();
    }, 200);
  } 
  else if (deltaX > REVEAL_THRESHOLD) {
    // PARTIAL RIGHT → REVEAL COMPLETE
    taskContent.style.transform = "translateX(80px)";
  } 
  else if (deltaX < -REVEAL_THRESHOLD) {
    // PARTIAL LEFT → REVEAL ARCHIVE
    taskContent.style.transform = "translateX(-80px)";
  } 
  else {
    // TOO SMALL → RESET
    taskContent.style.transform = "translateX(0)";
  }

  setTimeout(() => {
    taskContent.style.transition = "";
  }, 200);
}
