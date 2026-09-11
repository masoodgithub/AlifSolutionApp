const {
  createSubcontractorApplication
} = require("../models/subcontractorModel");

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

module.exports = {
  submitSubcontractorApplication
};
