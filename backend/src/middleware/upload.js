const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadsDirectory = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const allowedExtensions = new Set([
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
]);

const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    callback(null, uploadsDirectory);
  },

  filename: (request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    callback(
      null,
      `${Date.now()}-${crypto.randomUUID()}${extension}`
    );
  },
});

function fileFilter(request, file, callback) {
  const extension = path.extname(file.originalname).toLowerCase();

  const hasAllowedMimeType = allowedMimeTypes.has(file.mimetype);
  const hasAllowedExtension = allowedExtensions.has(extension);

  if (!hasAllowedMimeType || !hasAllowedExtension) {
    callback(
      new Error(
        "Only PDF, JPG, JPEG, PNG, and WEBP files are allowed."
      )
    );
    return;
  }

  callback(null, true);
}

const uploadDocuments = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10,
  },
});

module.exports = {
  uploadDocuments,
};