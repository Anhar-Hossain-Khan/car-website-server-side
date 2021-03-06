const express = require('express');
const { MongoClient } = require('mongodb');
const objectId = require("mongodb").ObjectId;
const cors = require('cors');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ultz5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const database = client.db("carDb");
      const productsCollection = database.collection("products");
      const userCollections = database.collection("user");
      const ordersCollections = database.collection("orders");
      const reviewCollections = database.collection("review");
        
      // GET API 
      app.get('/products', async(req, res) =>{
        const cursor = productsCollection.find({});
        const products = await cursor.toArray();
        res.send(products);
    })

   // DELETE ORDER API
  app.delete("/product/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: objectId(id) };
  const resultOrder = await productsCollection.deleteOne(query);
  console.log("deleting user with id", resultOrder);
  res.json(resultOrder);
   });

  //  GET ALL ORDER API
   app.get("/order", async (req, res) => {
  const cursorOrder = ordersCollections.find({});
  const orders = await cursorOrder.toArray();
  res.json(orders);
  });

  // GET SINGLE ORDER
  app.get("/order/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: objectId(id) };
  const order = await ordersCollections.findOne(query);
  console.log("load user with id:", id);
  res.send(order);
  });

       // POST API
       app.post('/products', async(req, res) =>{
        const product = req.body;
        console.log('hit the post api', product);
        const result = await productsCollection.insertOne(product);
        console.log(result);
       res.json(result);
      })

      // CREATE REVIEW INSERT TO DATABASE
    app.post("/review", async function (req, res) {
      const newReview = req.body;
      const result = await reviewCollections.insertOne(newReview);
      console.log("got new review", req.body);
      console.log("added review", result);
      res.send(result);
    });

    app.get("/review", async (req, res) => {
      const cursorReview = reviewCollections.find({});
      const reviews = await cursorReview.toArray();
      res.json(reviews);
    });

    // CREATE ORDER TO INSERT DB
    app.post("/order", async function (req, res) {
      const newOrder = req.body;
      const resultOrder = await ordersCollections.insertOne(newOrder);
      console.log("got new Order", req.body);
      console.log("added Order", resultOrder);
      res.send(resultOrder);
    });

    // CREATE USER
    app.post("/user", async function (req, res) {
      const newUser = req.body;
      const result = await userCollections.insertOne(newUser);
      console.log("got new User", req.body);
      console.log("added User", result);
      res.send(result);
    });

     app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollections.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    app.put("/user", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollections.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.put("/user/admin", async (req, res) => {
      const user = req.body;

      const filter = { email: user.email };
      console.log(filter);
      const updateDoc = { $set: { role: "admin" } };
      const result = await userCollections.updateOne(filter, updateDoc);
      console.log(result);
      console.log("got new User", updateDoc);
      res.json(result);
    });

    // DELETE ORDER
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: objectId(id) };
      const resultOrder = await ordersCollections.deleteOne(query);
      console.log("deleting user with id", resultOrder);
      res.json(resultOrder);
    });

    //UPDATE API
    app.put("/order/:id", async (req, res) => {
      const id = req.params.id;
      const updatedOrder = req.body;
      const filter = { _id: objectId(id) };
      const options = { upsert: true };
      console.log(updatedOrder);
      const updateDoc = {
        $set: {
          status: updatedOrder.status,
        },
      };
      const resultOrder = await ordersCollections.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log("updating", id);
      res.json(resultOrder);
    });

    }
    finally {
     // await client.close();
    }
  }
  run().catch(console.dir);

app.get('/', (req, res)=>{
    res.send('Running my CAR Server')
});

app.listen(port, () => {
    console.log('Running Server on port', port);
})