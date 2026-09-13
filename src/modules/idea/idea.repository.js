const Idea = require('./idea.model');
const fetchData = require('../../utils/fetchData');

async function insertManyIdeas(docs) {
  try {
    return await Idea.insertMany(docs, { ordered: false });
  } catch (err) {
    if (err.code === 11000 || err.writeErrors) {
      return err.insertedDocs || [];
    }
    throw err;
  }
}

async function findIdeas(req, res) {
  const condition = { isDeleted: false };

  // Filterable fields added in the updated model
  if (req.query.status)          condition.status          = req.query.status;
  if (req.query.category)        condition.category        = req.query.category;
  if (req.query.source_platform) condition.source_platform = req.query.source_platform;
  if (req.query.priority)        condition.priority        = req.query.priority;

  return fetchData(req, res, Idea, { condition, sort: { createdAt: -1 } });
}

async function updateIdeaById(id, updates) {
  const idea = await Idea.findById(id);
  if (!idea) return null;

  Object.assign(idea, updates);
  return idea.save(); // triggers pre-save hook → status_history is updated automatically
}

async function deleteIdeaById(id) {
  // Soft-delete: preserves the document for audit / status_history
  return Idea.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
}

async function createIdea(data) {
  return Idea.create(data);
}

async function findIdeaById(id) {
  return Idea.findOne({ _id: id, isDeleted: false });
}

module.exports = {
  createIdea,
  insertManyIdeas,
  findIdeas,
  findIdeaById,
  updateIdeaById,
  deleteIdeaById,
};


