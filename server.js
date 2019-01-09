const util = require("util");
const fs = require("fs");
const path = require("path");
const express = require("express");
const uniqueString = require("unique-string");
var cors = require("cors");
const readDir = util.promisify(fs.readdir);
var multer = require("multer");
var upload = multer({ dest: "../server/public/images/" });

async function getImageList(dir) {
  try {
    return await readDir(path.join(__dirname, "public", dir));
  } catch (error) {
    throw error;
  }
}

const app = express();

app.use(cors());

// Blob Storage
// var Connection = require('tedious').Connection;
// var Request = require('tedious').Request;
var blobConnection = require("dotenv").config({ path: "models/.env" });
var storage = require("azure-storage");
var blobService = storage.createBlobService();

/* This is the endpoint that handles the upload. FilePond expects a unique id returned
   so it can request an undo if needed. The filename prop works well for this. */
app.post("/api/video_upload", upload.array("filepond", 12), function(
  req,
  res,
  next
) {
  // req.files is array of `photos` files
  console.log(req.files);
  // req.body will contain the text fields, if there were any
  console.log(req.body);
  res.send([req.files[0].filename]);
  fileName = req.files[0].originalname;
  console.log("filename is : " + fileName);

  uploadFileToAzure(fileName, function(err) {
    if (err) {
      console.log("err");
    }
  });
});

// function to upload files to Azure Blob Storage
// deletes files once its been uploaded
function uploadFileToAzure(fileName) {
  var containerName = "containerpublic";
  var videoFilePath = path.resolve("./uploads/" + fileName);
  var videoFile = path.basename(videoFilePath, path.extname(videoFilePath));

  blobService.createContainerIfNotExists(
    containerName,
    { publicAccessLevel: "blob" },
    function(err) {
      if (err) {
        console.log(err);
      } else {
        blobService.createBlockBlobFromLocalFile(
          containerName,
          videoFile,
          videoFilePath,
          function(err) {
            if (err) {
              console.log("gets here");
              console.log(err);
            } else {
              console.log(`Upload of ${videoFile} complete`);
              // once videos are sent to blob, delete locally
              fs.unlink(videoFilePath, function(err) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(blobService);
                  console.log(fileName + " has been deleted");
                }
              });
            }
          }
        );
      }
    }
  );
}

app.use(express.static(path.join(__dirname, "public")));

app.listen(3001, () => console.log("Example app listening on port 3001!"));
