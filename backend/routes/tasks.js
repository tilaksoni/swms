const express = require("express");
const router = express.Router();
const pool = require("../db");


// ✅ GET tasks for worker
router.get("/worker/:id", async (req, res) => {
  try {
    const workerId = req.params.id;

    const tasks = await pool.query(
      "SELECT * FROM tasks WHERE worker_id = $1",
      [workerId]
    );

    res.json(tasks.rows);

  } catch (err) {
    console.error(err.message);
  }
});


// ✅ Update Task Status (Worker Action)
router.put("/status/:id", async (req, res) => {
  const { status } = req.body;
  const taskId = req.params.id;

  try {

    const updatedTask = await pool.query(
      "UPDATE tasks SET status=$1 WHERE id=$2 RETURNING *",
      [status, taskId]
    );

    res.json(updatedTask.rows[0]);

  } catch (err) {
    console.error(err.message);
  }
});


// ✅ Assign Task
router.post("/", async (req, res) => {
  try {

    const { worker_id, assigned_by, title, description, deadline } = req.body;

    const newTask = await pool.query(
      "INSERT INTO tasks (worker_id, assigned_by, title, description, deadline,status) VALUES ($1,$2,$3,$4,$5,'Pending') RETURNING *",
      [worker_id, assigned_by, title, description, deadline]
    );

    res.json(newTask.rows[0]);

  } catch (err) {
    console.error(err.message);
  }
});


// ✅ Get All Tasks
router.get("/", async (req, res) => {
  try {

    const tasks = await pool.query(
      "SELECT tasks.*, workers.name FROM tasks JOIN workers ON tasks.worker_id = workers.id ORDER BY created_at DESC"
    );

    res.json(tasks.rows);

  } catch (err) {
    console.error(err.message);
  }
});


// ✅ Update Task (Manager Edit)
router.put("/:id", async (req, res) => {
  try {

    const { id } = req.params;
    const { title, description, deadline, assigned_by } = req.body;

    const updatedTask = await pool.query(
      `UPDATE tasks 
       SET title = $1, description = $2, deadline = $3, assigned_by = $4
       WHERE id = $5
       RETURNING *`,
      [title, description, deadline, assigned_by, id]
    );

    res.json(updatedTask.rows[0]);

  } catch (err) {
    console.error(err.message);
  }
});


// ✅ Delete Task
router.delete("/:id", async (req, res) => {
  try {

    const { id } = req.params;

    await pool.query(
      "DELETE FROM tasks WHERE id=$1",
      [id]
    );

    res.json("Task Deleted");

  } catch (err) {
    console.error(err.message);
  }
});


module.exports = router;