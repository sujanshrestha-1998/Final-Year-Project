const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const studRoutes = require("./routes/studRoutes");
const teachRoutes = require("./routes/teacherRoutes");
const funcRoute = require("./routes/funcRoutes");
const moreRoutes = require("./routes/moreRoutes");
const addhRoutes = require("./routes/addhRoutes");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route Handling
app.use("/api", authRoutes); // Auth routes (login, etc.)
app.use("/api", studRoutes); // Student details route
app.use("/api", teachRoutes); // Student details route
app.use("/api", funcRoute); // Student details route
app.use("/api", moreRoutes);
app.use("/api", addhRoutes); // Student details route

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
