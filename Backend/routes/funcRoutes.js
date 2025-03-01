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

router.post("/fetch_role", (req, res) => {
  const { email } = req.body; // Get email from the request body
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  // Query to fetch the user's role_id based on their email
  const query = `
    SELECT role_id
    FROM users
    WHERE email = ?`;
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    if (results.length > 0) {
      const userRoleId = results[0].role_id; // The role_id will be an integer like 1, 2, 3, 4
      // Return the role_id in the response
      return res.status(200).json({
        message: "Role fetched successfully",
        role_id: userRoleId, // Send only role_id
      });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  });
});

router.post("/fetch_profile", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  // Query to fetch all user details based on email
  const query = `
    SELECT username, email, role_id
    FROM users
    WHERE email = ?`;
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    if (results.length > 0) {
      return res.status(200).json({
        message: "User fetched successfully",
        user: results[0], // Send all user details
      });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  });
});

router.post("/fetch_schedule", (req, res) => {
  const { group_id } = req.body;
  if (!group_id) {
    return res.status(400).json({ message: "Group ID is required" });
  }
  const query = `
    SELECT
    schedules.id AS schedule_id,
    schedules.group_id,
    schedules.classroom_id,
    schedules.course_id,
    schedules.teacher_id,
    schedules.day_of_week,
    schedules.start_time,
    schedules.end_time,
    \`group\`.name AS group_name,
    classrooms.name AS classroom_name,
    courses.name AS course_name,
    CONCAT(teachers.first_name, ' ', teachers.last_name) AS teacher_name
    FROM schedules
    JOIN \`group\` ON schedules.group_id = \`group\`.id
    LEFT JOIN classrooms ON schedules.classroom_id = classrooms.id
    LEFT JOIN courses ON schedules.course_id = courses.id
    LEFT JOIN teachers ON schedules.teacher_id = teachers.teacher_id
    WHERE schedules.group_id = ?;
  `;
  // Execute the query
  connection.query(query, [group_id], (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    if (results.length > 0) {
      return res.status(200).json({
        message: "Schedules fetched successfully",
        schedules: results,
      });
    } else {
      return res.status(200).json({
        message: "No schedules found for this group",
        schedules: [],
      });
    }
  });
});

router.post("/update_schedule", (req, res) => {
  const {
    schedule_id,
    group_id,
    classroom_id,
    course_id,
    teacher_id,
    day_of_week,
    start_time,
    end_time,
  } = req.body;

  // Validation: Ensure required fields are present
  if (
    !group_id ||
    !classroom_id ||
    !course_id ||
    !teacher_id ||
    !day_of_week ||
    !start_time ||
    !end_time
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // First, check for overlapping schedules
  const overlapCheckQuery = `
    SELECT id
    FROM schedules
    WHERE classroom_id = ?
      AND day_of_week = ?
      AND ((start_time < ? AND end_time > ?) 
           OR (start_time < ? AND end_time > ?) 
           OR (start_time >= ? AND end_time <= ?))
      AND id != ?
  `;

  const overlapParams = [
    classroom_id,
    day_of_week,
    end_time, // New start time before existing end time
    start_time, // New end time after existing start time
    end_time, // Same start/end times
    start_time,
    start_time, // New schedule completely contains existing one
    end_time,
    schedule_id || 0, // Skip current schedule when checking overlap
  ];

  connection.query(
    overlapCheckQuery,
    overlapParams,
    (overlapErr, overlapResults) => {
      if (overlapErr) {
        console.error("Database error:", overlapErr.message);
        return res.status(500).json({ message: "Database error" });
      }

      // If overlapping schedules found, return an error
      if (overlapResults.length > 0) {
        return res.status(409).json({
          message:
            "Cannot schedule: This classroom is already booked during this time period on the selected day.",
        });
      }

      // If no overlap, proceed with update or insert
      let query;
      let queryParams;

      if (schedule_id) {
        query = `
        UPDATE schedules
        SET group_id = ?, classroom_id = ?, course_id = ?, teacher_id = ?, day_of_week = ?, start_time = ?, end_time = ?
        WHERE id = ?
      `;
        queryParams = [
          group_id,
          classroom_id,
          course_id,
          teacher_id,
          day_of_week,
          start_time,
          end_time,
          schedule_id,
        ];
      } else {
        query = `
        INSERT INTO schedules (group_id, classroom_id, course_id, teacher_id, day_of_week, start_time, end_time)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
        queryParams = [
          group_id,
          classroom_id,
          course_id,
          teacher_id,
          day_of_week,
          start_time,
          end_time,
        ];
      }

      // Execute query
      connection.query(query, queryParams, (err, result) => {
        if (err) {
          console.error("Database error:", err.message);
          return res.status(500).json({ message: "Database error" });
        }
        const message = schedule_id
          ? "Schedule updated successfully"
          : "New schedule inserted successfully";
        return res.status(200).json({ message });
      });
    }
  );
});

router.delete("/delete_schedule", (req, res) => {
  const { schedule_id } = req.body;
  if (!schedule_id) {
    return res.status(400).json({ message: "Schedule ID is required" });
  }
  const query = `
    DELETE FROM schedules WHERE id = ?
  `;
  const queryParams = [schedule_id];
  connection.query(query, queryParams, (err, result) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    return res.status(200).json({ message: "Schedule deleted successfully" });
  });
});

router.get("/get_classrooms", (req, res) => {
  const query = "SELECT * FROM classrooms";
  connection.query(query, (err, result) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    return res
      .status(200)
      .json({ message: "Classrooms fetched successfully", data: result });
  });
});

router.get("/get_courses", (req, res) => {
  const query = "SELECT * FROM courses";
  connection.query(query, (err, result) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    return res
      .status(200)
      .json({ message: "Classrooms fetched successfully", data: result });
  });
});

router.post("/add_classroom", (req, res) => {
  const { name, type } = req.body;

  if (!name || !type) {
    return res.status(400).json({ message: "Name and type are required" });
  }

  const query = "INSERT INTO classrooms (name, type) VALUES (?, ?)";
  connection.query(query, [name, type], (err, result) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    return res.status(201).json({
      message: "Classroom added successfully",
      data: { id: result.insertId, name, type },
    });
  });
});

router.delete("/delete_classroom/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM classrooms WHERE id = ?";
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }
    return res.status(200).json({ message: "Classroom deleted successfully" });
  });
});

module.exports = router;
