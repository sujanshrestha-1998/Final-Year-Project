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

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    return;
  }
  console.log("Connected to the MySQL database!");
});

// Route to register a new RTE officer
router.post("/rte_post", (req, res) => {
  const {
    rte_id,
    email,
    first_name,
    last_name,
    date_of_birth,
    hire_date,
    department,
    password,
    role_id,
  } = req.body;

  console.log("Request body:", req.body);

  // Convert string ID to integer if it contains numbers
  let numericId;
  if (typeof rte_id === 'string' && rte_id.startsWith('RTE')) {
    // Extract the numeric part from the RTE ID
    numericId = parseInt(rte_id.replace('RTE', ''), 10);
    if (isNaN(numericId)) {
      return res.status(400).json({ message: "Invalid RTE ID format" });
    }
  } else {
    numericId = parseInt(rte_id, 10);
    if (isNaN(numericId)) {
      return res.status(400).json({ message: "Invalid RTE ID format" });
    }
  }

  connection.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ message: "Transaction start error" });
    }

    // First insert into users table
    const userQuery = `
      INSERT INTO users (id, username, password_hash, email, role_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const userValues = [
      numericId, // Use the numeric ID instead of the string ID
      `${first_name} ${last_name}`,
      password,
      email,
      role_id || 2, // Role ID 2 for RTE Officer
    ];

    connection.query(userQuery, userValues, (err, userResults) => {
      if (err) {
        console.error("Error inserting user:", err);
        return connection.rollback(() => {
          res
            .status(500)
            .json({ message: "Error inserting user", error: err.message });
        });
      }

      // Then insert into rte_officers table
      const rteQuery = `
        INSERT INTO rte_officers (rte_officer_id, first_name, last_name, email, date_of_birth, hire_date, status)
        VALUES (?, ?, ?, ?, ?, ?, 'active')
      `;
      const rteValues = [
        numericId, // Use the numeric ID here as well
        first_name,
        last_name,
        email,
        date_of_birth,
        hire_date,
      ];

      connection.query(rteQuery, rteValues, (err, rteResults) => {
        if (err) {
          console.error("Error inserting RTE officer:", err);
          return connection.rollback(() => {
            res
              .status(500)
              .json({
                message: "Error inserting RTE officer",
                error: err.message,
              });
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
            .json({
              message: "User and RTE officer data inserted successfully",
            });
        });
      });
    });
  });
});

module.exports = router;
