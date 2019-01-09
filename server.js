//dependencies
var express = require('express');
var bodyParser = require('body-parser');
var passport = require("passport");
var cors = require('cors');
const multer = require('multer');
const port = 3001;
const app = express();
var upload = multer({ dest: "./uploads/videos/" });
app.use(cors());
app.use(express.static('public'));

app.post("/api/video_upload", upload.array("filepond", 12), function(req, res, next) {
    // req.files is array of `videos` files
    console.log(req.files);
    // req.body will contain the text fields, if there were any
    console.log(req.body);
    res.send([req.files[0].filename]);
  });

app.listen(port, () => {
    console.log("if you see this its working")
})

app.get("/", (request, response) => {
    response.send("if you see this its working");
})