const express = require("express");
const { admin } = require("./admin");
const bodyParser = require("body-parser");
const checkAdmin = require("./middleware");
require("dotenv").config();
const ExcelJS = require('exceljs');

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
      _id: ObjectId.createFromHexString(id),
    });

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
    return res.status(200).json({ message: `User ${user.insertedId} created.` , id: user.insertedId });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/add-admin", async (req, res) => {
  const collection = client.db("hack4good").collection("staff");  
  console.log(req.body.person);
  console.log(req.body)
  try {
    const user = await collection.insertOne(req.body);
    return res.status(200).json({ message: `User ${user.insertedId} created.` , id: user.insertedId });
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

app.post("/export-report", checkAdmin, exportToExcel);

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

app.post("/product-request-by-date", checkAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const collection = client.db("hack4good").collection("product-requests");

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const requests = await collection.find({
      dateRequested: {
        $gte: start,
        $lte: end
      }
    }).toArray();

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


async function exportToExcel(req, res) {
  try {
      const { startDate, endDate } = req.body;
      
      if (!startDate || !endDate) {
          return res.status(400).json({ message: "Start date and end date are required" });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const collection = client.db("hack4good").collection("product-requests");
      
      const requests = await collection.find({
          dateRequested: {
              $gte: start,
              $lte: end
          }
      }).toArray();

      const requestsSummary = new Map();
      requests.forEach(request => {
          if (!requestsSummary.has(request.itemName)) {
              requestsSummary.set(request.itemName, {
                  item: request.itemName,
                  accepted: 0,
                  rejected: 0,
                  pending: 0
              });
          }
          
          const summary = requestsSummary.get(request.itemName);
          switch (request.status.toLowerCase()) {
              case 'accepted':
                  summary.accepted += 1;
                  break;
              case 'rejected':
                  summary.rejected += 1;
                  break;
              case 'pending':
                  summary.pending += 1;
                  break;
          }
      });

      const requestsData = Array.from(requestsSummary.values());

      const workbook = new ExcelJS.Workbook();
      const requestsSheet = workbook.addWorksheet('Requests');

      requestsSheet.columns = [
          { header: 'Item', key: 'item', width: 20 },
          { header: 'Accepted', key: 'accepted', width: 12, style: { alignment: { horizontal: 'right' } } },
          { header: 'Rejected', key: 'rejected', width: 12, style: { alignment: { horizontal: 'right' } } },
          { header: 'Pending', key: 'pending', width: 12, style: { alignment: { horizontal: 'right' } } },
          { header: 'Total', key: 'total', width: 15, style: { alignment: { horizontal: 'right' } } }
      ];

      requestsData.forEach((row) => {
          row.total = row.accepted + row.rejected + row.pending;
          requestsSheet.addRow(row);
      });

      // Calculate and add totals
      const totalAccepted = requestsData.reduce((acc, row) => acc + row.accepted, 0);
      const totalRejected = requestsData.reduce((acc, row) => acc + row.rejected, 0);
      const totalPending = requestsData.reduce((acc, row) => acc + row.pending, 0);
      const totalRequests = totalAccepted + totalRejected + totalPending;

      requestsSheet.addRow({
          item: 'Total',
          accepted: totalAccepted,
          rejected: totalRejected,
          pending: totalPending,
          total: totalRequests
      })

      // INVENTORY

      const inventoryCollection = client.db("hack4good").collection("audit");

      const startString = new Date(startDate).toISOString();
      const endString = new Date(endDate).toISOString();

      // Gets the stock level from the audit log closest before the start date
      const stockAtStart = await inventoryCollection
        .aggregate([
          { $match: { date: { $lte: startString } } },
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
      const stockAtEnd = await inventoryCollection
        .aggregate([
          { $match: { date: { $lte: endString } } },
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
      
      const storeCollection = client.db("hack4good").collection("store");
      
      const itemNames = await storeCollection
        .find({ _id: { $in: objectIds } })
        .toArray();

      const nameMap = new Map(itemNames.map((item) => [item._id.toString(), item.name]));
      const inventoryData = Array.from(new Set([...stockAtStartMap.keys(), ...stockAtEndMap.keys()])).map(
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

      const inventorySheet = workbook.addWorksheet('Inventory');

      inventorySheet.columns = [
          { header: 'Item', key: 'name', width: 20 },
          { header: 'Stock Level at Start', key: 'stockLevelAtStart', width: 18, style: { alignment: { horizontal: 'right' } } },
          { header: 'Stock Level at End', key: 'stockLevelAtEnd', width: 18, style: { alignment: { horizontal: 'right' } } },
          { header: 'Change', key: 'change', width: 12, style: { alignment: { horizontal: 'right' } } }
      ];

      inventoryData.forEach((row) => {
          row.change = row.stockLevelAtStart - row.stockLevelAtEnd;
          inventorySheet.addRow(row);
      });

      const totalStartStock = inventoryData.reduce((acc, row) => acc + row.stockLevelAtStart, 0);
      const totalEndStock = inventoryData.reduce((acc, row) => acc + row.stockLevelAtEnd, 0);
      const totalChange = inventoryData.reduce((acc, row) => acc + row.change, 0);

    inventorySheet.addRow({
        name: 'Total',
        stockLevelAtStart: totalStartStock,
        stockLevelAtEnd: totalEndStock,
        change: totalChange,
    });

    requestsSheet.getRow(1).font = { bold: true };
    inventorySheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=requests_report_${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ message: 'Export failed' });
  }
}

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening at port: ${port}`);
});
