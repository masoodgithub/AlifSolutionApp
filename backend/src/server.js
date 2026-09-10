const express = require("express");

require("dotenv").config();

const {
  connectDatabase,
  getDatabase
} = require("./config/database");

const {
  initializeUserCollection
} = require("./models/userModel");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

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
    console.log("Users collection initialized");
    
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();