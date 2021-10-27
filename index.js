const express = require("express");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 5000;

require('dotenv').config()

app.use(cors());
app.use(express.json());

const { MongoClient } = require("mongodb");
const uri =
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.amu9y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function run() {
    try {
        await client.connect();
        const database = client.db("manageProducts");
        const productsCollections = database.collection("products");

        //  GET API
        app.get("/products", async (req, res) => {
            const cursor = productsCollections.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollections.findOne(query);
            console.log("updating products", result);
            res.json(result);
        });

        // POST API
        app.post("/products", async (req, res) => {
            const newProduct = req.body;
            const result = await productsCollections.insertOne(newProduct);
            console.log(
                `A document was inserted with the _id: ${result.insertedId}`
            );
            res.json(result);
        });

        // UPDATE API
        app.put("/products/:id", async (req, res) => {
            const id = req.params.id;
            const updateProduct = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updateProduct.name,
                    price: updateProduct.price,
                    quantity: updateProduct.quantity,
                },
            };
            const result = await productsCollections.updateOne(filter, updateDoc, options);
            console.log("updated product", req.body);
            res.json(result);
        });

        // DELETE API
        app.delete("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollections.deleteOne(query);
            console.log("deleting products", result);
            res.json(result);
        });
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("This is my second project with project management system");
});

app.listen(port, () => {
    console.log("Listing to port", port);
});


