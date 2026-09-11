const {
  listSubcontractorApplications,
  updateSubcontractorApplicationStatus
} = require("../models/subcontractorModel");

async function getSubcontractorApplications(req, res) {
  try {
    const { status } = req.query;

    const allowedStatuses = [
      "pending",
      "approved",
      "rejected"
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status."
      });
    }

    const applications =
      await listSubcontractorApplications(status);

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error(
      "Loading subcontractor applications failed:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to load subcontractor applications."
    });
  }
}

async function reviewSubcontractorApplication(req, res) {
  try {
    const { applicationId } = req.params;
    const { status, reviewNote } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected."
      });
    }

    const application =
      await updateSubcontractorApplicationStatus(
        applicationId,
        status,
        reviewNote
      );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Subcontractor application not found."
      });
    }

    res.json({
      success: true,
      message: `Application ${status}.`,
      application
    });
  } catch (error) {
    console.error(
      "Reviewing subcontractor application failed:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to review subcontractor application."
    });
  }
}

module.exports = {
  getSubcontractorApplications,
  reviewSubcontractorApplication
};
