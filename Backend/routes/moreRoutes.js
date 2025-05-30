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

  // Convert date string to Date object to get day of week
  const meetingDateObj = new Date(meeting_date);
  const dayOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][meetingDateObj.getDay()];

  // First check if teacher has a class scheduled at this time
  const classScheduleQuery = `
    SELECT id 
    FROM schedules
    WHERE teacher_id = ?
      AND day_of_week = ?
      AND ((start_time < ? AND end_time > ?) 
           OR (start_time < ? AND end_time > ?) 
           OR (start_time >= ? AND end_time <= ?))
  `;

  const scheduleParams = [
    teacher_id,
    dayOfWeek,
    end_time,   // New start time before existing end time
    start_time, // New end time after existing start time
    end_time,   // Same start/end times
    start_time,
    start_time, // New schedule completely contains existing one
    end_time,
  ];

  connection.query(classScheduleQuery, scheduleParams, (scheduleErr, scheduleResults) => {
    if (scheduleErr) {
      console.error("Database error:", scheduleErr.message);
      return res.status(500).json({
        success: false,
        message: "Database error while checking class schedule",
      });
    }

    // If teacher has a class at this time, they're not available
    if (scheduleResults.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Teacher is not available at this time due to a scheduled class.",
      });
    }

    // Next, check if teacher has an approved meeting at this time
    const availabilityCheckQuery = `
      SELECT id 
      FROM teacher_meetings
      WHERE teacher_id = ?
        AND meeting_date = ?
        AND ((start_time < ? AND end_time > ?) 
             OR (start_time < ? AND end_time > ?) 
             OR (start_time >= ? AND end_time <= ?))
        AND status = 'approved'
    `;

    const availabilityParams = [
      teacher_id,
      meeting_date,
      end_time,   // New start time before existing end time
      start_time, // New end time after existing start time
      end_time,   // Same start/end times
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

        // If overlapping approved meetings found, return an error
        if (availabilityResults.length > 0) {
          return res.status(409).json({
            success: false,
            message:
              "Teacher is not available during this time slot due to an approved meeting. Please select a different time.",
          });
        }

        // If no conflicts, proceed with inserting the meeting
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
});

// Add an endpoint to check teacher availability
router.get("/check_teacher_availability", (req, res) => {
  const { teacher_id, date, start_time, end_time } = req.query;

  // Validate required parameters
  if (!teacher_id || !date || !start_time || !end_time) {
    return res.status(400).json({
      success: false,
      message: "Missing required parameters",
    });
  }

  // Convert date to day of week for schedule check
  const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
  });

  // First, check if the teacher has a class scheduled at this time
  const scheduleQuery = `
    SELECT id 
    FROM schedules
    WHERE teacher_id = ?
      AND day_of_week = ?
      AND ((start_time < ? AND end_time > ?) 
           OR (start_time < ? AND end_time > ?) 
           OR (start_time >= ? AND end_time <= ?))
  `;

  const scheduleParams = [
    teacher_id,
    dayOfWeek,
    end_time,
    start_time,
    end_time,
    start_time,
    start_time,
    end_time,
  ];

  // Second, check if the teacher has an approved meeting at this time
  const meetingQuery = `
    SELECT id 
    FROM teacher_meetings
    WHERE teacher_id = ?
      AND meeting_date = ?
      AND status = 'approved'
      AND ((start_time < ? AND end_time > ?) 
           OR (start_time < ? AND end_time > ?) 
           OR (start_time >= ? AND end_time <= ?))
  `;

  const meetingParams = [
    teacher_id,
    date,
    end_time,
    start_time,
    end_time,
    start_time,
    start_time,
    end_time,
  ];

  // Execute both queries in parallel
  connection.query(
    scheduleQuery,
    scheduleParams,
    (scheduleErr, scheduleResults) => {
      if (scheduleErr) {
        console.error("Database error (schedule check):", scheduleErr.message);
        return res.status(500).json({
          success: false,
          message: "Database error during schedule check",
        });
      }

      connection.query(
        meetingQuery,
        meetingParams,
        (meetingErr, meetingResults) => {
          if (meetingErr) {
            console.error(
              "Database error (meeting check):",
              meetingErr.message
            );
            return res.status(500).json({
              success: false,
              message: "Database error during meeting check",
            });
          }

          // Teacher is unavailable if they have either a class or an approved meeting
          const isUnavailable =
            scheduleResults.length > 0 || meetingResults.length > 0;

          // If the teacher is unavailable, return appropriate message
          if (isUnavailable) {
            return res.status(200).json({
              success: true,
              availableTeachers: [],
              message:
                scheduleResults.length > 0
                  ? "Teacher has a class scheduled at this time"
                  : "Teacher has an approved meeting at this time",
            });
          }

          // If we get here, the teacher is available
          // Fetch teacher details to return in the response
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
                console.error(
                  "Database error (teacher fetch):",
                  teacherErr.message
                );
                return res.status(500).json({
                  success: false,
                  message: "Database error while fetching teacher details",
                });
              }

              return res.status(200).json({
                success: true,
                availableTeachers: teacherResults,
                message: "Teacher is available at the requested time",
              });
            }
          );
        }
      );
    }
  );
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

// Add an endpoint to get teacher meeting requests by teacher ID
router.get("/get_teacher_meeting_requests", (req, res) => {
  const { teacher_id } = req.query;

  // Validation: Ensure teacher_id is provided
  if (!teacher_id) {
    return res.status(400).json({
      success: false,
      message: "Teacher ID is required",
    });
  }

  // First, check if the teacher_meetings table exists
  connection.query(
    "SHOW TABLES LIKE 'teacher_meetings'",
    (tableErr, tableResults) => {
      if (tableErr) {
        console.error("Database error checking tables:", tableErr);
        return res.status(500).json({
          success: false,
          message: "Database error while checking tables",
          error: tableErr.message,
        });
      }

      // If the table doesn't exist, create it
      if (tableResults.length === 0) {
        console.log("Creating teacher_meetings table...");
        const createTableQuery = `
          CREATE TABLE teacher_meetings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            teacher_id INT NOT NULL,
            student_id INT NOT NULL,
            meeting_date DATE NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            purpose TEXT NOT NULL,
            status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX (teacher_id),
            INDEX (student_id)
          )
        `;

        connection.query(createTableQuery, (createErr) => {
          if (createErr) {
            console.error("Error creating table:", createErr);
            return res.status(500).json({
              success: false,
              message: "Failed to create teacher_meetings table",
              error: createErr.message,
            });
          }

          // Return empty array since the table was just created
          return res.status(200).json({
            success: true,
            meeting_requests: [],
            message: "Table created successfully, no meeting requests yet",
          });
        });
      } else {
        // Table exists, proceed with the query
        // Query to fetch meeting requests for the specified teacher
        const query = `
        SELECT tm.*, 
               s.first_name AS student_first_name, 
               s.last_name AS student_last_name
        FROM teacher_meetings tm
        LEFT JOIN students s ON tm.student_id = s.stud_id
        WHERE tm.teacher_id = ?
        ORDER BY tm.meeting_date ASC, tm.start_time ASC
      `;

        connection.query(query, [teacher_id], (err, results) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
              success: false,
              message: "Database error while fetching meeting requests",
              error: err.message,
            });
          }

          return res.status(200).json({
            success: true,
            meeting_requests: results || [],
          });
        });
      }
    }
  );
});

// Add an endpoint to update meeting request status
router.post("/update_meeting_request_status", (req, res) => {
  const { meeting_id, status } = req.body;

  // Validation: Ensure required fields are present
  if (!meeting_id || !status) {
    return res.status(400).json({
      success: false,
      message: "Meeting ID and status are required",
    });
  }

  // Validate status value
  const validStatuses = ["approved", "rejected", "cancelled", "pending"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status value",
    });
  }

  // Update the meeting request status
  const query = `
    UPDATE teacher_meetings
    SET status = ?, updated_at = NOW()
    WHERE id = ?
  `;

  connection.query(query, [status, meeting_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error while updating meeting request",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Meeting request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Meeting request ${status} successfully`,
    });
  });
});

module.exports = router;
