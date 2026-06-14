const db = require("../db");

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const [tasks] = await db.query("SELECT * FROM tasks");
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve tasks", error });
  }
};

// Get a single task by ID
const getTaskById = async (req, res) => {
  try {
    const [task] = await db.query("SELECT * FROM tasks WHERE id = ?", [
      req.params.id,
    ]);
    if (task.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve task", error });
  }
};

// Create a new task
const createTask = async (req, res) => {
  const { title, description, status, priority, due_date } = req.body;

  // Validation
  if (!title || !priority || !due_date) {
    return res
      .status(400)
      .json({ message: "Title, priority and due_date are required" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO tasks (title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?)",
      [title, description || null, status || "pending", priority, due_date]
    );
    res.status(201).json({ message: "Task created", taskId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Failed to create task", error });
  }
};

// Update a task by ID
const updateTask = async (req, res) => {
  const { title, description, status, priority, due_date } = req.body;
  const { id } = req.params;

  // Validation
  if (!title || !priority || !due_date) {
    return res
      .status(400)
      .json({ message: "Title, priority and due_date are required" });
  }

  try {
    const [result] = await db.query(
      "UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ? WHERE id = ?",
      [title, description || null, status || "pending", priority, due_date, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update task", error });
  }
};

// Delete a task by ID
const deleteTask = async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM tasks WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task", error });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
