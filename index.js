const express = require('express');
const cors = require('cors');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.du8ek.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//  console.log(uri)


async function run (){
    try{
        await client.connect();
        const database = client.db('baby_shop');
        const productsCollection = database.collection('products');
        const exploreProductsCollection = database.collection('exploreProducts');
        const usersCollection = database.collection('users');
        const orderCollection = database.collection('orders')
    

        // GET products API

        app.get('/exploreProducts', async (req, res) => {
            const cursor = exploreProductsCollection.find({});
            const exploreProducts = await cursor.toArray();
            res.send(exploreProducts)
        })

        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find().limit(6);
            const products = await cursor.toArray();
            res.send(products)
        })
        
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        // // add new order
        // app.post('/addOrder', async (req, res) => {
        //     const addOrder = req.body;
        //     const result = await orderCollection.insertOne(addOrder);
        //     res.json(result.insertedCount > 0)
        // })
        // // All Orders 
        // app.post('/allOrders', (req, res) => {
        //     const allOrders = orderCollection.find({});
        //     const result = allOrders.toArray(error, documents);
        //     res.json(result);
        // })
        // // individual orders
        // app.post('/orders', async (req, res) => {
        //     const email = req.body.email
        //     const orders = orderCollection.find({email: email})
        //     const result = await orders.toArray(error, documents)
        //     res.json(result)
        // })

       

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = {email: user.email};
            const updateDoc = {$set: {role: 'admin'}};
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);

        })


    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Baby toys Server is running');
})

app.listen(port, () => {
    console.log('Server is running at port', port);
})