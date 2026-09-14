
const express = require("express");
const path = require("path");
const fs = require("fs");

require("dotenv").config();
const cors = require("cors");

const {
  connectDatabase,
  getDatabase
} = require("./config/database");

const {
  initializeUserCollection
} = require("./models/userModel");
const {
  initializeSubcontractorCollection
} = require("./models/subcontractorModel");
const {
  initializeDocumentCollection
} = require("./models/documentModel");
const subcontractorRoutes = require("./routes/subcontractorRoutes");
const documentRoutes = require("./routes/documentRoutes");
const subcontractorAdminRoutes = require("./routes/subcontractorAdminRoutes");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const uploadsDirectory = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

app.use("/uploads", express.static(uploadsDirectory));
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174"
  ]
}));
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/subcontractors", subcontractorRoutes);
app.use("/api/documents", documentRoutes);
app.use(
  "/api/admin/subcontractors",
  subcontractorAdminRoutes
);

app.get("/health", async (req, res) => {
  try {
    const database = getDatabase();
    await database.command({ ping: 1 });

    res.json({
      status: "ok",
      service: "alif-backend",
      database: "connected"
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(503).json({
      status: "error",
      service: "alif-backend",
      database: "disconnected"
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
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();