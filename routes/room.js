const express = require('express');
const router = express.Router();

const roomController = require('../controllers/roomController');

router.get('/', roomController.getAllRoomNumbers);

router.get('/:id', roomController.getRoomId);

module.exports = router;