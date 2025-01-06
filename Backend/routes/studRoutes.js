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

// Fetch all students with email from the users table
router.get("/stud_details", (req, res) => {
  const query = `
    SELECT s.stud_id, s.first_name, s.last_name, s.grade_level, s.stud_group, s.enrollment_date, s.date_of_birth, u.email AS student_email
    FROM students s
    JOIN users u ON s.stud_id = u.id
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      return res
        .status(200)
        .json({ message: "Students found", students: results });
    } else {
      return res.status(404).json({ message: "No students found" });
    }
  });
});

module.exports = router;
