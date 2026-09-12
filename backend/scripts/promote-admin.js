const { connectDatabase } = require("../src/config/database");

async function promoteAdmin() {
  const db = await connectDatabase();

  const result = await db.collection("users").updateOne(
    { email: "smimtiaj@gmail.com" },
    { $set: { role: "admin" } }
  );

  console.log({
    matched: result.matchedCount,
    modified: result.modifiedCount
  });

  if (result.matchedCount !== 1) {
    throw new Error("No unique matching user was found. No account was changed.");
  }
}

promoteAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });


