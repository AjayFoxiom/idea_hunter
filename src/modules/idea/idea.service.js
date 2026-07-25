const ideaRepository = require('./idea.repository');
const { AppError } = require('../../middleware/errorHandler');

async function saveNewIdeas(candidates, userId) {
  if (!candidates.length) return [];

  const docs = candidates.map((c) => ({ ...c, createdBy: userId || null }));
  return ideaRepository.insertManyIdeas(docs);
}

async function createIdea(data, userId) {
  const doc = { ...data, createdBy: userId || null };
  return ideaRepository.createIdea(doc);
}

async function getAll(req, res) {
  return ideaRepository.findIdeas(req, res);
}

async function updateStage(id, updates) {
  const idea = await ideaRepository.updateIdeaById(id, updates);
  if (!idea) throw new AppError(404, 'Idea not found');
  return idea;
}

async function remove(id) {
  const idea = await ideaRepository.deleteIdeaById(id);
  if (!idea) throw new AppError(404, 'Idea not found');
}

module.exports = { saveNewIdeas, createIdea, getAll, updateStage, remove };
