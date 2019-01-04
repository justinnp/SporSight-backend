const express = require('express');
const bodyParser = require('body-parser');
const port = 3001;

const app = express();

app.listen(port, () => {
    console.log("if you see this its working")
})

app.get("/", (request, response) => {
    response.send("if you see this its working");
})