const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
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
    const addMedicineCollection = client
      .db("pharma-buddy")
      .collection("pharmacyMedicine");
    const adminCollection = client.db("pharma-buddy").collection("admin");
    const pharmacyCollection = client.db("pharma-buddy").collection("pharmacy");
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
    
    // add medicine pharmacy post
    app.post("/addMedicine", async (req, res) => {
      const medicine = req.body;
      const result = await addMedicineCollection.insertOne(medicine);
      if (result.insertedCount === 1) {
        res.status(201).json({ message: "medicine added successfully" });
      } else {
        res.status(500).json({ message: "Failed to add medicine" });
      }
    });
    //...

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
    // pharmacy post
    app.post("/pharmacySignup", async (req, res) => {
      const pharmacy = req.body;
      const result = await pharmacyCollection.insertOne(pharmacy);
      if (result.insertedCount === 1) {
        res.status(201).json({ message: "pharmacy added successfully" });
      } else {
        res.status(500).json({ message: "Failed to add pharmacy" });
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

    // Update an existing user profile
    app.put("/updateUser/:id", async (req, res) => {
      try {
        const userId = req.params.id;
        const updatedUserData = req.body;

        const session = client.startSession();
        session.startTransaction();

        try {
          // Update user information
          const result = await customerCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: updatedUserData },
            { session }
          );

          if (result.modifiedCount === 1) {
            await session.commitTransaction();
            session.endSession();
            res.json({ message: "User profile updated successfully" });
          } else {
            await session.abortTransaction();
            session.endSession();
            res.status(404).json({ message: "User not found" });
          }
        } catch (error) {
          await session.abortTransaction();
          session.endSession();
          console.error(error);
          res.status(500).json({ message: "Internal server error" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
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

    // Add this route to your Express app
    app.get("/pharmacies", async (req, res) => {
      const query = {};
      const cursor = pharmacyCollection.find(query);
      const pharmacies = await cursor.toArray();
      res.send(pharmacies);
    });

    //medicine get
    app.get("/medicine", async (req, res) => {
      const query = {};
      const cursor = medicineCollection.find(query);
      const medicines = await cursor.toArray();
      res.send(medicines);
    });

    // individual medicine get
    app.get("/searchMedicinesInPharmacy/:email", async (req, res) => {
      try {
        const { email } = req.params;
        const { query } = req.query;

        // Create a filter to search for medicines in the specified pharmacy
        const filter = {
          userInfo: email, // Filter by the pharmacy owner's email
          title: { $regex: new RegExp(query, "i") }, // Case-insensitive search
        };

        const cursor = addMedicineCollection.find(filter);
        const medicines = await cursor.toArray();
        res.send(medicines);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // Delete a booking by ID
    app.delete("/addMedicine/:id", async (req, res) => {
      try {
        const bookingId = req.params.id;
        console.log("Deleting booking with ID:", bookingId);

        const objectId = new ObjectId(bookingId);
        const result = await addMedicineCollection.deleteOne({ _id: objectId });

        console.log("Delete result:", result);

        if (result.deletedCount === 1) {
          res.json({ message: "Booking deleted successfully" });
        } else {
          res.status(404).json({ message: "Booking not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    //pharmacySignup get
    app.get("/pharmacySignup", async (req, res) => {
      const query = {};
      const cursor = pharmacyCollection.find(query);
      const medicines = await cursor.toArray();
      res.send(medicines);
    });

    //individual medicine get
    app.get("/searchMedicinesInPharmacy/:email", async (req, res) => {
      const { email } = req.params;
      const { query } = req.query;

      // Create a filter to search for medicines in the specified pharmacy
      const filter = {
        userInfo: email, // Filter by the pharmacy owner's email
        title: { $regex: new RegExp(query, "i") }, // Case-insensitive search
      };

      const cursor = addMedicineCollection.find(filter);
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

    //add medicine pharmacy end get
    app.get("/addMedicine", async (req, res) => {
      const query = {};
      const cursor = addMedicineCollection.find(query);
      const addMedicine = await cursor.toArray();
      res.send(addMedicine);
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
