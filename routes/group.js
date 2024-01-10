const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group');

router.get('/users', groupController.getUsers);
router.post('/create-group', groupController.createGroup);
router.get('/groups', groupController.getGroups);
router.delete('/groups/:groupId', groupController.deleteGroup);
router.get(`/users/:userId/`, groupController.getGroupsForUser);
router.get('/:groupId/users', groupController.getUsersInGroups);
router.get('/:groupId/users/:userId', groupController.isCurrentUserAdmin);
router.post('/:groupId/add-users', groupController.addNewsUserToGroup);
router.delete('/:groupId/remove-user/:userId', groupController.removeUserfromGroup);

module.exports = router;
