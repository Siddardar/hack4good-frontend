const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const checkAdmin = async (req, res, next) => {
  // const authHeader = req.header("token");

  // if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //   return res.status(401).send("Unauthorized");
  // }

  // const token = authHeader.split(" ")[1];

  const token = req.header("token");

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
    res.status(401).send("Unauthorized");
  }
};

module.exports = checkAdmin;
