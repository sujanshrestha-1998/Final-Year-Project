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

module.exports = router;
