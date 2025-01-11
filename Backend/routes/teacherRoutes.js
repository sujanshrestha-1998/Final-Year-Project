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

// Route to show details of all teachers
router.get("/teacher_details", (req, res) => {
  const query = `
    SELECT t.teacher_id, t.first_name, t.last_name, t.enrolled_date, t.date_of_birth, u.email 
    FROM teachers t
    JOIN users u ON t.teacher_id = u.id
    WHERE u.role_id = 3
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      return res
        .status(200)
        .json({ message: "Teachers found", teachers: results });
    } else {
      return res.status(404).json({ message: "No teachers found" });
    }
  });
});

router.post("/teacher_post", (req, res) => {
  const {
    firstName,
    lastName,
    dob,
    enrolledDate,
    email,
    teacherId,
    password,
    course,
  } = req.body;
  console.log("Request body:", req.body);

  connection.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ message: "Transaction start error" });
    }

    const userQuery = `
      INSERT INTO users (id, username, password_hash, email, role_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const userValues = [
      teacherId,
      `${firstName} ${lastName}`,
      password,
      email,
      3,
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
        INSERT INTO teachers (teacher_id, first_name, last_name, email, enrolled_date, date_of_birth, course)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const studentValues = [
        teacherId,
        firstName,
        lastName,
        email,
        enrolledDate,
        dob,
        course,
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
  // router.put("/update_student", (req, res) => {
  //   const {
  //     stud_id,
  //     first_name,
  //     last_name,
  //     grade_level,
  //     stud_group,
  //     date_of_birth,
  //     enrollment_date,
  //     student_email,
  //   } = req.body;

  //   // Validate that all necessary fields are provided
  //   if (
  //     !stud_id ||
  //     !first_name ||
  //     !last_name ||
  //     !grade_level ||
  //     !stud_group ||
  //     !date_of_birth ||
  //     !enrollment_date ||
  //     !student_email
  //   ) {
  //     return res.status(400).json({ message: "Missing required fields" });
  //   }

  //   // Update user table with new email
  //   const updateUserQuery = `
  //   UPDATE users
  //   SET email = ?
  //   WHERE id = ?
  // `;
  //   const updateUserValues = [student_email, stud_id];

  //   connection.query(updateUserQuery, updateUserValues, (err, userResults) => {
  //     if (err) {
  //       console.error("Error updating user:", err);
  //       return res.status(500).json({ message: "Error updating user" });
  //     }

  //     // Update student table with new data
  //     const updateStudentQuery = `
  //     UPDATE students
  //     SET first_name = ?, last_name = ?, grade_level = ?, stud_group = ?,
  //         date_of_birth = ?, enrollment_date = ?
  //     WHERE stud_id = ?
  //   `;
  //     const updateStudentValues = [
  //       first_name,
  //       last_name,
  //       grade_level,
  //       stud_group,
  //       date_of_birth,
  //       enrollment_date,
  //       stud_id,
  //     ];

  //     connection.query(
  //       updateStudentQuery,
  //       updateStudentValues,
  //       (err, studentResults) => {
  //         if (err) {
  //           console.error("Error updating student:", err);
  //           return res.status(500).json({ message: "Error updating student" });
  //         }

  //         return res.status(200).json({
  //           message: "Student data updated successfully",
  //         });
  //       }
  //     );
  //   });
  // });
});

// Search teachers by name or email
router.get("/search_teachers", (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Search query is required" });
  }

  const searchQuery = `
    SELECT t.teacher_id, t.first_name, t.last_name, t.enrolled_date, t.date_of_birth, u.email AS teacher_email 
    FROM teachers t
    JOIN users u ON t.teacher_id = u.id
    WHERE u.role_id = 3 AND (t.first_name LIKE ? OR t.last_name LIKE ? OR u.email LIKE ?)
  `;
  const searchValues = [`%${query}%`, `%${query}%`, `%${query}%`];

  connection.query(searchQuery, searchValues, (err, results) => {
    if (err) {
      console.error("Error searching for teachers:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json({
      message: results.length > 0 ? "Search results" : "No teachers found",
      teachers: results,
    });
  });
});

module.exports = router;
