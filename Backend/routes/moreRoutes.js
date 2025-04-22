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

// New API endpoint for scheduling teacher meetings
router.post("/schedule_teacher_meeting", (req, res) => {
  const {
    teacher_id,
    student_id,
    meeting_date,
    start_time,
    end_time,
    duration,
    purpose,
    status = "pending",
  } = req.body;

  // Validation: Ensure required fields are present
  if (
    !teacher_id ||
    !student_id ||
    !meeting_date ||
    !start_time ||
    !end_time ||
    !purpose
  ) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be provided",
    });
  }

  // First, check if the teacher is available at the requested time
  const availabilityCheckQuery = `
    SELECT id 
    FROM teacher_meetings
    WHERE teacher_id = ?
      AND meeting_date = ?
      AND ((start_time < ? AND end_time > ?) 
           OR (start_time < ? AND end_time > ?) 
           OR (start_time >= ? AND end_time <= ?))
      AND status != 'cancelled' AND status != 'rejected'
  `;

  const availabilityParams = [
    teacher_id,
    meeting_date,
    end_time, // New start time before existing end time
    start_time, // New end time after existing start time
    end_time, // Same start/end times
    start_time,
    start_time, // New meeting completely contains existing one
    end_time,
  ];

  connection.query(
    availabilityCheckQuery,
    availabilityParams,
    (availabilityErr, availabilityResults) => {
      if (availabilityErr) {
        console.error("Database error:", availabilityErr.message);
        return res.status(500).json({
          success: false,
          message: "Database error while checking availability",
        });
      }

      // If overlapping meetings found, return an error
      if (availabilityResults.length > 0) {
        return res.status(409).json({
          success: false,
          message:
            "Teacher is not available during this time slot. Please select a different time.",
        });
      }

      // If teacher is available, proceed with inserting the meeting
      const insertQuery = `
        INSERT INTO teacher_meetings 
        (teacher_id, student_id, meeting_date, start_time, end_time, purpose, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const insertParams = [
        teacher_id,
        student_id,
        meeting_date,
        start_time,
        end_time,
        purpose,
        status,
      ];

      connection.query(insertQuery, insertParams, (insertErr, insertResult) => {
        if (insertErr) {
          console.error("Database error:", insertErr.message);
          return res.status(500).json({
            success: false,
            message: "Failed to schedule meeting",
          });
        }

        return res.status(201).json({
          success: true,
          message: "Meeting scheduled successfully",
          meeting_id: insertResult.insertId,
        });
      });
    }
  );
});

// Add an endpoint to check teacher availability
router.get("/check_teacher_availability", (req, res) => {
  const { teacher_id, date, start_time, end_time } = req.query;

  // Validation: Ensure required parameters are present
  if (!teacher_id || !date || !start_time || !end_time) {
    return res.status(400).json({
      success: false,
      message: "Missing required parameters",
    });
  }

  // Query to check if the teacher has any conflicting meetings
  const query = `
    SELECT id 
    FROM teacher_meetings
    WHERE teacher_id = ?
      AND meeting_date = ?
      AND ((start_time < ? AND end_time > ?) 
           OR (start_time < ? AND end_time > ?) 
           OR (start_time >= ? AND end_time <= ?))
      AND status != 'cancelled' AND status != 'rejected'
  `;

  const params = [
    teacher_id,
    date,
    end_time, // New start time before existing end time
    start_time, // New end time after existing start time
    end_time, // Same start/end times
    start_time,
    start_time, // New meeting completely contains existing one
    end_time,
  ];

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Database error while checking availability",
      });
    }

    // If no conflicting meetings found, the teacher is available
    const isAvailable = results.length === 0;

    // Get teacher details for the response
    const teacherQuery = `
      SELECT teacher_id, first_name, last_name
      FROM teachers
      WHERE teacher_id = ?
    `;

    connection.query(
      teacherQuery,
      [teacher_id],
      (teacherErr, teacherResults) => {
        if (teacherErr) {
          console.error("Database error:", teacherErr.message);
          return res.status(500).json({
            success: false,
            message: "Database error while fetching teacher details",
          });
        }

        return res.status(200).json({
          success: true,
          isAvailable,
          availableTeachers: isAvailable ? teacherResults : [],
          message: isAvailable
            ? "Teacher is available at the requested time"
            : "Teacher is not available at the requested time",
        });
      }
    );
  });
});

// Add an endpoint to get user by email
router.get("/get_user_by_email", (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const query = `
    SELECT id, username, email, role_id
    FROM users
    WHERE email = ?
  `;

  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Database error while fetching user",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: results[0],
    });
  });
});

module.exports = router;
