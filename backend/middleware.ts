import { NextFunction, Request, Response } from "express";
import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

export const checkAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await admin.auth().getUser(decodedToken.uid);

    if (user.customClaims?.admin === true) {
      next();
    } else {
      res.status(403).send("Forbidden");
    }
  } catch (error) {
    res.status(401).send("Unauthorized");
  }
};
