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

router.get("/search_students", (req, res) => {
  const { query } = req.query; // Get the search query from the request

  if (!query) {
    return res.status(400).json({ message: "Search query is required" });
  }

  const searchQuery = `
    SELECT s.stud_id, s.first_name, s.last_name, s.grade_level, s.stud_group, s.enrollment_date, s.date_of_birth, u.email AS student_email
    FROM students s
    JOIN users u ON s.stud_id = u.id
    WHERE s.first_name LIKE ? OR s.last_name LIKE ? OR u.email LIKE ?
  `;
  const searchValues = [`%${query}%`, `%${query}%`, `%${query}%`];

  connection.query(searchQuery, searchValues, (err, results) => {
    if (err) {
      console.error("Error searching for students:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json({
      message: results.length > 0 ? "Search results" : "No students found",
      students: results,
    });
  });
});

router.put("/update_students", (req, res) => {
  const {
    stud_id,
    first_name,
    last_name,
    grade_level,
    stud_group,
    date_of_birth,
    enrollment_date,
  } = req.body;

  if (!stud_id) {
    return res.status(400).json({ message: "Student ID is required" });
  }

  // Prepare dynamic SQL query
  let updateStudentQuery = "UPDATE students SET ";
  let updateValues = [];

  if (first_name) {
    updateStudentQuery += "first_name = ?, ";
    updateValues.push(first_name);
  }
  if (last_name) {
    updateStudentQuery += "last_name = ?, ";
    updateValues.push(last_name);
  }
  if (grade_level) {
    updateStudentQuery += "grade_level = ?, ";
    updateValues.push(grade_level);
  }
  if (stud_group) {
    updateStudentQuery += "stud_group = ?, ";
    updateValues.push(stud_group);
  }
  if (date_of_birth) {
    updateStudentQuery += "date_of_birth = ?, ";
    updateValues.push(date_of_birth);
  }
  if (enrollment_date) {
    updateStudentQuery += "enrollment_date = ?, ";
    updateValues.push(enrollment_date);
  }

  // Remove trailing comma and add the condition
  updateStudentQuery = updateStudentQuery.slice(0, -2); // Remove last comma
  updateStudentQuery += " WHERE stud_id = ?";
  updateValues.push(stud_id);

  connection.query(updateStudentQuery, updateValues, (err, results) => {
    if (err) {
      console.error("Error updating student details:", err);
      return res
        .status(500)
        .json({ message: "Error updating student details" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({
      message: "Student updated successfully",
    });
  });
});

// Add this new route to get all groups
router.get("/groups", (req, res) => {
  const query = "SELECT * FROM `group` ORDER BY name";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching groups:", err);
      return res.status(500).json({ message: "Error fetching groups" });
    }

    return res.status(200).json({
      message: "Groups fetched successfully",
      groups: results,
    });
  });
});

// Add route to update student's group
router.put("/update_student_group", (req, res) => {
  const { studentId, groupId } = req.body;

  if (!studentId || !groupId) {
    return res
      .status(400)
      .json({ message: "Student ID and Group ID are required" });
  }

  const query = `
    UPDATE students 
    SET stud_group = ? 
    WHERE stud_id = ?
  `;

  connection.query(query, [groupId, studentId], (err, result) => {
    if (err) {
      console.error("Error updating student group:", err);
      return res.status(500).json({ message: "Error updating student group" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res
      .status(200)
      .json({ message: "Student group updated successfully" });
  });
});

module.exports = router;
