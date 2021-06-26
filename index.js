const express = require('express')
const app = express()
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require("mongodb").ObjectId;
const fileUpload = require('express-fileupload');
const fs = require("fs-extra");
require('base-64');
const port = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ihxuz.mongodb.net/posts?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const postCollection = client.db("post").collection("postCollection");
    const admin = client.db("post").collection("admin");

    //sending blog to the database
    app.post('/addPost', (req, res) => {

        let title = req.body.title;
        let postBody = req.body.post;
        let query = req.body.query;
        let file = req.files.file;

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        let image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        }

        postCollection.insertOne({ title, postBody, image, query })
            .then((result) => {
                res.send(result.insertedCount > 0)
            })
    })

    // getting all blog post
    app.get("/posts", (req, res) => {
        postCollection.find({})
            .toArray((error, docs) => {
                res.send(docs)
            })
    })

    // load a single post
    app.get("/posts/:query", (req, res) => {
        postCollection.find({ query: req.params.query })
            .toArray((err, docs) => {
                res.send(docs[0]);
            })
    })
    
    // delete
    app.delete("/delete/:id", (req, res) => {
        postCollection.deleteOne({_id: ObjectId(req.params.id)})
            .then(doc => {
                res.send(doc.deletedCount > 0);
            })
    })

    // isAdmin
    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        admin.find({ email: email })
            .toArray((err, docs) => {
                res.send(docs);
            })
    })

});

app.get('/', (req, res) => {
  res.send('Welcome to the PH Travel!')
})

app.listen(process.env.PORT || port, () => {
  console.log(`we are running at port: ${port}`)
})
