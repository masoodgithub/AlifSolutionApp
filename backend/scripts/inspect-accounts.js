const { connectDatabase } = require("../src/config/database");

async function inspectUsers() {
  const db = await connectDatabase();

  const collections = await db.listCollections({}, { nameOnly: true }).toArray();
  console.log("Collections:");
  console.log(collections.map(({ name }) => name));

  for (const { name } of collections) {
    const rows = await db.collection(name)
      .find(
        {},
        {
          projection: {
            password: 0,
            passwordHash: 0,
            hash: 0,
            refreshToken: 0,
            resetToken: 0,
            verificationToken: 0
          }
        }
      )
      .limit(5)
      .toArray();

    if (rows.length > 0) {
      console.log(`\nCollection: ${name}`);
      console.log(rows);
    }
  }
}

inspectUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
