const asyncHandler = require('../../utils/asyncHandler');
const ideaService = require('./idea.service');
const { sendSuccess } = require('../../utils/response');

const listIdeas = asyncHandler(async (req, res) => {
  const ideas = await ideaService.getAll(req, res);
  sendSuccess(res, ideas, 'Ideas retrieved successfully');
});

const getIdeaById = asyncHandler(async (req, res) => {
  const idea = await ideaService.getById(req.params.id);
  sendSuccess(res, idea, 'Idea retrieved successfully');
});

const createIdea = asyncHandler(async (req, res) => {
  const newIdea = await ideaService.createIdea(req.body, req.user?._id);
  sendSuccess(res, newIdea, 'Idea created successfully', 201);
});

const updateIdea = asyncHandler(async (req, res) => {
  const updatedIdea = await ideaService.updateIdea(req.params.id, req.body);
  sendSuccess(res, updatedIdea, 'Idea updated successfully');
});

const deleteIdea = asyncHandler(async (req, res) => {
  await ideaService.remove(req.params.id);
  sendSuccess(res, null, 'Idea deleted successfully', 204);
});

module.exports = { listIdeas, getIdeaById, createIdea, updateIdea, deleteIdea };

