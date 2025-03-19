const PlatformModel = require("../models/platform_model");

const create = async (details) => {
  const newPlatformDetails = await PlatformModel(details);
  const savedDetails = await newPlatformDetails.save();
  return savedDetails;
};

const getById = async (id) => {
  const platform = await PlatformModel.findById(id);
  return platform;
};

const findPlatformName = async (platform_name) => {
  const details = await PlatformModel.findOne({ platform_name });
  return details;
};

const getAllList = async () => {
  const details = await PlatformModel.find({});
  return details;
};

const paginatedList = async (details) => {
  const { limit, skip } = details;
  const detailsList = await PlatformModel.find({}).limit(limit).skip(skip).sort({ createdAt: -1 });
  return detailsList;
};

const update = async (id, details) => {
  const { platform_name, platform_url, is_multi_login, max_request, updated_by } = details;
  const platform = await PlatformModel.findByIdAndUpdate(id);
  platform.platform_name = platform_name || platform.platform_name;
  platform.platform_url = platform_url || platform.platform_url;
  platform.updated_by = updated_by || platform.updated_by;
  platform.is_multi_login = is_multi_login;
  platform.max_request = max_request || platform.max_request;
  await platform.save();
  return platform;
};

const softDelete = async (id, details) => {
  const { is_deleted, updated_by } = details;
  const platform = await PlatformModel.findByIdAndUpdate(id);

  platform.is_deleted = is_deleted;
  platform.updated_by = updated_by || platform.updated_by;

  await platform.save();
  return platform;
};

const lockPlatform = async (id, details) => {
  const { is_locked, updated_by } = details;
  const platform = await PlatformModel.findByIdAndUpdate(id);

  platform.is_locked = is_locked;
  platform.updated_by = updated_by || platform.updated_by;

  await platform.save();
  return platform;
};

module.exports = {
  create,
  getById,
  getAllList,
  paginatedList,
  update,
  softDelete,
  lockPlatform,
  findPlatformName,
};
