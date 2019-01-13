const multer = require("multer");
const storage = require("azure-storage");
const path = require("path");
const fs = require("fs");
var blobConnection = require("dotenv").config({ path: './models/.env' });
var blobService = storage.createBlobService();

const containerName = 'containerpublic';

//video upload functionality
exports.video_upload = (req, res, next) => {
    console.log(req.files);
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
}

//get a video from the archive functionality
exports.get_video = (req, res, next) => {
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
    res.send(obj);
}

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