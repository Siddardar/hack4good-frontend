const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(
        /\\n/g,
        "\n"
      ),
    }),
  });
}

const checkAdmin = async (req, res, next) => {
  // const authHeader = req.header("token");

  // if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //   return res.status(401).send("Unauthorized");
  // }

  // const token = authHeader.split(" ")[1];
  const token = req.cookies["token"];
  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const isAdmin = decodedToken.admin === true;
    console.log(isAdmin);

    if (isAdmin) {
      next();
    } else {
      res.status(403).send("Forbidden");
    }
  } catch (error) {
    res.status(401).send("Token is not valid");
  }
};

module.exports = checkAdmin;
