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

router.get("/get_all_schedules", (req, res) => {
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
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json({
      message: "All schedules fetched successfully",
      schedules: results,
    });
  });
});

// API endpoint for classroom reservation
router.post("/reserve_classroom", (req, res) => {
  const {
    classroom_id,
    user_id,
    purpose,
    reservation_date,
    start_time,
    end_time,
    attendees,
  } = req.body;

  // Validate required fields
  if (
    !classroom_id ||
    !user_id ||
    !purpose ||
    !reservation_date ||
    !start_time ||
    !end_time
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  // Convert date string to Date object for validation
  const reservationDateObj = new Date(reservation_date);
  const currentDate = new Date();

  // Set hours, minutes, seconds, and milliseconds to 0 for date comparison
  currentDate.setHours(0, 0, 0, 0);

  // Check if reservation date is in the past
  if (reservationDateObj < currentDate) {
    return res.status(400).json({
      success: false,
      message: "Cannot make reservations for past dates",
    });
  }

  // Get day of week for the reservation date
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayOfWeek = daysOfWeek[reservationDateObj.getDay()];

  // First, check for overlapping schedules in the regular schedule
  const scheduleOverlapQuery = `
    SELECT id
    FROM schedules
    WHERE classroom_id = ?
      AND day_of_week = ?
      AND ((start_time < ? AND end_time > ?) 
           OR (start_time < ? AND end_time > ?) 
           OR (start_time >= ? AND end_time <= ?))
  `;

  const scheduleOverlapParams = [
    classroom_id,
    dayOfWeek,
    end_time,
    start_time,
    end_time,
    start_time,
    start_time,
    end_time,
  ];

  // Then, check for overlapping reservations
  const reservationOverlapQuery = `
    SELECT id, status
    FROM classroom_reservations
    WHERE classroom_id = ?
      AND reservation_date = ?
      AND status = 'approved'
      AND ((start_time < ? AND end_time > ?) 
           OR (start_time < ? AND end_time > ?) 
           OR (start_time >= ? AND end_time <= ?))
  `;

  const reservationOverlapParams = [
    classroom_id,
    reservation_date,
    end_time,
    start_time,
    end_time,
    start_time,
    start_time,
    end_time,
  ];

  // Check for schedule overlaps first
  connection.query(
    scheduleOverlapQuery,
    scheduleOverlapParams,
    (scheduleErr, scheduleResults) => {
      if (scheduleErr) {
        console.error("Database error:", scheduleErr.message);
        return res.status(500).json({
          success: false,
          message: "Database error",
        });
      }

      // If overlapping with regular schedule, return error
      if (scheduleResults.length > 0) {
        return res.status(409).json({
          success: false,
          message:
            "Cannot reserve: This classroom has a regular class scheduled during this time period.",
        });
      }

      // If no overlap with regular schedule, check for reservation overlaps
      connection.query(
        reservationOverlapQuery,
        reservationOverlapParams,
        (reservationErr, reservationResults) => {
          if (reservationErr) {
            console.error("Database error:", reservationErr.message);
            return res.status(500).json({
              success: false,
              message: "Database error",
            });
          }

          // If overlapping with existing reservations, return error
          if (reservationResults.length > 0) {
            return res.status(409).json({
              success: false,
              message:
                "Cannot reserve: This classroom is already reserved during this time period.",
            });
          }

          // If no overlaps, proceed with the reservation
          const insertQuery = `
        INSERT INTO classroom_reservations 
        (classroom_id, user_id, purpose, reservation_date, start_time, end_time, attendees, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `;

          const insertParams = [
            classroom_id,
            user_id,
            purpose,
            reservation_date,
            start_time,
            end_time,
            attendees || null,
          ];

          connection.query(insertQuery, insertParams, (insertErr, result) => {
            if (insertErr) {
              console.error("Database error:", insertErr.message);
              return res.status(500).json({
                success: false,
                message: "Failed to create reservation",
              });
            }

            return res.status(201).json({
              success: true,
              message: "Classroom reservation submitted successfully",
              reservation_id: result.insertId,
            });
          });
        }
      );
    }
  );
});

// Add this new endpoint to get user by email
router.get("/get_user_by_email", (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const query =
    "SELECT id, username, email, role_id FROM users WHERE email = ?";

  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Database error",
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

// Add endpoint to get pending classroom reservations
router.get("/get_pending_reservations", (req, res) => {
  const query = `
    SELECT cr.*, c.name AS classroom_name, u.username AS user_name
    FROM classroom_reservations cr
    JOIN classrooms c ON cr.classroom_id = c.id
    JOIN users u ON cr.user_id = u.id
    WHERE cr.status = 'pending'
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch pending reservations",
        error: err.message,
      });
    }

    return res.status(200).json({
      success: true,
      reservations: results,
    });
  });
});

// Add endpoint to update reservation status
router.post("/update_reservation_status", (req, res) => {
  const { reservation_id, status } = req.body;

  if (
    !reservation_id ||
    !status ||
    !["approved", "rejected"].includes(status)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid reservation ID or status",
    });
  }

  const query = `
    UPDATE classroom_reservations
    SET status = ?
    WHERE id = ?
  `;

  connection.query(query, [status, reservation_id], (err, result) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Failed to update reservation status",
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Reservation ${
        status === "approved" ? "approved" : "rejected"
      } successfully`,
    });
  });
});

// Add endpoint to get approved classroom reservations
router.get("/get_approved_reservations", (req, res) => {
  const query = `
    SELECT 
      cr.id, 
      cr.classroom_id, 
      cr.user_id, 
      cr.reservation_date, 
      cr.start_time, 
      cr.end_time, 
      cr.purpose, 
      cr.attendees, 
      cr.status,
      u.username as user_name,
      c.name as classroom_name
    FROM 
      classroom_reservations cr
    JOIN 
      users u ON cr.user_id = u.id
    JOIN 
      classrooms c ON cr.classroom_id = c.id
    WHERE 
      cr.status = 'approved'
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }

    return res.status(200).json({
      success: true,
      reservations: results,
    });
  });
});

// Add or update this endpoint
router.get("/check_reservation_conflicts", (req, res) => {
  const { classroom_id, date, start_time, end_time } = req.query;

  if (!classroom_id || !date || !start_time || !end_time) {
    return res.status(400).json({
      success: false,
      message: "Missing required parameters",
    });
  }

  // Query to find all reservations for this classroom on this date
  const query = `
    SELECT id, user_id, purpose, start_time, end_time, status
    FROM classroom_reservations
    WHERE classroom_id = ?
      AND reservation_date = ?
      AND ((start_time < ? AND end_time > ?) 
           OR (start_time < ? AND end_time > ?) 
           OR (start_time >= ? AND end_time <= ?))
  `;

  const params = [
    classroom_id,
    date,
    end_time,
    start_time,
    end_time,
    start_time,
    start_time,
    end_time,
  ];

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    // Return all conflicts, including their status
    return res.status(200).json({
      success: true,
      conflicts: results,
      hasApprovedConflict: results.some((r) => r.status === "approved"),
    });
  });
});

// Add this new endpoint for checking teacher availability
router.get("/check_teacher_availability", (req, res) => {
  const { teacher_id, date, start_time, end_time } = req.query;

  if (!teacher_id || !date || !start_time || !end_time) {
    return res.status(400).json({
      success: false,
      message: "Teacher ID, date, start time, and end time are required",
    });
  }

  // Convert date string to Date object to get day of week
  const meetingDate = new Date(date);
  const dayOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][meetingDate.getDay()];

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
    end_time, // New start time before existing end time
    start_time, // New end time after existing start time
    end_time, // Same start/end times
    start_time,
    start_time, // New schedule completely contains existing one
    end_time,
  ];

  connection.query(
    classScheduleQuery,
    scheduleParams,
    (scheduleErr, scheduleResults) => {
      if (scheduleErr) {
        console.error("Database error:", scheduleErr.message);
        return res.status(500).json({
          success: false,
          message: "Database error while checking class schedule",
        });
      }

      // If teacher has a class at this time, they're not available
      if (scheduleResults.length > 0) {
        return res.status(200).json({
          success: false,
          available: false,
        });
      }

      // Next, check if teacher has an approved meeting at this time
      const meetingQuery = `
      SELECT id 
      FROM teacher_meetings
      WHERE teacher_id = ?
        AND meeting_date = ?
        AND ((start_time < ? AND end_time > ?) 
             OR (start_time < ? AND end_time > ?) 
             OR (start_time >= ? AND end_time <= ?))
        AND status = 'approved'
    `;

      const meetingParams = [
        teacher_id,
        date,
        end_time, // New start time before existing end time
        start_time, // New end time after existing start time
        end_time, // Same start/end times
        start_time,
        start_time, // New meeting completely contains existing one
        end_time,
      ];

      connection.query(
        meetingQuery,
        meetingParams,
        (meetingErr, meetingResults) => {
          if (meetingErr) {
            console.error("Database error:", meetingErr.message);
            return res.status(500).json({
              success: false,
              message: "Database error while checking meeting schedule",
            });
          }

          // If teacher has an approved meeting at this time, they're not available
          if (meetingResults.length > 0) {
            return res.status(200).json({
              success: false,
              available: false,
            });
          }

          // If no conflicts found, teacher is available
          return res.status(200).json({
            success: true,
            available: true,
            message: "Teacher is available at the requested time.",
          });
        }
      );
    }
  );
});

// Add endpoint to schedule a meeting with a teacher
router.post("/schedule_meeting", (req, res) => {
  const { teacher_id, user_id, meeting_date, start_time, end_time, purpose } =
    req.body;

  // Validate required fields
  if (
    !teacher_id ||
    !user_id ||
    !meeting_date ||
    !start_time ||
    !end_time ||
    !purpose
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  // Convert date string to Date object for validation
  const meetingDateObj = new Date(meeting_date);
  const currentDate = new Date();

  // Set hours, minutes, seconds, and milliseconds to 0 for date comparison
  currentDate.setHours(0, 0, 0, 0);

  // Check if meeting date is in the past
  if (meetingDateObj < currentDate) {
    return res.status(400).json({
      success: false,
      message: "Cannot schedule meetings for past dates",
    });
  }

  // Get day of week for the meeting date
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayOfWeek = daysOfWeek[meetingDateObj.getDay()];

  // First, check if the teacher is available at the requested time
  const teacherAvailabilityQuery = `
    SELECT id
    FROM schedules
    WHERE teacher_id = ?
      AND day_of_week = ?
      AND ((start_time < ? AND end_time > ?) 
           OR (start_time < ? AND end_time > ?) 
           OR (start_time >= ? AND end_time <= ?))
  `;

  const availabilityParams = [
    teacher_id,
    dayOfWeek,
    end_time,
    start_time,
    end_time,
    start_time,
    start_time,
    end_time,
  ];

  // Then, check for existing meetings
  const existingMeetingsQuery = `
    SELECT id
    FROM teacher_meetings
    WHERE teacher_id = ?
      AND meeting_date = ?
      AND status != 'cancelled'
      AND ((start_time < ? AND end_time > ?) 
           OR (start_time < ? AND end_time > ?) 
           OR (start_time >= ? AND end_time <= ?))
  `;

  const meetingsParams = [
    teacher_id,
    meeting_date,
    end_time,
    start_time,
    end_time,
    start_time,
    start_time,
    end_time,
  ];

  // Check teacher's schedule first
  connection.query(
    teacherAvailabilityQuery,
    availabilityParams,
    (scheduleErr, scheduleResults) => {
      if (scheduleErr) {
        console.error("Database error:", scheduleErr.message);
        return res.status(500).json({
          success: false,
          message: "Database error",
        });
      }

      // If teacher has a class during this time, return error
      if (scheduleResults.length > 0) {
        return res.status(409).json({
          success: false,
          message:
            "Cannot schedule: This teacher has a class during this time period.",
        });
      }

      // If no schedule conflict, check for existing meetings
      connection.query(
        existingMeetingsQuery,
        meetingsParams,
        (meetingsErr, meetingsResults) => {
          if (meetingsErr) {
            console.error("Database error:", meetingsErr.message);
            return res.status(500).json({
              success: false,
              message: "Database error",
            });
          }

          // If teacher already has a meeting during this time, return error
          if (meetingsResults.length > 0) {
            return res.status(409).json({
              success: false,
              message:
                "Cannot schedule: This teacher already has a meeting during this time period.",
            });
          }

          // If no conflicts, proceed with scheduling the meeting
          const insertQuery = `
        INSERT INTO teacher_meetings 
        (teacher_id, student_id, meeting_date, start_time, end_time, purpose, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
      `;

          const insertParams = [
            teacher_id,
            user_id,
            meeting_date,
            start_time,
            end_time,
            purpose,
          ];

          connection.query(insertQuery, insertParams, (insertErr, result) => {
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
              meeting_id: result.insertId,
            });
          });
        }
      );
    }
  );
});

module.exports = router;

// Update endpoint to get all classroom reservations
router.get("/get_all_reservations", (req, res) => {
  const query = `
    SELECT cr.*, c.name AS classroom_name, u.username AS user_name
    FROM classroom_reservations cr
    JOIN classrooms c ON cr.classroom_id = c.id
    JOIN users u ON cr.user_id = u.id
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    return res.status(200).json({
      success: true,
      reservations: results,
    });
  });
});

// Update meeting request status
router.post("/update_meeting_request_status", (req, res) => {
  const { meeting_id, status, auto_rejected } = req.body;

  if (!meeting_id || !status || !["approved", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid meeting ID or status",
    });
  }

  const query = `
    UPDATE teacher_meetings
    SET status = ?
    WHERE id = ?
  `;

  connection.query(query, [status, meeting_id], (err, result) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Failed to update meeting status",
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    // If we're approving a meeting, we should check for and handle conflicts
    if (status === "approved") {
      // Get the meeting details to find conflicts
      const getMeetingQuery = `
        SELECT teacher_id, meeting_date, start_time, end_time
        FROM teacher_meetings
        WHERE id = ?
      `;

      connection.query(
        getMeetingQuery,
        [meeting_id],
        (meetingErr, meetingResults) => {
          if (meetingErr || meetingResults.length === 0) {
            // Still return success for the status update
            return res.status(200).json({
              success: true,
              message: `Meeting ${
                status === "approved" ? "approved" : "rejected"
              } successfully`,
            });
          }

          const meeting = meetingResults[0];

          // Find conflicting meetings and reject them
          const conflictQuery = `
          UPDATE teacher_meetings
          SET status = 'rejected'
          WHERE id != ?
            AND teacher_id = ?
            AND meeting_date = ?
            AND ((start_time < ? AND end_time > ?) 
                OR (start_time < ? AND end_time > ?) 
                OR (start_time >= ? AND end_time <= ?))
            AND status = 'pending'
        `;

          const conflictParams = [
            meeting_id,
            meeting.teacher_id,
            meeting.meeting_date,
            meeting.end_time,
            meeting.start_time,
            meeting.end_time,
            meeting.start_time,
            meeting.start_time,
            meeting.end_time,
          ];

          connection.query(
            conflictQuery,
            conflictParams,
            (conflictErr, conflictResult) => {
              // Return success regardless of conflict handling
              return res.status(200).json({
                success: true,
                message: `Meeting ${
                  status === "approved" ? "approved" : "rejected"
                } successfully`,
                conflictsRejected: conflictErr
                  ? 0
                  : conflictResult.affectedRows,
              });
            }
          );
        }
      );
    } else {
      // For rejected meetings, just return success
      return res.status(200).json({
        success: true,
        message: `Meeting ${
          status === "approved" ? "approved" : "rejected"
        } successfully`,
      });
    }
  });
});

// Update reservation status
router.post("/update_reservation_status", (req, res) => {
  const { reservation_id, status, auto_rejected } = req.body;

  if (!reservation_id || !status) {
    return res.status(400).json({
      success: false,
      message: "Reservation ID and status are required",
    });
  }

  // First, get the reservation details to know which user to notify
  const getReservationQuery = `
    SELECT r.*, c.name as classroom_name, u.id as user_id
    FROM classroom_reservations r
    JOIN classrooms c ON r.classroom_id = c.id
    JOIN users u ON r.user_id = u.id
    WHERE r.id = ?
  `;

  connection.query(
    getReservationQuery,
    [reservation_id],
    (err, reservations) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch reservation details",
        });
      }

      if (reservations.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Reservation not found",
        });
      }

      const reservation = reservations[0];

      // Update the reservation status
      const updateQuery = `
      UPDATE classroom_reservations
      SET status = ?, updated_at = NOW()
      WHERE id = ?
    `;

      connection.query(
        updateQuery,
        [status, reservation_id],
        (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Database error:", updateErr);
            return res.status(500).json({
              success: false,
              message: "Failed to update reservation status",
            });
          }

          // Create notification for the user
          const notificationTitle =
            status === "approved"
              ? "Classroom Reservation Approved"
              : status === "rejected"
              ? "Classroom Reservation Rejected"
              : "Classroom Reservation Status Updated";

          const notificationMessage =
            status === "approved"
              ? `Your reservation for ${
                  reservation.classroom_name
                } on ${new Date(
                  reservation.reservation_date
                ).toLocaleDateString()} from ${reservation.start_time} to ${
                  reservation.end_time
                } has been approved.`
              : status === "rejected"
              ? `Your reservation for ${
                  reservation.classroom_name
                } on ${new Date(
                  reservation.reservation_date
                ).toLocaleDateString()} from ${reservation.start_time} to ${
                  reservation.end_time
                } has been ${
                  auto_rejected
                    ? "automatically rejected due to a conflict"
                    : "rejected"
                }.`
              : `The status of your reservation for ${reservation.classroom_name} has been updated to ${status}.`;

          // Create notification
          const notificationQuery = `
        INSERT INTO user_notifications 
        (user_id, title, message, related_id, notification_type, read, created_at) 
        VALUES (?, ?, ?, ?, ?, false, NOW())
      `;

          connection.query(
            notificationQuery,
            [
              reservation.user_id,
              notificationTitle,
              notificationMessage,
              reservation_id,
              "reservation_status",
            ],
            (notifyErr, notifyResult) => {
              if (notifyErr) {
                console.error("Error creating notification:", notifyErr);
                // Still return success for the status update even if notification fails
              }

              return res.status(200).json({
                success: true,
                message: `Reservation ${status} successfully`,
              });
            }
          );
        }
      );
    }
  );
});
