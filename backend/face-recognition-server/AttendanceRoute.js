// Add this ONE extra route to your existing Node.js attendance router.
// Your existing POST /api/attendance route stays exactly as-is.
// This GET route is what CCTVMonitor.jsx polls every 5 seconds.

// In your existing attendance router file, add:

router.get("/today", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, worker_id, status, created_at
       FROM   attendance
       WHERE  created_at >= CURRENT_DATE
       ORDER  BY created_at DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("Attendance fetch error:", err);
    return res.status(500).json({ error: "Database error" });
  }
});

// NOTE: Adjust the column names to match your actual table.
// Common alternatives:
//   created_at  →  marked_at / timestamp / date_time
//   worker_id   →  worker_id (should match your existing table)
