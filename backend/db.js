const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "db.gdcnucvaiamshvunkhip.supabase.co",
  database: "postgres",
  password: "LeXw9FhRTLnV46@",
  port: 5432,
});

module.exports = pool;