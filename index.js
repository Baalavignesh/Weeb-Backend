const admin = require("firebase-admin");
var serviceAccount = require("./permission.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "weeb-store-b5e25.appspot.com",
});

const db = admin.firestore();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const firebase = require("firebase/app");
const app = express();
const stream = require("stream");
const { type } = require("os");

// Setting Body Parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// Setting up EJS
app.set("view engine", "ejs");

// Setting up CORS
app.use(bodyParser({ limit: "50mb" }), cors({ origin: true }));

// Routes
app.get("/", (req, res) => {
  return res.render("home");
  // return res.status(200).send('home page');
});

// GET - GET DATA OF SINGLE PRODUCT WITH ID - API

app.get("/api/product/:id", (req, res) => {
  (async () => {
    try {
      console.log("getting data");
      const document = db.collection("products").doc(req.params.id);
      let product = await document.get();
      let response = product.data();
      return res.status(200).send(response);
    } catch (error) {
      res.status(500).send(error);
    }
  })();
});

// GET - GET ALL DATA - API

app.get("/api/product", (req, res) => {
  (async () => {
    try {
      console.log("getting all data");
      let query = db.collection("products");
      let response = [];

      await query.get().then((querySnapshot) => {
        let docs = querySnapshot.docs;

        for (let doc of docs) {
          // console.log(doc);

          let product = {
            id: doc.id,
            name: doc.data().p_name,
            type: doc.data().p_type,
            description: doc.data().p_description,
            price: doc.data().p_price,
            anime: doc.data().p_anime,
            url: doc.data().p_image,
          };

          response.push(product);
        }
        return response;
      });
      return res.status(200).send(response);
      // res.render('all_products', {data: response});
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

// GET ALL DATA FOR UI

app.get("/api/allproduct", (req, res) => {
  (async () => {
    try {
      console.log("getting all data");
      let query = db.collection("products");
      let response = [];

      await query.get().then((querySnapshot) => {
        let docs = querySnapshot.docs;

        for (let doc of docs) {
          // console.log(doc);

          let product = {
            id: doc.id,
            name: doc.data().p_name,
            type: doc.data().p_type,
            description: doc.data().p_description,
            price: doc.data().p_price,
            anime: doc.data().p_anime,
            url: doc.data().p_image,
          };

          response.push(product);
        }
        return response;
      });
      // return res.status(200).send(response);
      res.render("all_products", { data: response });
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

// ***************************************************************************
// This is the Post API part
// ***************************************************************************

// GET AND POST - CREATE DATA

// To render the create screen
app.get("/api/create", (req, res) => {
  return res.render("add_product");
});

// This is the main function we are working on right now
app.post("/api/create", urlencodedParser, (req, res) => {
  (async () => {
    try {
      // We use req.body.name of the input tag in add_product.jsx input tags
      console.log(req.body.name);
      let image = req.body.imagebase;

      let imageUrl;

      let promise = new Promise(function (resolve, reject) {
        console.log("step 1 - uploading image");
        let bufferStream = new stream.PassThrough();
        bufferStream.end(new Buffer.from(image, "base64"));

        // Retrieve default storage bucket
        let bucket = admin.storage().bucket();

        // Unique File Name
        const fileName = new Date().valueOf();
        let file = bucket.file(fileName.toString());
        // Start a Stream and Upload the file
        bufferStream
          .pipe(
            file.createWriteStream({
              metadata: {
                contentType: "image/jpeg",
              },
            })
          )
          .on("error", (error) => {
            console.log("error in uploading picture");
            reject("error in uploading picture");
          })
          .on("finish", (done) => {
            // The file upload is complete.
            console.log(typeof file);
            console.log("Image successfully uploaded");

            try {
              console.log("trying");
              const config = {
                action: "read",
                expires: "03-01-2500",
              };
              console.log("getting url");

              file.getSignedUrl(config, function (error, url) {
                console.log("bruh");
                if (error) {
                  console.log("problem inside");
                  console.log(error);
                  reject(error);
                }
                console.log("download url ", url);
                imageUrl = url;
                resolve(url);
              });
            } catch (err) {
              console.log("error getting url");
              console.log(err);
            }
          });
      });

      (async function () {
        let received = await promise;
        console.log(typeof received);
        console.log(received);

        // This is uploadding the data to firebase, normal data. This is working fine

        try {
          // console.log('step 3 - uploading all data')

          const ref = db.collection("products").doc();
          let id = ref.id;
          console.log("create");
          await db.collection("products").doc(id).create({
            p_id: id,
            p_name: req.body.name,
            p_type: req.body.type,
            p_anime: req.body.anime,
            p_description: req.body.description,
            p_price: req.body.price,
            p_image: received,
          });
          res.render("home");
        } catch (err) {
          console.log("error updating data into firestore");
          console.log(err);
        }
      })();
    } catch (error) {
      console.log("error here");
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

// PUT - UPDATE DATA (IGNORE THIS)

app.put("/api/update/:id", (req, res) => {
  (async () => {
    try {
      console.log("updating data");
      const document = db.collection("products").doc(req.params.id);

      await document.update({
        p_name: req.body.name,
        p_type: req.body.type,
        p_description: req.body.description,
        p_price: req.body.price,
        p_anime: req.body.anime,
      });

      res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();

  return res.status(200).send("updating data");
});

// DELETE - DELETE DATA (IGNORE THIS)

app.delete("/api/delete/:id", (req, res) => {
  (async () => {
    try {
      console.log("deleting data");
      const document = db.collection("products").doc(req.params.id);

      await document.delete();
      res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();

  return res.status(200).send("deleting data");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening to port ${port}`));

// exports.app = functions.https.onRequest(app);
