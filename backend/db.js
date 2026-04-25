const { Pool } = require("pg");

console.log("🔍 Initializing DB connection...");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  family: 4, // force IPv4
});

// ✅ Test connection immediately
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ DB CONNECTION FAILED");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
  } else {
    console.log("✅ DB CONNECTED SUCCESSFULLY");
    client.query("SELECT NOW()", (err, result) => {
      release();

      if (err) {
        console.error("❌ TEST QUERY FAILED");
        console.error(err.message);
      } else {
        console.log("🧪 DB TIME:", result.rows[0]);
      }
    });
  }
});

module.exports = pool;