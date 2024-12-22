const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use("/api", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
