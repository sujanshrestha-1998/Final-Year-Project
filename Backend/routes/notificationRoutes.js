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

// Create a new notification
router.post("/user_notifications", (req, res) => {
  const { user_id, title, message, related_id, notification_type } = req.body;

  if (!user_id || !title || !message) {
    return res.status(400).json({
      success: false,
      message: "User ID, title, and message are required",
    });
  }

  const query = `
      INSERT INTO user_notifications 
      (user_id, title, message, related_id, notification_type, \`read\`, created_at) 
      VALUES (?, ?, ?, ?, ?, false, NOW())
    `;

  connection.query(
    query,
    [user_id, title, message, related_id || null, notification_type || null],
    (err, result) => {
      if (err) {
        console.error("Database error:", err.sqlMessage || err.message || err);
        return res.status(500).json({
          success: false,
          message: "Failed to create notification",
          error: err.sqlMessage || err.message || err, // optional: for debugging
        });
      }

      return res.status(201).json({
        success: true,
        message: "Notification created successfully",
        notification_id: result.insertId,
      });
    }
  );
});

// Get all notifications for a user
router.get("/user_notifications/:userId", (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT * FROM user_notifications 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `;

  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
      });
    }

    return res.status(200).json({
      success: true,
      notifications: results,
    });
  });
});

// Get unread notification count for a user
router.get("/user_notifications/unread_count/:userId", (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT COUNT(*) as unreadCount 
    FROM user_notifications 
    WHERE user_id = ? AND \`read\` = false
  `;

  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch unread count",
      });
    }

    return res.status(200).json({
      success: true,
      unreadCount: results[0].unreadCount,
    });
  });
});

// Mark a notification as read
router.put("/user_notifications/mark_read/:notificationId", (req, res) => {
  const { notificationId } = req.params;

  const query = `
    UPDATE user_notifications 
    SET \`read\` = true 
    WHERE id = ?
  `;

  connection.query(query, [notificationId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to mark notification as read",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  });
});

// Delete a notification
router.delete("/user_notifications/:notificationId", (req, res) => {
  const { notificationId } = req.params;

  const query = `
    DELETE FROM user_notifications 
    WHERE id = ?
  `;

  connection.query(query, [notificationId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to delete notification",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  });
});

// Get user by email
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
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user",
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
