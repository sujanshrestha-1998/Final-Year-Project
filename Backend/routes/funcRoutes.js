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
    schedules.day_of_week,
    schedules.start_time,
    schedules.end_time,
    \`group\`.name AS group_name,
    classrooms.name AS classroom_name,
    courses.name AS course_name,
    teachers.first_name AS teacher_name
  FROM schedules
  JOIN \`group\` ON schedules.group_id = \`group\`.id
  LEFT JOIN classrooms ON schedules.classroom_id = classrooms.id
  LEFT JOIN courses ON schedules.course_id = courses.id
  LEFT JOIN teachers ON schedules.teacher_id = teachers.id
  WHERE schedules.group_id = ?;
`;

  // Execute the query
  connection.query(query, [group_id], (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    console.log(results); // Debugging: Log results to see the fetched data

    if (results.length > 0) {
      return res.status(200).json({
        message: "Schedules fetched successfully",
        schedules: results,
      });
    } else {
      return res
        .status(404)
        .json({ message: "No schedules found for this group" });
    }
  });
});

router.post("/update_schedule", (req, res) => {
  const {
    schedule_id, // If provided, update existing schedule
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

  // If `schedule_id` exists, perform an UPDATE; otherwise, perform an INSERT
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
});

module.exports = router;
