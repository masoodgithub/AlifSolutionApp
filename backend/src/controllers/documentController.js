const fs = require("fs");
const path = require("path");

const {
  findUserById,
} = require("../models/userModel");

const {
  findSubcontractorApplicationByEmail,
} = require("../models/subcontractorModel");

const {
  createDocuments,
  listApplicationDocuments,
} = require("../models/documentModel");

function removeUploadedFiles(files) {
  files.forEach((file) => {
    const filePath = path.join(
      process.cwd(),
      "uploads",
      file.filename
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
}

async function uploadMyApplicationDocuments(req, res) {
  const files = req.files || [];
  const userId = req.user?.userId;
  const category = String(req.body.category || "other").trim();

  if (!userId) {
    removeUploadedFiles(files);

    return res.status(401).json({
      success: false,
      message: "Authenticated user ID is not available.",
    });
  }

  if (files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please select at least one file.",
    });
  }

  try {
    const user = await findUserById(userId);

    if (!user) {
      removeUploadedFiles(files);

      return res.status(401).json({
        success: false,
        message: "Authenticated user was not found.",
      });
    }

    const application =
      await findSubcontractorApplicationByEmail(user.email);

    if (!application) {
      removeUploadedFiles(files);

      return res.status(404).json({
        success: false,
        message:
          "No subcontractor application was found for this account.",
      });
    }

    const now = new Date();

    const documentsToCreate = files.map((file) => ({
      originalName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      size: file.size,

      category,

      contextType: "subcontractor_application",
      subcontractorApplicationId: application._id,
      workOrderId: null,

      uploadedBy: user._id,

      reviewStatus: "pending",
      reviewNote: "",

      visibleToClient: false,

      reviewedBy: null,
      reviewedAt: null,

      createdAt: now,
      updatedAt: now,
    }));

    const createdDocuments =
      await createDocuments(documentsToCreate);

    return res.status(201).json({
      success: true,
      message: "Documents uploaded successfully.",
      documents: createdDocuments,
    });
  } catch (error) {
    console.error(
      "Uploading subcontractor application documents failed:",
      error.message
    );

    removeUploadedFiles(files);

    return res.status(500).json({
      success: false,
      message: "Unable to upload documents.",
    });
  }
}
async function getMyApplicationDocuments(req, res) {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authenticated user ID is not available.",
    });
  }

  try {
    const user = await findUserById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user was not found.",
      });
    }

    const application =
      await findSubcontractorApplicationByEmail(user.email);

    if (!application) {
      return res.status(404).json({
        success: false,
        message:
          "No subcontractor application was found for this account.",
      });
    }

    const documents = await listApplicationDocuments(
      application._id.toString()
    );

    return res.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error(
      "Loading subcontractor application documents failed:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load your documents.",
    });
  }
}

module.exports = {
  uploadMyApplicationDocuments,
  getMyApplicationDocuments,
};