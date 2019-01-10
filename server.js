const util = require("util");
const fs = require("fs");
const path = require("path");
const express = require("express");
const uniqueString = require("unique-string");
var cors = require("cors");
const readDir = util.promisify(fs.readdir);
var multer = require("multer");
var upload = multer({ dest: "../server/public/images/" });
const app = express();

//globals
const containerName = 'containerpublic';

app.use(cors());

// Blob Storage
// var Connection = require('tedious').Connection;
// var Request = require('tedious').Request;
var blobConnection = require("dotenv").config({ path: "models/.env" });
var storage = require("azure-storage");
var blobService = storage.createBlobService();

/* This is the endpoint that handles the upload. FilePond expects a unique id returned
   so it can request an undo if needed. The filename prop works well for this. */
app.post("/api/video_upload", upload.array("filepond", 12), function(req, res, next) {
  // req.files is array of `photos` files
  console.log(req.files);
  // req.body will contain the text fields, if there were any
  console.log(req.body);
  res.send([req.files[0].filename]);
  var files = [];

  var fileKeys = Object.keys(req.files);

  fileKeys.forEach(function(key) {
    fileName = req.files[key].originalname;
    filePath = req.files[key].path;
    console.log("filename is : " + req.files[key].originalname);

    uploadFileToAzure(fileName, filePath, function(err) {
      if (err) {
        console.log("err");
      }
    });
  });
});

//video download
app.get('/api/video_archive/:videoName', (req, res, next) => {
  var fileName = req.params.videoName
  var startDate = new Date();
  var expiryDate = new Date(startDate);
  expiryDate.setMinutes(startDate.getMinutes() + 100);
  startDate.setMinutes(startDate.getMinutes() - 100);
  var sharedAccessPolicy = {
    AccessPolicy: {
      Permissions: storage.BlobUtilities.SharedAccessPermissions.READ,
      Start: startDate,
      Expiry: expiryDate
    }
  };
  var token = blobService.generateSharedAccessSignature(
    containerName,
    fileName,
    sharedAccessPolicy
  );
  var sasUrl = blobService.getUrl(containerName, fileName, token);
  var obj = { sasUrl: sasUrl }
  res.send(obj)
})

async function downloadBlob(containerName, blobName) {
  const dowloadFilePath = path.resolve('./' + blobName.replace('.txt', '.downloaded.txt'));
  return new Promise((resolve, reject) => {
      blobService.getBlobToText(containerName, blobName, (err, data) => {
          if (err) {
              reject(err);
          } else {
              resolve({ message: `Blob downloaded "${data}"`, text: data });
          }
      });
  });
};

// function to upload files to Azure Blob Storage
// deletes files once its been uploaded
function uploadFileToAzure(fileName, filePath) {
  var videoFilePath = filePath;
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

app.listen(3001, () => console.log("Listening on port 3001!"));
