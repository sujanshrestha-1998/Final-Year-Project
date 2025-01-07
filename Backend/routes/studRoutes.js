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

// Route to show details of all students
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

// Route to insert student data into the students table
router.post("/stud_post", (req, res) => {
  const {
    firstName,
    lastName,
    dob,
    enrollmentDate,
    gradeLevel,
    studGroup,
    email,
    studentId,
    password,
  } = req.body;

  connection.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ message: "Transaction start error" });
    }

    const userQuery = `
      INSERT INTO users (id, username, password_hash, email, role_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const userValues = [
      studentId,
      `${firstName} ${lastName}`,
      password,
      email,
      4,
    ];

    connection.query(userQuery, userValues, (err, userResults) => {
      if (err) {
        return connection.rollback(() => {
          res
            .status(500)
            .json({ message: "Error inserting user", error: err.message });
        });
      }

      const studentQuery = `
        INSERT INTO students (stud_id, first_name, last_name, grade_level, stud_group, enrollment_date, date_of_birth)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const studentValues = [
        studentId,
        firstName,
        lastName,
        gradeLevel,
        studGroup,
        enrollmentDate,
        dob,
      ];

      // Log the student query and values for debugging
      console.log("Student Insert Query:", studentQuery);
      console.log("Student Values:", studentValues);

      connection.query(studentQuery, studentValues, (err, studentResults) => {
        if (err) {
          console.error("Error inserting student:", err); // Log error details
          return connection.rollback(() => {
            res
              .status(500)
              .json({ message: "Error inserting student", error: err.message });
          });
        }

        // Commit the transaction if both queries are successful
        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              res.status(500).json({
                message: "Error committing transaction",
                error: err.message,
              });
            });
          }

          return res
            .status(201)
            .json({ message: "User and student data inserted successfully" });
        });
      });
    });
  });

  // Route to update student data
  router.put("/update_student", (req, res) => {
    const {
      stud_id,
      first_name,
      last_name,
      grade_level,
      stud_group,
      date_of_birth,
      enrollment_date,
      student_email,
    } = req.body;

    // Validate that all necessary fields are provided
    if (
      !stud_id ||
      !first_name ||
      !last_name ||
      !grade_level ||
      !stud_group ||
      !date_of_birth ||
      !enrollment_date ||
      !student_email
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Update user table with new email
    const updateUserQuery = `
    UPDATE users
    SET email = ?
    WHERE id = ?
  `;
    const updateUserValues = [student_email, stud_id];

    connection.query(updateUserQuery, updateUserValues, (err, userResults) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ message: "Error updating user" });
      }

      // Update student table with new data
      const updateStudentQuery = `
      UPDATE students
      SET first_name = ?, last_name = ?, grade_level = ?, stud_group = ?, 
          date_of_birth = ?, enrollment_date = ?
      WHERE stud_id = ?
    `;
      const updateStudentValues = [
        first_name,
        last_name,
        grade_level,
        stud_group,
        date_of_birth,
        enrollment_date,
        stud_id,
      ];

      connection.query(
        updateStudentQuery,
        updateStudentValues,
        (err, studentResults) => {
          if (err) {
            console.error("Error updating student:", err);
            return res.status(500).json({ message: "Error updating student" });
          }

          return res.status(200).json({
            message: "Student data updated successfully",
          });
        }
      );
    });
  });
});

module.exports = router;
