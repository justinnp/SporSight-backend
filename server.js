//dependencies
var express = require('express');
var bodyParser = require('body-parser');
var passport = require("passport");
var cors = require('cors');
const multer = require('multer');
//globals
const port = 3001;
const app = express();
app.use(cors());
// app.use(bodyParser.urlencoded({extended: true}))

// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'uploads')
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.fieldname + '-' + Date.now())
//     }
// })

// var upload = multer({storage: storage})


app.post('/upload', (req, res, next) => {
    let uploadFile = req.files.file
    const fileName = req.files.file.name
    uploadFile.mv(
        `${__dirname}/public/files/${fileName}`,
        function (err) {
            if (err) {
                return res.status(500).send(err)
            }
            res.json({
                file: `public/${req.files.file.name}`,
            })
        }
    )
})

app.listen(port, () => {
    console.log("if you see this its working")
})

app.get("/", (request, response) => {
    response.send("if you see this its working");
})