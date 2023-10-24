const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://pharma-buddy:vtKKAzCpuSAKs5n2@cluster0.po7qsgl.mongodb.net/pharma-buddy?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    const medicineCollection = client.db("pharma-buddy").collection("medicine");
    const adminCollection = client.db("pharma-buddy").collection("admin");
    const userCollection = client.db("pharma-buddy").collection("user");
    const customerCollection = client.db("pharma-buddy").collection("customer");
    const feedbackCollection = client.db("pharma-buddy").collection("feedback");

    // medicine post
    app.post("/medicine", async (req, res) => {
      const medicine = req.body;
      const result = await medicineCollection.insertOne(medicine);
      if (result.insertedCount === 1) {
        res.status(201).json({ message: "medicine added successfully" });
      } else {
        res.status(500).json({ message: "Failed to add medicine" });
      }
    });
    // admin post
    app.post("/admin", async (req, res) => {
      const admin = req.body;
      const result = await adminCollection.insertOne(admin);
      if (result.insertedCount === 1) {
        res.status(201).json({ message: "Admin added successfully" });
      } else {
        res.status(500).json({ message: "Failed to add admin" });
      }
    });

    // user post
    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      if (result.insertedCount === 1) {
        res.status(201).json({ message: "User added successfully" });
      } else {
        res.status(500).json({ message: "Failed to add user" });
      }
    });

    //customer post
    app.post("/customer", async (req, res) => {
      const customer = req.body;
      const result = await customerCollection.insertOne(customer);
      if (result.insertedCount === 1) {
        res.send(result);
        res.status(201).json({ message: "Customer added successfully" });
      } else {
        res.status(500).json({ message: "Failed to add customer" });
      }
    });

    //feedback post
    app.post("/feedback", async (req, res) => {
      const feedback = req.body;
      const result = await feedbackCollection.insertOne(feedback);
      if (result.insertedCount === 1) {
        res.send(result);
        res.status(201).json({ message: "feedback added successfully" });
      } else {
        res.status(500).json({ message: "Failed to add feedback" });
      }
    });

    //medicine get
    app.get("/medicine", async (req, res) => {
      const query = {};
      const cursor = medicineCollection.find(query);
      const medicines = await cursor.toArray();
      res.send(medicines);
    });

    //feedback get
    app.get("/feedback", async (req, res) => {
      const query = {};
      const cursor = feedbackCollection.find(query);
      const feedbacks = await cursor.toArray();
      res.send(feedbacks);
    });

    //admin get
    app.get("/admin", async (req, res) => {
      const query = {};
      const cursor = adminCollection.find(query);
      const admins = await cursor.toArray();
      res.send(admins);
    });

    //user get
    app.get("/user", async (req, res) => {
      const query = {};
      const cursor = userCollection.find(query);
      const users = await cursor.toArray();
      res.send(users);
    });

    //customer get
    app.get("/customer", async (req, res) => {
      const query = {};
      const cursor = customerCollection.find(query);
      const customers = await cursor.toArray();
      res.send(customers);
    });
  } finally {
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`server running on ${port}`);
});
