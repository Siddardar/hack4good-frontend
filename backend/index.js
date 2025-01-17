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

//Non admin route to check availabiliy of item
app.post("/check-availability", async (req, res) => {
  const collection = client.db("hack4good").collection("store");
  const { itemId } = req.body;
  try {
    const item = await collection.findOne({ _id: ObjectId.createFromHexString(itemId) });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (item.quantity >= 0) {
      return res.status(200).json({ available: true });
    } else {
      return res.status(200).json({ available: false });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//Non admin route to check balance
app.post("/check-balance", async (req, res) => {
  const collection = client.db("hack4good").collection("residents");
  const uid = req.cookies["uid"];
  try {
    const resident = await collection.findOne({_id: uid});

    return res.status(200).json({ balance: resident.amount });
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

app.post("/update-cart", async (req, res) => {
  const collection = client.db("hack4good").collection("residents");

  const uid = req.cookies["uid"];

  if (!uid) {
    return res.status(401).json({ error: "Unauthorized: UID not provided" });
  }

  try {
    const cartItem = req.body;
    if (!cartItem || !cartItem._id || cartItem.quantity == null) {
      return res.status(400).json({ error: "Invalid cart item" });
    }

    const resident = await collection.findOne({ _id: uid });

    if (!resident) {
      return res.status(404).json({ error: "Resident not found" });
    }

    const existingItem = resident.cart.find(
      (item) => item._id === cartItem._id
    );

    if (existingItem) {
      const result = await collection.updateOne(
        { _id: uid, "cart._id": cartItem._id },
        { $set: { "cart.$.quantity": existingItem.quantity + cartItem.quantity } }
      );

      if (result.modifiedCount === 0) {
        return res.status(500).json({ error: "Failed to update cart item" });
      }

      return res.status(200).json({ message: "Cart item quantity updated", cartItem });
    } else {
      const result = await collection.updateOne(
        { _id: uid }, 
        { $push: { cart: cartItem } } 
      );

      if (result.modifiedCount === 0) {
        return res.status(500).json({ error: "Failed to add item to cart" });
      }

      return res.status(200).json({ message: "Cart item added", cartItem });
    }
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/update-whole-cart", async (req, res) => {
  const collection = client.db("hack4good").collection("residents");
  const uid = req.cookies["uid"];

  if (!uid) {
    return res.status(401).json({ error: "Unauthorized: UID not provided" });
  }

  try {
    const cart = req.body;

    if (!cart || !Array.isArray(cart)) {
      return res.status(400).json({ error: "Invalid cart" });
    }

    const resident = await collection.findOne({ _id: uid });

    if (!resident) {
      return res.status(404).json({ error: "Resident not found" });
    }

    const result = await collection.updateOne(
      { _id: uid },
      { $set: { cart } }
    );

    if (result.modifiedCount === 0) {
      return res.status(500).json({ error: "Failed to update cart" });
    }

    return res.status(200).json({ message: "Cart updated", cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/fetch-cart", async (req, res) => {
  const collection = client.db("hack4good").collection("residents");

  // Get the uid from cookies
  const uid = req.cookies["uid"];

  if (!uid) {
    return res.status(401).json({ error: "Unauthorized: UID not provided" });
  }

  try {
    const resident = await collection.findOne({ _id: uid });

    if (!resident) {
      return res.status(404).json({ error: "Resident not found" });
    }

    // Respond with the cart items
    res.status(200).json({ cart: resident.cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Internal server error" });
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


//Checkout route
app.post("/checkout", async (req, res) => {
  const residentsCollection = client.db("hack4good").collection("residents");
  const storeCollection = client.db("hack4good").collection("store");

  try {
    const { selectedItems, totalPrice } = req.body;
    const residentId = req.cookies["uid"]; // Retrieve the resident's ID from cookies
    if (!residentId) {
      return res.status(401).json({ error: "Unauthorized: Resident ID missing." });
    }

    // Fetch the resident's current data
    const resident = await residentsCollection.findOne({ _id: residentId });
    if (!resident) {
      return res.status(404).json({ error: "Resident not found." });
    }
    // Check if the resident has sufficient balance
    if (resident.amount < totalPrice) {
      return res.status(400).json({ error: "Insufficient balance." });
    }

    // Check availability and prepare updates for the store
    const unavailableItems = [];
    const storeUpdates = [];

    for (const item of selectedItems) {
      const storeItem = await storeCollection.findOne({ _id: ObjectId.createFromHexString(item._id) });

      console.log(storeItem)
      
      if (!storeItem || storeItem.quantity < item.quantity) {
        unavailableItems.push({
          name: item.name,
          requested: item.quantity,
          available: storeItem ? storeItem.quantity : 0,
        });
      } else {
        storeUpdates.push({
          _id: item._id,
          newQuantity: storeItem.quantity - item.quantity,
        });
      }
    }

    

    // If any items are unavailable, abort the transaction
    if (unavailableItems.length > 0) {
      return res.status(400).json({
        error: "Some items are unavailable or out of stock.",
        unavailableItems,
      });
    }

    // Deduct the total price from the resident's balance
    const newBalance = resident.amount - totalPrice;

    // Add the transaction record
    const transactions = selectedItems.map((item) => ({
      date: new Date(),
      amount: item.price * item.quantity,
      description: `${item.name} x ${item.quantity}`,
      status: "Completed",
    }));

    // Perform all database updates in a single transaction
    const session = client.startSession();
    session.startTransaction();

    try {
      // Update the resident's cart, transactions, and balance
      await residentsCollection.updateOne(
        { _id: residentId },
        {
          $set: { cart: [] }, // Clear the cart
          $push: { transactions: { $each: transactions } }, // Add the transaction
          $set: { amount: newBalance }, // Update the balance
        },
        { session }
      );

      // Update the store items' quantities
      for (const update of storeUpdates) {
        await storeCollection.updateOne(
          { _id: ObjectId.createFromHexString(update._id) },
          { $set: { quantity: update.newQuantity } },
          { session }
        );
      }

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({ message: "Checkout successful." });
    } catch (error) {
      // Roll back the transaction in case of an error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Checkout failed:", error);
    return res.status(500).json({ error: "Checkout failed." });
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

app.post("/generate-inventory-summary", checkAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const collection = client.db("hack4good").collection("audit");
    const storeCollection = client.db("hack4good").collection("store");

    const start = new Date(startDate).toISOString();
    const end = new Date(endDate).toISOString();

    // Gets the stock level from the audit log closest before the start date
    const stockAtStart = await collection
      .aggregate([
        { $match: { date: { $lte: start } } },
        { $sort: { date: -1 } },
        {
          $group: {
            _id: "$itemId",
            stockAtStart: { $first: "$stockAfter" },
          },
        },
      ])
      .toArray();

    // Gets the stock level from the audit log closest before the end date
    const stockAtEnd = await collection
      .aggregate([
        { $match: { date: { $lte: end } } },
        { $sort: { date: -1 } },
        {
          $group: {
            _id: "$itemId",
            stockAtEnd: { $first: "$stockAfter" },
          },
        },
      ])
      .toArray();

    const stockAtStartMap = new Map(stockAtStart.map((item) => [item._id, item.stockAtStart]));
    const stockAtEndMap = new Map(stockAtEnd.map((item) => [item._id, item.stockAtEnd]));

    const uniqueIds = [...new Set([...stockAtStartMap.keys(), ...stockAtEndMap.keys()])];
    const objectIds = uniqueIds.map(id => new ObjectId(id));
    
    const itemNames = await storeCollection
      .find({ _id: { $in: objectIds } })
      .toArray();

    const nameMap = new Map(itemNames.map((item) => [item._id.toString(), item.name]));
    const report = Array.from(new Set([...stockAtStartMap.keys(), ...stockAtEndMap.keys()])).map(
      (itemId) => {
        const stockLevelAtStart = stockAtStartMap.get(itemId) || 0;
        const stockLevelAtEnd = stockAtEndMap.get(itemId) || 0;
        const name = nameMap.get(itemId) || "Unknown Item";
        return {
          name,
          stockLevelAtStart,
          stockLevelAtEnd
        };
      }
    );

    // Add these debug logs right before the store collection query
    console.log("IDs we're searching for:", [...stockAtStartMap.keys(), ...stockAtEndMap.keys()]);

    // Add a direct document check
    const sampleStoreDoc = await storeCollection.findOne();
    console.log("Sample store document:", sampleStoreDoc);
    console.log("Store query result:", itemNames);

    res.status(200).json({ message: "Report generated successfully", report });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Internal server error" });
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
    const { id, itemId, action, user, date, details, stockBefore, stockAfter } =
      req.body;

    if (
      !id ||
      !itemId ||
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
      itemId,
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

app.post("/product-request", async (req, res) => {
  try {
    const { userId, userEmail, itemId, itemName, dateRequested, status } = req.body;
    
    if (!userId || !userEmail || !itemId || !itemName || !dateRequested || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const validStatuses = ["Accepted", "Rejected", "Pending"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const collection = client.db("hack4good").collection("product-requests");

    const newRequest = {
      userId,
      userEmail,
      itemId,
      itemName,
      dateRequested: new Date(dateRequested),
      status,
    };

    const result = await collection.insertOne(newRequest);

    return res.status(201).json({ message: "Request stored successfully", requestId: result.insertedId });
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/product-request", async (req, res) => {
  try {
    const collection = client.db("hack4good").collection("product-requests");

    // Fetch all requests from the database
    const requests = await collection.find({}).toArray();

    return res.status(200).json({ requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.patch("/product-requests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Approved", "Rejected", "Shipping", "Completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const collection = client.db("hack4good").collection("product-requests");
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Request not found" });
    }

    return res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening at port: ${port}`);
});
