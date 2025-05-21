const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
// Import routes
const authRoutes = require("./routes/authRoutes");
const studRoutes = require("./routes/studRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const funcRoutes = require("./routes/funcRoutes");
const addhRoutes = require("./routes/addhRoutes");
const moreRoutes = require("./routes/moreRoutes");
const notificationRoutes = require("./routes/notificationRoutes"); // Add this line

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route Handling
app.use("/api", authRoutes); // Auth routes (login, etc.)
app.use("/api", studRoutes); // Student details route
app.use("/api", teacherRoutes); // Student details route
app.use("/api", funcRoutes); // Student details route
app.use("/api", addhRoutes); // Student details route
app.use("/api", moreRoutes);
app.use("/api", notificationRoutes); // Add this line

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
