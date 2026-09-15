const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

require("dotenv").config();

const { connectDatabase, getDatabase } = require("./config/database");

const { initializeUserCollection } = require("./models/userModel");
const {
  initializeSubcontractorCollection,
} = require("./models/subcontractorModel");
const { initializeDocumentCollection } = require("./models/documentModel");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const subcontractorRoutes = require("./routes/subcontractorRoutes");
const documentRoutes = require("./routes/documentRoutes");
const contactRoutes = require("./routes/contactRoutes");
const subcontractorAdminRoutes = require("./routes/subcontractorAdminRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const uploadsDirectory = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://ascsusbd.smimtiaj.workers.dev",
  "https://ascsusbd.com",
  "https://www.ascsusbd.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allows Render health checks, Postman, server-to-server calls,
      // and requests without a browser Origin header.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/uploads", express.static(uploadsDirectory));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/subcontractors", subcontractorRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin/subcontractors", subcontractorAdminRoutes);

app.get("/health", async (req, res) => {
  try {
    const database = getDatabase();
    await database.command({ ping: 1 });

    res.json({
      status: "ok",
      service: "alif-backend",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(503).json({
      status: "error",
      service: "alif-backend",
      database: "disconnected",
    });
  }
});

async function startServer() {
  try {
    await connectDatabase();
    await initializeUserCollection();
    await initializeSubcontractorCollection();
    await initializeDocumentCollection();

    console.log("Users collection initialized");
    console.log("Subcontractor collection initialized");
    console.log("Documents collection initialized");

    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();