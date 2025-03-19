const AgentModel = require("../models/agent_model");

const create = async (details) => {
  const newAgentDetails = await AgentModel(details);
  const savedDetails = await newAgentDetails.save();
  return savedDetails;
};

const getById = async (id) => {
  const agent = await AgentModel.findById(id).populate("platform_id");
  return agent;
};

const getByFilter = async (filter) => {
  const agent = await AgentModel.findOne(filter);
  return agent;
};

const findAgentName = async (agent_name) => {
  const details = await AgentModel.findOne({ agent_name });
  return details;
};

const getAllList = async () => {
  const details = await AgentModel.find({}).populate("platform_id");
  return details;
};

const paginatedList = async (details) => {
  const { limit, skip } = details;
  const detailsList = await AgentModel.find({}).populate("platform_id").limit(limit).skip(skip).sort({ createdAt: -1 });
  return detailsList;
};

const update = async (id, details) => {
  const { agent_name, platform_id, office_id, updated_by } = details;
  const agent = await AgentModel.findByIdAndUpdate(id);
  agent.agent_name = agent_name || agent.agent_name;
  agent.platform_id = platform_id || agent.platform_id;
  agent.office_id = office_id || agent.office_id;
  agent.updated_by = updated_by || agent.updated_by;
  await agent.save();
  return agent;
};

const softDelete = async (id, details) => {
  const { is_deleted, updated_by } = details;
  const agent = await AgentModel.findByIdAndUpdate(id);

  agent.is_deleted = is_deleted;
  agent.updated_by = updated_by || agent.updated_by;

  await agent.save();
  return agent;
};

const lockAgent = async (id, details) => {
  const { is_locked, updated_by } = details;
  const agent = await AgentModel.findByIdAndUpdate(id);

  agent.is_locked = is_locked;
  agent.updated_by = updated_by || agent.updated_by;

  await agent.save();
  return agent;
};

const lock = async (id, is_locked) => {
  const agent = await AgentModel.findByIdAndUpdate(id);
  agent.is_locked = is_locked;
  await agent.save();
  return agent;
};

module.exports = {
  create,
  getById,
  getByFilter,
  getAllList,
  paginatedList,
  update,
  softDelete,
  lockAgent,
  findAgentName,
  lock,
};
