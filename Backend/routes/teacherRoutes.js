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
    SELECT t.teacher_id, t.first_name, t.last_name, t.enrolled_date, t.date_of_birth, 
           t.course, t.assigned_academics, u.email 
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

// New route to fetch academics data
router.get("/academics", (req, res) => {
  const query = `
    SELECT * FROM academics
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      return res
        .status(200)
        .json({ message: "Academics found", academics: results });
    } else {
      return res.status(404).json({ message: "No academics found" });
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
    assignedAcademics,
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

      const teacherQuery = `
        INSERT INTO teachers (teacher_id, first_name, last_name, email, enrolled_date, date_of_birth, course, assigned_academics)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const teacherValues = [
        teacherId,
        firstName,
        lastName,
        email,
        enrolledDate,
        dob,
        course,
        assignedAcademics,
      ];

      // Log the teacher query and values for debugging
      console.log("Teacher Insert Query:", teacherQuery);
      console.log("Teacher Values:", teacherValues);

      connection.query(teacherQuery, teacherValues, (err, teacherResults) => {
        if (err) {
          console.error("Error inserting teacher:", err); // Log error details
          return connection.rollback(() => {
            res
              .status(500)
              .json({ message: "Error inserting teacher", error: err.message });
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
            .json({ message: "User and teacher data inserted successfully" });
        });
      });
    });
  });
});

// Search teachers by name or email
router.get("/search_teachers", (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Search query is required" });
  }

  const searchQuery = `
    SELECT t.teacher_id, t.first_name, t.last_name, t.enrolled_date, t.date_of_birth, 
           t.course, t.assigned_academics, u.email 
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

// New route to get all teacher meetings:
router.get("/get_all_teacher_meetings", (req, res) => {
  const query = `
    SELECT tm.*, 
           CONCAT(s.first_name, ' ', s.last_name) as student_name,
           CONCAT(t.first_name, ' ', t.last_name) as teacher_name
    FROM teacher_meetings tm
    JOIN students s ON tm.student_id = s.stud_id
    JOIN teachers t ON tm.teacher_id = t.teacher_id
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json({
      success: true,
      message: "Teacher meetings fetched successfully",
      meetings: results,
    });
  });
});

// Add this new route for updating teacher information
router.put("/teacher_details/:id", (req, res) => {
  const teacherId = req.params.id;
  const {
    first_name,
    last_name,
    email,
    course,
    assigned_academics,
    date_of_birth
  } = req.body;

  // Start a transaction to update both tables
  connection.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ message: "Transaction start error" });
    }

    // Update the users table first
    const updateUserQuery = `
      UPDATE users
      SET email = ?, username = ?
      WHERE id = ?
    `;
    const userValues = [email, `${first_name} ${last_name}`, teacherId];

    connection.query(updateUserQuery, userValues, (err, userResults) => {
      if (err) {
        return connection.rollback(() => {
          res.status(500).json({ 
            message: "Error updating user", 
            error: err.message 
          });
        });
      }

      // Then update the teachers table
      const updateTeacherQuery = `
        UPDATE teachers
        SET first_name = ?, last_name = ?, email = ?, 
            course = ?, assigned_academics = ?, date_of_birth = ?
        WHERE teacher_id = ?
      `;
      const teacherValues = [
        first_name,
        last_name,
        email,
        course,
        assigned_academics,
        date_of_birth,
        teacherId
      ];

      connection.query(updateTeacherQuery, teacherValues, (err, teacherResults) => {
        if (err) {
          return connection.rollback(() => {
            res.status(500).json({ 
              message: "Error updating teacher", 
              error: err.message 
            });
          });
        }

        // Commit the transaction if both updates are successful
        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              res.status(500).json({
                message: "Error committing transaction",
                error: err.message
              });
            });
          }

          return res.status(200).json({ 
            message: "Teacher data updated successfully" 
          });
        });
      });
    });
  });
});

// Add a new route to update teacher status
router.put("/update_teacher_status", (req, res) => {
  const { teacherId, isActive } = req.body;

  if (!teacherId) {
    return res.status(400).json({ message: "Teacher ID is required" });
  }

  const query = `
    UPDATE teachers 
    SET status = ? 
    WHERE teacher_id = ?
  `;

  const status = isActive ? "active" : "inactive";

  connection.query(query, [status, teacherId], (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res
        .status(500)
        .json({ message: "Database error", error: err.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    return res.status(200).json({
      message: `Teacher status updated to ${status}`,
      teacherId,
      status,
    });
  });
});

// Modify the teacher_details route to include status
router.get("/teacher_details", (req, res) => {
  const query = `
    SELECT t.teacher_id, t.first_name, t.last_name, t.enrolled_date, t.date_of_birth, 
           t.course, t.assigned_academics, t.status, u.email 
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

module.exports = router;
