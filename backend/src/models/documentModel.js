const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/database");

function documentsCollection() {
  return getDatabase().collection("documents");
}

async function initializeDocumentCollection() {
  await documentsCollection().createIndex(
    { storedName: 1 },
    { unique: true }
  );

  await documentsCollection().createIndex({
    subcontractorApplicationId: 1,
    createdAt: -1,
  });

  await documentsCollection().createIndex({
    workOrderId: 1,
    createdAt: -1,
  });
}

function toObjectId(value) {
  if (!ObjectId.isValid(value)) {
    return null;
  }

  return new ObjectId(value);
}

async function createDocuments(documents) {
  if (!Array.isArray(documents) || documents.length === 0) {
    return [];
  }

  const result = await documentsCollection().insertMany(documents);

  return documents.map((document, index) => ({
    _id: result.insertedIds[index],
    ...document,
  }));
}

async function listApplicationDocuments(applicationId) {
  const subcontractorApplicationId = toObjectId(applicationId);

  if (!subcontractorApplicationId) {
    return [];
  }

  return documentsCollection()
    .find({ subcontractorApplicationId })
    .sort({ createdAt: -1 })
    .toArray();
}

async function listWorkOrderDocuments(workOrderId) {
  const workOrderObjectId = toObjectId(workOrderId);

  if (!workOrderObjectId) {
    return [];
  }

  return documentsCollection()
    .find({
      workOrderId: workOrderObjectId,
    })
    .sort({ createdAt: -1 })
    .toArray();
}

async function findDocumentById(documentId) {
  const _id = toObjectId(documentId);

  if (!_id) {
    return null;
  }

  return documentsCollection().findOne({ _id });
}

async function updateDocumentReview(
  documentId,
  { reviewStatus, reviewNote, reviewedBy }
) {
  const _id = toObjectId(documentId);

  if (!_id) {
    return null;
  }

  const update = {
    updatedAt: new Date(),
  };

  if (reviewStatus) {
    update.reviewStatus = reviewStatus;
  }

  if (typeof reviewNote === "string") {
    update.reviewNote = reviewNote.trim();
  }

  if (reviewedBy && ObjectId.isValid(reviewedBy)) {
    update.reviewedBy = new ObjectId(reviewedBy);
    update.reviewedAt = new Date();
  }

  const result = await documentsCollection().findOneAndUpdate(
    { _id },
    { $set: update },
    { returnDocument: "after" }
  );

  return result.value;
}

async function updateClientVisibility(documentId, visibleToClient) {
  const _id = toObjectId(documentId);

  if (!_id) {
    return null;
  }

  const result = await documentsCollection().findOneAndUpdate(
    { _id },
    {
      $set: {
        visibleToClient: Boolean(visibleToClient),
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  return result.value;
}

async function deleteDocumentById(documentId) {
  const _id = toObjectId(documentId);

  if (!_id) {
    return {
      deletedCount: 0,
    };
  }

  return documentsCollection().deleteOne({ _id });
}

module.exports = {
  initializeDocumentCollection,
  createDocuments,
  listApplicationDocuments,
  listWorkOrderDocuments,
  findDocumentById,
  updateDocumentReview,
  updateClientVisibility,
  deleteDocumentById,
};