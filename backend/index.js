require("dotenv").config();
const pool = require("./db");
const express = require("express");
const cors = require("cors");

const taskRoutes = require("./routes/tasks");
const authRoutes = require("./routes/auth");

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("/{*path}", cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Smart Workforce Backend Running 🚀");
});

app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);

// ── Salary APIs ──────────────────────────────────────────────

// Get ALL salary records (manager view)
app.get("/api/salary", async (req, res) => {
  try {
    const records = await pool.query(`
      SELECT salary.*, workers.name 
      FROM salary 
      JOIN workers ON workers.id = salary.worker_id 
      ORDER BY salary.year DESC, salary.month DESC
    `);
    res.json(records.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// Generate new salary
app.post("/api/salary", async (req, res) => {
  try {
    const { worker_id, month, year, base_salary, present_days, total_days } = req.body;
    const final_salary = (base_salary / total_days) * present_days;
    const newSalary = await pool.query(
      `INSERT INTO salary 
       (worker_id, month, year, base_salary, present_days, total_days, final_salary, status) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,'Pending') RETURNING *`,
      [worker_id, month, year, base_salary, present_days, total_days, final_salary]
    );
    res.json(newSalary.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// Mark salary as Paid
app.put("/api/salary/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await pool.query(
      "UPDATE salary SET status='Paid' WHERE id=$1 RETURNING *",
      [id]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});


// Workers API
app.get("/api/workers", async (req, res) => {
  try {
    const allWorkers = await pool.query(
      "SELECT id, name, email, role, status, productivity, last_active, is_verified FROM workers WHERE role = 'worker'"
    );
    res.json(allWorkers.rows);
  } catch (err) {
    console.error(err.message);
  }
});

app.get("/api/workers/:id", async (req, res) => {
  try {
      const id=req.params.id;
      const worker=await pool.query("SELECT id, name, email, role, status, productivity, last_active, is_verified FROM workers WHERE id = $1",[id]);
      res.json(worker.rows[0]);

  } catch (err) {
    console.error(err.message);
  }
});







app.get('/api/attendance/today', async (req, res) => {
  try {
    const records = await pool.query(
      `SELECT attendance.id, attendance.worker_id, workers.name,
       attendance.date, attendance.status
       FROM attendance
       JOIN workers ON workers.id = attendance.worker_id
       WHERE attendance.date = CURRENT_DATE
       ORDER BY attendance.id DESC`
    );
    res.json(records.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get("/api/attendance/worker/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const records = await pool.query(
      "SELECT * FROM attendance WHERE worker_id = $1 ORDER BY date DESC",
      [id]
    );
    res.json(records.rows);
  } catch (err) {
    console.error(err.message);
  }
});

app.delete("/api/attendance/record/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get worker_id before deleting
    const record = await pool.query("SELECT worker_id FROM attendance WHERE id = $1", [id]);
    const worker_id = record.rows[0]?.worker_id;

    await pool.query("DELETE FROM attendance WHERE id = $1", [id]);

    // Recalculate productivity after deletion
    if (worker_id) {
      await pool.query(`
        UPDATE workers
        SET productivity = ROUND(
          (SELECT COUNT(*) FILTER (WHERE status = 'Present') FROM attendance WHERE worker_id = $1) * 100.0 /
          NULLIF((SELECT COUNT(*) FROM attendance WHERE worker_id = $1), 0)
        )
        WHERE id = $1
      `, [worker_id]);
    }

    res.json({ message: "Record deleted successfully" });
  } catch (err) {
    console.error(err.message);
  }
});

// Attendance APIs
// Attendance APIs
// ✅ FINAL Attendance API (ONLY KEEP THIS ONE)
app.post("/api/attendance", async (req, res) => {
  try {
    const { worker_id, status } = req.body;

    // 🔥 Check user role
    const user = await pool.query(
      "SELECT role FROM workers WHERE id = $1",
      [worker_id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.rows[0].role !== "worker") {
      return res.status(403).json({
        message: "Attendance only allowed for workers"
      });
    }

    // ✅ Prevent duplicate attendance
    const existing = await pool.query(
      "SELECT * FROM attendance WHERE worker_id = $1 AND date = CURRENT_DATE",
      [worker_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "Attendance already marked for today!"
      });
    }

// ✅ Insert attendance
const newAttendance = await pool.query(
  "INSERT INTO attendance (worker_id, status) VALUES ($1, $2) RETURNING *",
  [worker_id, status]
);

// ✅ Recalculate productivity
await pool.query(`
  UPDATE workers
  SET productivity = ROUND(
    (SELECT COUNT(*) FILTER (WHERE status = 'Present') FROM attendance WHERE worker_id = $1) * 100.0 /
    NULLIF((SELECT COUNT(*) FROM attendance WHERE worker_id = $1), 0)
  )
  WHERE id = $1
`, [worker_id]);

res.json(newAttendance.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/attendance", async (req, res) => {
  try {
    const records = await pool.query(`
      SELECT attendance.id,
             attendance.worker_id,
             workers.name,
             attendance.date,
             attendance.status
      FROM attendance
      JOIN workers ON workers.id = attendance.worker_id
      ORDER BY attendance.date DESC
    `);

    res.json(records.rows);
  } catch (err) {
    console.error(err.message);
  }
});

app.delete("/api/attendance/:workerId", async (req, res) => {
  try {
    const { workerId } = req.params;

    await pool.query(
      "DELETE FROM attendance WHERE worker_id = $1",
      [workerId]
    );

    res.json({ message: "Attendance removed successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/salary/worker/:id",async(req,res)=>{
  try{
  const id=req.params.id;
  const salary=await pool.query(
      "select * from salary where worker_id =$1 order by year desc, month desc",[id]
  );
  res.json(salary.rows);
}catch(err){
  console.log(err);
}
});

app.put("/api/workers/:id", async (req, res) => {
  try {
    const id=req.params.id;
    const {name,email} =req.body;
    
   const update= await pool.query("UPDATE workers SET name=$1, email=$2 WHERE id=$3 RETURNING *", 
  [name, email, id]
);
    res.json(update.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

app.put("/api/workers/:id/last-active", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE workers SET last_active = NOW() WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});





app.delete("/api/workers/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete related records first
    await pool.query("DELETE FROM otps WHERE user_id = $1", [id]);
    await pool.query("DELETE FROM attendance WHERE worker_id = $1", [id]);
    await pool.query("DELETE FROM salary WHERE worker_id = $1", [id]);

    // Now delete the worker
    await pool.query("DELETE FROM workers WHERE id = $1", [id]);

    res.json({ message: "Worker deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to delete worker" });
  }
});





app.listen(5000, () => {
  console.log("Server running on port 5000");
});