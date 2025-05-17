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

// Get all RTE officers
router.get("/rte_get_all", (req, res) => {
  const query = `
    SELECT r.*, u.email 
    FROM rte_officers r
    JOIN users u ON r.rte_officer_id = u.id
    ORDER BY r.rte_officer_id
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching RTE officers:", err);
      return res.status(500).json({ message: "Error fetching RTE officers", error: err.message });
    }

    return res.status(200).json(results);
  });
});

// Get a specific RTE officer by ID
router.get("/rte_get/:id", (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT r.*, u.email 
    FROM rte_officers r
    JOIN users u ON r.rte_officer_id = u.id
    WHERE r.rte_officer_id = ?
  `;

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching RTE officer:", err);
      return res.status(500).json({ message: "Error fetching RTE officer", error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "RTE officer not found" });
    }

    return res.status(200).json(results[0]);
  });
});

// Update an RTE officer
router.put("/rte_update/:id", (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    email,
    date_of_birth,
    hire_date,
    status
  } = req.body;

  connection.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ message: "Transaction start error" });
    }

    // Update users table
    const userQuery = `
      UPDATE users
      SET username = ?, email = ?, updated_at = NOW()
      WHERE id = ?
    `;
    const userValues = [
      `${first_name} ${last_name}`,
      email,
      id
    ];

    connection.query(userQuery, userValues, (err, userResults) => {
      if (err) {
        console.error("Error updating user:", err);
        return connection.rollback(() => {
          res.status(500).json({ message: "Error updating user", error: err.message });
        });
      }

      // Update rte_officers table
      const rteQuery = `
        UPDATE rte_officers
        SET first_name = ?, last_name = ?, email = ?, date_of_birth = ?, hire_date = ?, status = ?
        WHERE rte_officer_id = ?
      `;
      const rteValues = [
        first_name,
        last_name,
        email,
        date_of_birth,
        hire_date,
        status,
        id
      ];

      connection.query(rteQuery, rteValues, (err, rteResults) => {
        if (err) {
          console.error("Error updating RTE officer:", err);
          return connection.rollback(() => {
            res.status(500).json({ message: "Error updating RTE officer", error: err.message });
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

          return res.status(200).json({ message: "RTE officer updated successfully" });
        });
      });
    });
  });
});

// Delete an RTE officer
router.delete("/rte_delete/:id", (req, res) => {
  const { id } = req.params;

  connection.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ message: "Transaction start error" });
    }

    // Delete from users table first (this will cascade to rte_officers if you have set up foreign key constraints)
    const userQuery = `DELETE FROM users WHERE id = ?`;

    connection.query(userQuery, [id], (err, userResults) => {
      if (err) {
        console.error("Error deleting user:", err);
        return connection.rollback(() => {
          res.status(500).json({ message: "Error deleting user", error: err.message });
        });
      }

      // If no cascade, explicitly delete from rte_officers table
      const rteQuery = `DELETE FROM rte_officers WHERE rte_officer_id = ?`;

      connection.query(rteQuery, [id], (err, rteResults) => {
        if (err) {
          console.error("Error deleting RTE officer:", err);
          return connection.rollback(() => {
            res.status(500).json({ message: "Error deleting RTE officer", error: err.message });
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

          return res.status(200).json({ message: "RTE officer deleted successfully" });
        });
      });
    });
  });
});

module.exports = router;
