const { getDatabase } = require("../config/database");

const COLLECTION_NAME = "customer_reviews";

async function initializeReviewCollection() {
  const database = getDatabase();

  const existingCollections = await database
    .listCollections({ name: COLLECTION_NAME })
    .toArray();

  if (existingCollections.length === 0) {
    await database.createCollection(COLLECTION_NAME);
  }

  const reviews = database.collection(COLLECTION_NAME);

  await reviews.createIndex({ status: 1, createdAt: -1 });
  await reviews.createIndex({ rating: 1 });

  return reviews;
}

function getReviewCollection() {
  return getDatabase().collection(COLLECTION_NAME);
}

module.exports = {
  initializeReviewCollection,
  getReviewCollection,
};