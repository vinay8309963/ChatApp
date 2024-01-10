const express = require('express');

const router = express.Router();

const chatController = require('../controllers/chat');
const authenticatemiddleware = require('../middleware/auth');

router.post('/sendMessage', authenticatemiddleware.authenticate , chatController.sendMessage)
router.get('/getMessages', authenticatemiddleware.authenticate, chatController.getMessages)
router.get('/getUsers', authenticatemiddleware.authenticate, chatController.getUsers)
router.get('/messages/:id', authenticatemiddleware.authenticate, chatController.getGroupMessages)
router.get('/groups/:id/getUsers', authenticatemiddleware.authenticate, chatController.getUsers)

module.exports = router;