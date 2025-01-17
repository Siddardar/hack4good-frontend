const express = require("express");
const { admin } = require("./admin");
const { exportToExcel } = require("./exportToExcel");
const bodyParser = require("body-parser");
const checkAdmin = require("./middleware");
require("dotenv").config();

const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend origin
    credentials: true, // Allow cookies to be sent
  })
);
app.use(bodyParser.json());

//Admin routes
app.post("/set-admin", checkAdmin, async (req, res) => {
  const { uid } = req.body;

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });

    return res.status(200).json({ message: `User ${uid} is now an admin.` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/remove-admin", checkAdmin, async (req, res) => {
  const { uid } = req.body;

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: false });

    return res
      .status(200)
      .json({ message: `Admin access removed from user ${uid}.` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/create-user", checkAdmin, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await admin.auth().createUser({
      email,
      password,
    });

    return res
      .status(200)
      .json({ message: `User ${user.uid} created.`, id: user.uid });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//MongoDB setup
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const mongodbURL = process.env.MONGODB_URL;

const client = new MongoClient(mongodbURL, {
  serverApi: ServerApiVersion.v1,
});

client.connect((err) => {
  if (err) {
    console.error("Failed to connect to MongoDB", err);
    return;
  }
  console.log("Connected to MongoDB");
});

// MongoDB routes

//Generic routes

//Non admin store fetch route
app.get("/store", async (req, res) => {
  const collection = client.db("hack4good").collection("store");
  try {
    const data = await collection.find({}).toArray();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//Fetch route
app.get("/fetch/:collectionName", checkAdmin, async (req, res) => {
  const { collectionName } = req.params;

  const collection = client.db("hack4good").collection(collectionName);
  try {
    const data = await collection.find({}).toArray();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//Delete route
app.post("/delete/:collectionName", checkAdmin, async (req, res) => {
  const { collectionName } = req.params;
  const collection = client.db("hack4good").collection(collectionName);
  const { id } = req.body;

  try {
    // Convert the string ID to an ObjectId
    const task = await collection.deleteOne({
      _id:
        collectionName === "residents" || "staff"
          ? id
          : ObjectId.createFromHexString(id),
    });

    if (collectionName === "residents" || "staff") {
      await admin.auth().deleteUser(id);
    }

    if (task.deletedCount === 1) {
      return res
        .status(200)
        .json({ message: `${collectionName} ${id} deleted.` });
    } else {
      return res
        .status(404)
        .json({ message: `${collectionName} ${id} not found.` });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Add tasks route
app.post("/add-task", checkAdmin, async (req, res) => {
  const collection = client.db("hack4good").collection("voucher-tasks");
  const { dateAdded, desc, reward, staffName } = req.body;
  try {
    const task = await collection.insertOne({
      dateAdded,
      desc,
      reward,
      staffName,
    });
    return res.status(200).json({
      message: `Task ${task.insertedId} created.`,
      id: task.insertedId,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Residents route

// Add residents route
app.post("/add-resident", checkAdmin, async (req, res) => {
  const collection = client.db("hack4good").collection("residents");
  const { amount, name, username, email, transactions, tasks, requests } =
    req.body;

  try {
    const resident = await collection.insertOne({
      amount,
      name,
      username,
      email,
      isSuspended,
      transactions: transactions.map((transaction) => ({
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.description,
        status: transaction.status,
      })),
      tasks: tasks.map((task) => ({
        dateCompleted: task.dateCompleted,
        description: task.description,
        status: task.status,
        reward: task.reward,
      })),
      requests: requests.map((request) => ({
        dateRequested: request.dateRequested,
        description: request.description,
        status: request.status,
        reward: request.reward,
      })),
    });

    return res.status(200).json({
      message: `Resident ${resident.insertedId} added.`,
      id: resident.insertedId,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//Suspend residents route
app.post("/suspend-resident", checkAdmin, async (req, res) => {
  const collection = client.db("hack4good").collection("residents");
  const { id } = req.body;

  try {
    await admin.auth().updateUser(id, { disabled: true });
    return res.status(200).json({ message: `User ${id} has been suspended.` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//Unsuspend residents route
app.post("/unsuspend-resident", checkAdmin, async (req, res) => {
  const collection = client.db("hack4good").collection("residents");
  const { id } = req.body;
  try {
    await admin.auth().updateUser(id, { disabled: false });
    return res
      .status(200)
      .json({ message: `User ${id} has been unsuspended.` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//Reset resident password route
app.post("/reset-password", checkAdmin, async (req, res) => {
  const collection = client.db("hack4good").collection("residents");
  const { id } = req.body;
  try {
    await admin.auth().send;
    return res.status(200).json({ message: `User ${id} password updated.` });
  } catch (error) {
    return res.status(200).json({ error: error.message });
  }
});

//Items routes
app.post("/add-item", checkAdmin, async (req, res) => {
  const collection = client.db("hack4good").collection("store");
  const { name, price, img, quantity, dateAdded } = req.body;
  try {
    const item = await collection.insertOne({
      name,
      price,
      img,
      quantity,
      dateAdded,
    });
    return res.status(200).json({
      message: `Item ${item.insertedId} created.`,
      id: item.insertedId,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/update-item", checkAdmin, async (req, res) => {
  const collection = client.db("hack4good").collection("store");
  const { id, name, price, img, quantity, dateAdded } = req.body;
  try {
    const item = await collection.updateOne(
      { _id: ObjectId.createFromHexString(id) },
      { $set: { name, price, img, quantity, dateAdded } }
    );
    return res.status(200).json({ message: `Item ${id} updated.` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//Add user
app.post("/add-user", async (req, res) => {
  const collection = client.db("hack4good").collection("residents");

  try {
    const user = await collection.insertOne(req.body);
    return res.status(200).json({
      message: `User ${user.insertedId} created.`,
      id: user.insertedId,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/add-admin", async (req, res) => {
  const collection = client.db("hack4good").collection("staff");
  console.log(req.body.person);
  console.log(req.body);
  try {
    const user = await collection.insertOne(req.body);
    return res.status(200).json({
      message: `User ${user.insertedId} created.`,
      id: user.insertedId,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Report routes
// Get date ranges
app.get("/date-ranges", checkAdmin, async (req, res) => {
  const collection = client.db("hack4good").collection("date-ranges");

  try {
    const dateRanges = await collection
      .find()
      .sort({ accessed_at: -1 })
      .toArray();

    const dateRangesWithId = dateRanges.map((range) => ({
      id: range._id.toString(),
      ...range,
    }));

    return res.status(200).json(dateRangesWithId);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Add date range
app.post("/date-ranges", checkAdmin, async (req, res) => {
  const collection = client.db("hack4good").collection("date-ranges");
  const { from, to, accessed_at } = req.body;

  if (!from || !to || !accessed_at) {
    return res
      .status(400)
      .json({ error: "Missing required fields: from, to, or accessed_at" });
  }

  try {
    const result = await collection.insertOne({ from, to, accessed_at });
    return res.status(200).json({
      message: `Date range ${result.insertedId} created.`,
      id: result.insertedId,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Check if a date range already exists
app.post("/date-ranges/check", checkAdmin, async (req, res) => {
  const collection = client.db("hack4good").collection("date-ranges");
  const { from, to } = req.body;

  try {
    const existingRange = await collection.findOne({
      from: from,
      to: to,
    });

    if (existingRange) {
      return res.json({ exists: true, id: existingRange._id });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Update a date range's accessed_at
app.put("/date-ranges/:id", checkAdmin, async (req, res) => {
  const collection = client.db("hack4good").collection("date-ranges");
  const { id } = req.params;
  const { accessed_at } = req.body;

  try {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ObjectId" });
    }

    const updatedRange = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { accessed_at } }
    );

    if (updatedRange.modifiedCount > 0) {
      return res
        .status(200)
        .json({ message: "Date range updated successfully" });
    } else {
      return res.status(404).json({ message: "Date range not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Audit routes

// Get audit logs
app.get("/audit", checkAdmin, async (req, res) => {
  const collection = client.db("hack4good").collection("audit");

  try {
    const auditLogs = await collection.find({}).toArray();

    return res.status(200).json(auditLogs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/audit", checkAdmin, (req, res) => {
  try {
    const { id, action, user, date, details, stockBefore, stockAfter } =
      req.body;

    if (
      !id ||
      !action ||
      !user ||
      !date ||
      !details ||
      stockBefore === undefined ||
      stockAfter === undefined
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const auditLog = {
      id,
      action,
      user,
      date,
      details,
      stockBefore,
      stockAfter,
    };

    const collection = client.db("hack4good").collection("audit");
    collection.insertOne(auditLog);

    console.log("Audit log saved:", auditLog);

    res
      .status(201)
      .json({ message: "Audit log created successfully", auditLog });
  } catch (error) {
    console.error("Error saving audit log:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/export-report", checkAdmin, exportToExcel);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening at port: ${port}`);
});
