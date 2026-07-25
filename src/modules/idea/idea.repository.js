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
  const condition = { isDeleted: false }
  if (req.query.stage) {
    condition.stage = req.query.stage
  }
  return fetchData(req, res, Idea, { condition, sort: { createdAt: -1 } });
}

async function updateIdeaById(id, updates) {
  return Idea.findByIdAndUpdate(id, updates, { new: true });
}

async function deleteIdeaById(id) {
  return Idea.findByIdAndDelete(id);
}

async function createIdea(data) {
  return Idea.create(data);
}

module.exports = {
  createIdea,
  insertManyIdeas,
  findIdeas,
  updateIdeaById,
  deleteIdeaById,
};
