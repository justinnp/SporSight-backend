const express = require('express');
const multer = require("multer");
const router = express.Router();
const upload = multer({ dest: "./public/videos/" });
const VideosController = require('../controllers/videos');

router.post('/video_upload', upload.array("filepond", 12), VideosController.video_upload);
router.get('/video_archive/:videoName', VideosController.get_video)

module.exports = router;