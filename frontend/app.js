const API_URL = "http://localhost:5000/api/tasks";

// ── On Page Load ───────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  fetchTasks();

  // Fix 3: Connect form submit event to handleSubmit
  document.getElementById("task-form").addEventListener("submit", function (e) {
    e.preventDefault();
    handleSubmit();
  });

  // Fix 4: Connect cancel button to resetForm
  document.getElementById("cancel-btn").addEventListener("click", resetForm);
});

// ── Fetch All Tasks ────────────────────────────────────
async function fetchTasks() {
  try {
    const res = await fetch(API_URL);
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
  }
}

// ── Render Tasks ───────────────────────────────────────
function renderTasks(tasks) {
  const list = document.getElementById("task-list");
  const countBadge = document.getElementById("task-count");

  list.innerHTML = "";
  countBadge.textContent = tasks.length;

  if (tasks.length === 0) {
    list.innerHTML = `<p class="empty-msg">No tasks yet — add one above to get started.</p>`;
    return;
  }

  tasks.forEach((task) => {
    const card = document.createElement("div");
    card.className = `task-card ${task.status === "completed" ? "completed" : ""}`;

    card.innerHTML = `
      <div class="task-info">
        <p class="task-title">${task.title}</p>
        ${task.description ? `<p class="task-description">${task.description}</p>` : ""}
        <div class="task-meta">
          <span class="badge badge-${task.priority}">${task.priority}</span>
          <span class="badge badge-${task.status}">${task.status}</span>
          <span class="task-due">Due: ${formatDate(task.due_date)}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="btn-edit" onclick="populateForm(${JSON.stringify(task).replace(/"/g, '&quot;')})">Edit</button>
        <button class="btn-delete" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;

    list.appendChild(card);
  });
}

// ── Handle Form Submit (Create or Update) ─────────────
async function handleSubmit() {
  const id = document.getElementById("task-id").value;
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const priority = document.getElementById("priority").value;
  const status = document.getElementById("status").value;
  const due_date = document.getElementById("due_date").value;

  const errorEl = document.getElementById("form-error");

  // Frontend validation
  if (!title || !priority || !due_date) {
    errorEl.textContent = "Title, priority and due date are required.";
    errorEl.classList.remove("hidden");
    return;
  }

  errorEl.classList.add("hidden");

  const payload = { title, description, priority, status, due_date };

  try {
    if (id) {
      // Edit mode → PUT
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      // Create mode → POST
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    fetchTasks();
  } catch (error) {
    console.error("Failed to save task:", error);
  }
}

// ── Populate Form for Editing ──────────────────────────
function populateForm(task) {
  document.getElementById("task-id").value = task.id;
  document.getElementById("title").value = task.title;
  document.getElementById("description").value = task.description || "";
  document.getElementById("priority").value = task.priority;
  document.getElementById("status").value = task.status;
  document.getElementById("due_date").value = task.due_date.split("T")[0];

  document.getElementById("form-title").textContent = "Edit Task";
  document.getElementById("submit-btn").textContent = "Update Task";
  document.getElementById("cancel-btn").classList.remove("hidden");

  // Scroll to form
  document.querySelector(".form-section").scrollIntoView({ behavior: "smooth" });
}

// ── Delete a Task ──────────────────────────────────────
async function deleteTask(id) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchTasks();
  } catch (error) {
    console.error("Failed to delete task:", error);
  }
}

// ── Reset Form ─────────────────────────────────────────
function resetForm() {
  document.getElementById("task-id").value = "";
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  document.getElementById("priority").value = "medium";
  document.getElementById("status").value = "pending";
  document.getElementById("due_date").value = "";

  document.getElementById("form-title").textContent = "New Task";
  document.getElementById("submit-btn").textContent = "Add Task";
  document.getElementById("cancel-btn").classList.add("hidden");
  document.getElementById("form-error").classList.add("hidden");
}

// ── Utility: Format Date ───────────────────────────────
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
