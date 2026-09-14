const {
  createSubcontractorApplication,
  findSubcontractorApplicationByEmail
} = require("../models/subcontractorModel");
const {
  findUserById
} = require("../models/userModel");

async function submitSubcontractorApplication(req, res) {
  try {
    const {
      companyName,
      contactName,
      email,
      phone,
      address,
      services
    } = req.body;

    if (
      !companyName ||
      !contactName ||
      !email ||
      !phone ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Company name, contact name, email, phone, and address are required."
      });
    }

    const application =
      await createSubcontractorApplication({
        companyName,
        contactName,
        email,
        phone,
        address,
        services: Array.isArray(services) ? services : []
      });

    res.status(201).json({
      success: true,
      message: "Subcontractor application submitted for review.",
      application
    });
  } catch (error) {
    console.error(
      "Subcontractor application failed:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to submit subcontractor application."
    });
  }
}
async function getMySubcontractorApplication(req, res) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID is not available."
      });
    }

    const user = await findUserById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user was not found."
      });
    }

    const application =
      await findSubcontractorApplicationByEmail(user.email);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "No subcontractor application was found for this account."
      });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error(
      "Loading current subcontractor application failed:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to load your subcontractor application."
    });
  }
}
module.exports = {
  submitSubcontractorApplication,
  getMySubcontractorApplication
};
