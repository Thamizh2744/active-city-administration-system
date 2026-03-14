const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Test Route (important for checking deployment)
app.get("/", (req, res) => {
  res.send("Smart City Backend API is running");
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/locations", require("./routes/locationRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// Default error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// Export app for Vercel serverless
module.exports = app;