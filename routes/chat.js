const express = require('express');
const multer = require('multer');
const router = express.Router();

const chatController = require('../controllers/chat');
const authenticatemiddleware = require('../middleware/auth');

const storage = multer.memoryStorage();

const upload = multer({storage: storage});

// router.post('/sendMessage', authenticatemiddleware.authenticate, upload.single('file'), chatController.sendMessage)
router.get('/getMessages', authenticatemiddleware.authenticate, chatController.getMessages)
router.get('/getUsers', authenticatemiddleware.authenticate, chatController.getUsers)
router.get('/messages/:id', authenticatemiddleware.authenticate, chatController.getGroupMessages)
router.get('/groups/:id/getUsers', authenticatemiddleware.authenticate, chatController.getUsers)

module.exports = router;