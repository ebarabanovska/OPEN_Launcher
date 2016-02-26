var express = require("express");
var multer = require("multer");
var path = require('path');
var bodyParser = require('body-parser');

var low = require('lowdb');
var lowdbStorage = require('lowdb/file-async');

var app = express();

var fileStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, path.join(__dirname, '/app/assets/images'));
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + '.jpg');
    }
});

var db = low(path.join(__dirname, '/app/assets/db.json'), { storage: lowdbStorage });
var upload = multer({ storage: fileStorage }).single('userPhoto');

app.use(bodyParser.json());                         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
app.use(express.static(path.join(__dirname, '/')));

// == API ============================================================================
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

// Upload profile picture
app.post('/api/upload', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });
});

// Get all users defined in json lowdb file
app.get('/getAllUsers/:name?', function (req, res) {
    if (req.params.name != undefined) {
        res.send(db('users').find({ name: req.params.name }));
    } else {
        res.send(db('users').value());
    }
});

//
app.get('/getAvailableImages', function (req, res) {
   
        res.send(db('images').filter({availability: true}));
    
});

// Add new user in the json lowdb file
app.post('/addUser', function (req, res) {
    db('users').push(req.body)
               .then(post => res.send(post));
});

// Delete user from json lowdb file
app.get('/deleteUser/:name', function (req, res) {
    db('users').remove({ name: req.params.name });
    res.send(db('users').value());
});

// == API ============================================================================

app.listen(3000, function () {
    console.log("Working on port 3000");
});