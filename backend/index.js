const express = require("express");
const { admin } = require("./admin"); 
const bodyParser = require("body-parser");
require('dotenv').config();

const app = express();
const cors = require("cors");
app.use(cors());
app.use(bodyParser.json());

//Admin routes
app.post("/set-admin", async (req, res) => {
  const { uid } = req.body; 

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });

    return res.status(200).json({ message: `User ${uid} is now an admin.` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/remove-admin", async (req, res) => {
  const { uid } = req.body;

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: false });

    return res.status(200).json({ message: `Admin access removed from user ${uid}.` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/create-user", async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  try {
    const user = await admin.auth().createUser({
      email,
      password,
    });

    return res.status(200).json({ message: `User ${user.uid} created.`, id: user.uid });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//MongoDB setup
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const mongodbURL = process.env.MONGODB_URL

const client = new MongoClient(mongodbURL, {
  serverApi: ServerApiVersion.v1,
});

client.connect(err => {
  if (err) {
    console.error('Failed to connect to MongoDB', err);
    return;
  }
  console.log('Connected to MongoDB');
});



// MongoDB routes

//Generic routes
//Fetch route
app.get("/fetch/:collectionName", async (req, res) => {
  
  const {collectionName} = req.params;
  
  const collection = client.db("hack4good").collection(collectionName);
  try {
      const data = await collection.find({}).toArray();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
});

//Delete route
app.post("/delete/:collectionName", async (req, res) => {

  const {collectionName} = req.params;
  const collection = client.db("hack4good").collection(collectionName);
  const { id } = req.body;

  try {
    // Convert the string ID to an ObjectId
    const task = await collection.deleteOne({ _id: ObjectId.createFromHexString(id) });

    if (task.deletedCount === 1) {
      return res.status(200).json({ message: `${collectionName} ${id} deleted.` });
    } else {
      return res.status(404).json({ message: `${collectionName} ${id} not found.` });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//Add tasks route
app.post("/add-task", async (req, res) => {
  const collection = client.db("hack4good").collection("voucher-tasks");
  const { dateAdded, desc, reward, staffName } = req.body;
  try {
    const task = await collection.insertOne({ dateAdded, desc, reward, staffName });
    return res.status(200).json({ message: `Task ${task.insertedId} created.` , id: task.insertedId });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


//Items routes
app.post("/add-item", async (req, res) => {
  const collection = client.db("hack4good").collection("store");
  const { name, price, img, quantity, dateAdded} = req.body;
  try {
    const item = await collection.insertOne({ name, price, img, quantity, dateAdded });
    return res.status(200).json({ message: `Item ${item.insertedId} created.` , id: item.insertedId });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/update-item", async (req, res) => {
  const collection = client.db("hack4good").collection("store");
  const { id, name, price, img, quantity, dateAdded } = req.body;
  try {
    const item = await collection.updateOne({ _id: ObjectId.createFromHexString(id) }, { $set: { name, price, img, quantity, dateAdded } });
    return res.status(200).json({ message: `Item ${id} updated.` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});





const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening at port: ${port}`);

});