var express = require('express');
var bodyParser = require('body-parser');
var passport = require("passport");
const port = 3001;

const app = express();

app.listen(port, () => {
    console.log("if you see this its working")
})

app.get("/", (request, response) => {
    response.send("if you see this its working");
})