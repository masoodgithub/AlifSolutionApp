const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "alif_solution_dev";

if (!uri) {
  throw new Error("MONGODB_URI is missing from the .env file.");
}

const client = new MongoClient(uri);

let database;

async function connectDatabase() {
  if (database) {
    return database;
  }

  await client.connect();
  await client.db("admin").command({ ping: 1 });

  database = client.db(dbName);
  console.log(`Connected to MongoDB database: ${dbName}`);

  return database;
}

function getDatabase() {
  if (!database) {
    throw new Error("Database is not connected.");
  }

  return database;
}

module.exports = {
  connectDatabase,
  getDatabase
};