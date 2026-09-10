const {
  createUser,
  findUserByEmail
} = require("../models/userModel");

async function registerUser(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters."
      });
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists."
      });
    }

    const user = await createUser({
      name,
      email,
      password,
      role
    });

    res.status(201).json({
      success: true,
      user
    });
  } catch (error) {
    console.error("User registration failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to create user."
    });
  }
}

module.exports = {
  registerUser
};