const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/database");

function subcontractorsCollection() {
  return getDatabase().collection("subcontractors");
}

async function initializeSubcontractorCollection() {
  await subcontractorsCollection().createIndex({ email: 1 });
  await subcontractorsCollection().createIndex({ status: 1 });
  await subcontractorsCollection().createIndex({ createdAt: -1 });
}

async function createSubcontractorApplication(applicationData) {
  const now = new Date();

  const application = {
    companyName: applicationData.companyName.trim(),
    contactName: applicationData.contactName.trim(),
    email: applicationData.email.toLowerCase().trim(),
    phone: applicationData.phone.trim(),
    address: applicationData.address.trim(),
    services: applicationData.services || [],
    status: "pending",
    reviewNote: "",
    createdAt: now,
    updatedAt: now
  };

  const result = await subcontractorsCollection().insertOne(application);

  return {
    _id: result.insertedId,
    ...application
  };
}

async function listSubcontractorApplications(status) {
  const filter = status
    ? { status }
    : {};

  return subcontractorsCollection()
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();
}

async function updateSubcontractorApplicationStatus(
  applicationId,
  status,
  reviewNote
) {
  if (!ObjectId.isValid(applicationId)) {
    return null;
  }

  const result = await subcontractorsCollection().findOneAndUpdate(
    { _id: new ObjectId(applicationId) },
    {
      $set: {
        status,
        reviewNote: reviewNote || "",
        updatedAt: new Date()
      }
    },
    {
      returnDocument: "after"
    }
  );

  return result;
}

module.exports = {
  initializeSubcontractorCollection,
  createSubcontractorApplication,
  listSubcontractorApplications,
  updateSubcontractorApplicationStatus
};
