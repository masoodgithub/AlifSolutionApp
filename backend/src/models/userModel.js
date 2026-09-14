const bcrypt = require("bcrypt");
const { getDatabase } = require("../config/database");
const { ObjectId } = require("mongodb");

function usersCollection() {
  return getDatabase().collection("users");
}

async function initializeUserCollection() {
  await usersCollection().createIndex(
    { email: 1 },
    { unique: true }
  );
}

async function findUserByEmail(email) {
  return usersCollection().findOne({
    email: email.toLowerCase().trim()
  });
}

async function createUser(userData) {
  const passwordHash = await bcrypt.hash(userData.password, 12);

  const user = {
    name: userData.name.trim(),
    email: userData.email.toLowerCase().trim(),
    phone: userData.phone ? userData.phone.trim() : "",
address: userData.address ? userData.address.trim() : "",
    passwordHash,
    role: userData.role || "volunteer",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await usersCollection().insertOne(user);

  return {
    _id: result.insertedId,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

async function verifyUserPassword(email, password) {
  const user = await findUserByEmail(email);

  if (!user || !user.passwordHash) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    return null;
  }

  return user;
}
async function findUserById(userId) {
  if (!ObjectId.isValid(userId)) {
    return null;
  }

  return usersCollection().findOne({
    _id: new ObjectId(userId)
  });
}

module.exports = {
  initializeUserCollection,
  findUserByEmail,
  verifyUserPassword,
  createUser,
  findUserById
};