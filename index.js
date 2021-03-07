const functions = require("firebase-functions");
const admin = require("firebase-admin");

var serviceAccount = require("./permission.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const express = require("express");
const app = express()

const cors = require('cors');
app.use( cors( { origin:true } ))


// Routes
app.get('/', (req, res) => {
    return res.status(200).send('home page');
})

app.get('/hello', (req, res) => {
    return res.status(200).send('working');
})



// POST - CREATE DATA
app.post('/api/create', (req, res) => {

    (async () => {
        try {
            const ref = db.collection("products").doc();
            let id = ref.id;
            console.log(id);
            console.log('create');
            await db.collection('products').doc(id).create({
                p_id: id,
                p_name: req.body.name,
                p_type: req.body.type,
                p_anime: req.body.anime,
                p_description: req.body.description,
                p_price: req.body.price
            })
        }
        catch(error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();


    return res.status(200).send('posting data');
})

// GET - GET DATA


app.get('/api/product/:id', (req, res) => {
    (async () => {
        try {
            console.log('getting data')
            const document = db.collection("products").doc(req.params.id);
            let product = await document.get();
            let response = product.data();
            return res.status(200).send(response);
        }


        catch(error) {
            res.status(500).send(error);
        }
    })();
})

// GET - GET ALL DATA


app.get('/api/product', (req, res) => {
    (async () => {
        try {
            console.log('getting all data')
            let query = db.collection("products");
            let response = [];

            await query.get().then(querySnapshot => {
                let docs = querySnapshot.docs;

                for (let doc of docs) {
                    console.log(doc);

                    let product = {
                        "id" : doc.id,
                        "name" :doc.data().p_name,
                        "type" : doc.data().p_type,
                        "description" : doc.data().p_description,
                        "price" : doc.data().p_price,
                        "anime" : doc.data().p_anime,
                    }

                    response.push(product);
                }
                return response;
            });
            return res.status(200).send(response);
        }


        catch(error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
})


// PUT - UPDATE DATA


app.put('/api/update/:id', (req, res) => {

    (async () => {
        try {
            console.log('updating data');
            const document = db.collection('products').doc(req.params.id);

            await document.update({
                "p_name": req.body.name,
                "p_type": req.body.type,
                "p_description": req.body.description,
                "p_price": req.body.price,
                "p_anime": req.body.anime
            });

            res.status(200).send();

        }
        catch(error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();


    return res.status(200).send('updating data');
})


// DELETE - DELETE DATA


app.delete('/api/delete/:id', (req, res) => {

    (async () => {
        try {
            console.log('deleting data');
            const document = db.collection('products').doc(req.params.id);

            await document.delete();
            res.status(200).send();

        }
        catch(error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();


    return res.status(200).send('deleting data');
})


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening to port ${port}`))

// exports.app = functions.https.onRequest(app);