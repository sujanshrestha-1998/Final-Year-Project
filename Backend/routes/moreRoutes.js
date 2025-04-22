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

module.exports = router;
