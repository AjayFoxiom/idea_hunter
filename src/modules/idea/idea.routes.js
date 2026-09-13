const express = require('express');
const ideaController = require('./idea.controller');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', ideaController.listIdeas);
router.get('/:id', ideaController.getIdeaById);
router.post('/', ideaController.createIdea);
router.patch('/:id', ideaController.updateIdea);
router.patch('/:id/status', ideaController.updateIdea);
router.delete('/:id', ideaController.deleteIdea);

module.exports = router;
