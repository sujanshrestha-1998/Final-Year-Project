const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "studentportal_db",
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    return;
  }
  console.log("Connected to the MySQL database!");
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  const query = `SELECT * FROM students WHERE student_email = ? AND student_password = ?`;

  connection.query(query, [username, password], (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      return res
        .status(200)
        .json({ message: "Login successful", user: results[0] });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  });
});

router.post("/rtelogin", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Updated query to check in users table using email instead of username, and where role_id is 2 (rte)
  const query = `
    SELECT u.*, r.role_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.email = ? AND u.password_hash = ? AND r.role_name = 'rte'`;

  connection.query(query, [email, password], (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      return res
        .status(200)
        .json({ message: "Login successful", user: results[0] });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  });
});

module.exports = router;
