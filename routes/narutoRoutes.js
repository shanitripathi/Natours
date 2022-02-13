const express = require('express');
const narutoController = require('../controllers/narutoController');

const router = express.Router();

router
  .route('/')
  .get(narutoController.getShinobis)
  .post(narutoController.createShinobi);

router
  .route('/:id')
  .patch(narutoController.updateShinobi)
  .get(narutoController.getShinobi)
  .delete(narutoController.deleteShinobi);

module.exports = router;
