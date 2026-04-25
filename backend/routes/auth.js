const express = require("express");
const router = express.Router();
const pool = require("../db");
const generateOTP = require("../utils/generateOtp");
const sendOTP = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password,role } = req.body;

    // Check if user exists
    const existingUser = await pool.query(
      "SELECT * FROM workers WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Insert user
    // Hash password first
const hashedPassword = await bcrypt.hash(password, 10);

// Insert user
const newUser = await pool.query(
  "INSERT INTO workers (name,email,password,role) VALUES ($1,$2,$3,$4) RETURNING *",
  [name, email, hashedPassword, role]
);

    const userId = newUser.rows[0].id;

    // ✅ Generate OTP
    const otp = generateOTP();

    // ✅ Save OTP in database (if otps table exists)
    await pool.query(
      "INSERT INTO otps (user_id, code, expires_at) VALUES ($1,$2,$3)",
      [userId, otp, new Date(Date.now() + 5 * 60 * 1000)]
    );

    // ✅ Send OTP email
    await sendOTP(email, otp);

    res.json({
      message: "OTP sent successfully"
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

   // ✅ Find user by email only, then compare password
const user = await pool.query(
  "SELECT * FROM workers WHERE email = $1",
  [email]
);

if (user.rows.length === 0) {
  return res.status(401).json({ message: "Invalid Credentials" });
}

// compare password with hashed password
const isMatch = await bcrypt.compare(password, user.rows[0].password);

if (!isMatch) {
  return res.status(401).json({ message: "Invalid Credentials" });
}

   // ✅ Update last_active
await pool.query(
  "UPDATE workers SET last_active = NOW() WHERE id = $1",
  [user.rows[0].id]
);

// ✅ Send token manually
res.json({
  token: "dummy-token-123",
  user: { ...user.rows[0], last_active: new Date() }
});

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await pool.query(
      "SELECT * FROM workers WHERE email = $1",
      [email]
    );

    if (!user.rows.length) {
      return res.status(400).json({ message: "User not found" });
    }

    const userId = user.rows[0].id;

    const otpData = await pool.query(
      "SELECT * FROM otps WHERE user_id = $1 AND code = $2",
      [userId, otp]
    );

    if (!otpData.rows.length) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > otpData.rows[0].expires_at) {
      return res.status(400).json({ message: "OTP expired" });
    }

    await pool.query(
      "UPDATE workers SET is_verified = true WHERE id = $1",
      [userId]
    );

    await pool.query(
      "DELETE FROM otps WHERE user_id = $1",
      [userId]
    );

    res.json({ message: "OTP verified successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//RESEND-OTP
router.post("/resend-otp", async (req, res) => {
  try {

    const { email } = req.body;

    const user = await pool.query(
      "SELECT id FROM workers WHERE email=$1",
      [email]
    );

    if (!user.rows.length) {
      return res.status(400).json({ message: "User not found" });
    }

    const userId = user.rows[0].id;

    const otp = generateOTP();

    await pool.query(
      "DELETE FROM otps WHERE user_id=$1",
      [userId]
    );

    await pool.query(
      "INSERT INTO otps (user_id, code, expires_at) VALUES ($1,$2,$3)",
      [
        userId,
        otp,
        new Date(Date.now() + 5 * 60 * 1000)
      ]
    );

    await sendOTP(email, otp);

    res.json({ message: "OTP resent successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// CHANGE PASSWORD
router.put("/change-password", async (req, res) => {
  try {
    const { workerId, currentPassword, newPassword } = req.body;

    // step 1: find worker
    const user = await pool.query(
      "SELECT * FROM workers WHERE id = $1",
      [workerId]
    );

    if (!user.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    // step 2: check current password
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.rows[0].password
    );

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // step 3: hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // step 4: update password
    await pool.query(
      "UPDATE workers SET password = $1 WHERE id = $2",
      [hashedPassword, workerId]
    );

    res.json({ message: "Password changed successfully" });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;