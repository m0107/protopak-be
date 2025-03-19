const OperationsQueueModel = require("../models/operations_queue");

const createOperation = async (details) => {
  const newOperation = await OperationsQueueModel(details);
  const savedOperation = await newOperation.save();
  return savedOperation;
};

const createManyOperation = async (details) => {
  const newOperations = await OperationsQueueModel.insertMany(details, { ordered: false });
  // const saveOperations = await newOperations.save();
  return newOperations;
};

const deleteOperationByTransactionId = async (id) => {
  // console.log(id);
  const operationDelete = await OperationsQueueModel.findOneAndDelete({ transactionId: id });
  // console.log(operationDelete);
  return operationDelete;
};

const deleteOperation = async (id) => {
  const deleted = await OperationsQueueModel.findByIdAndDelete(id);
  return deleted;
};

const deleteMultipleOperation = async (details) => {
  const { agent_name, platform } = details;
  const deleted = await OperationsQueueModel.deleteMany({
    agentName: { $in: [agent_name] },
    platform: { $in: [platform] },
    status: "pending",
  });
  return deleted;
};

const updateOperation = async (id, details) => {
  const {
    office,
    transactionId,
    platform,
    admin_username, // agent username - office-1
    admin_password,
    status,
    message,
    operation_type,
    user_username,
    deposit_remark,
    deposit_amount,
  } = details;
  const operation = await OperationsQueueModel.findByIdAndUpdate(id);
  operation.office = office || operation.office;
  operation.transactionId = transactionId || operation.transactionId;
  operation.platform = platform || operation.platform;
  operation.admin_username = admin_username || operation.admin_username;
  operation.admin_password = admin_password || operation.admin_password;
  operation.status = status || operation.status;
  operation.message = message || operation.message;
  operation.operation_type = operation_type || operation.operation_type;
  operation.operation_data.user_username = user_username || operation.operation_data.user_username;
  operation.operation_data.deposit_remark = deposit_remark || operation.operation_data.deposit_remark;
  operation.operation_data.deposit_amount = deposit_amount || operation.operation_data.deposit_amount;

  await operation.save();
  return operation;
};

const operationByid = async (id) => {
  const operation = await OperationsQueueModel.findById(id);
  return operation;
};

const allOperations = async () => {
  const operations = await OperationsQueueModel.find({});
  return operations;
};

const operations = async (details) => {
  const { limit, skip } = details;
  const operationList = await OperationsQueueModel.find({}).limit(limit).skip(skip).sort({ createdAt: -1 });
  return operationList;
};

const updateOperationStatusById = async (transactionId, status, updatedBy) => {
  const operation = await OperationsQueueModel.findOneAndUpdate({ transactionId });
  operation.status = status || operation.status;
  operation.updated_by = updatedBy || operation.updated_by;
  await operation.save();
  return operation;
};

const getPendingOperationsList = async () => {
  const operationList = await OperationsQueueModel.find({ status: "PENDING" }, "_id");
  return operationList;
};

const getOperationListByArrayOfTransactionIds = async (transactionIds) => {
  const operationLists = await OperationsQueueModel.find(
    { transactionId: { $in: transactionIds } },
    "transactionId status"
  );
  return operationLists;
};

module.exports = {
  createOperation,
  deleteOperationByTransactionId,
  deleteOperation,
  deleteMultipleOperation,
  updateOperation,
  operationByid,
  operations,
  allOperations,
  createManyOperation,
  updateOperationStatusById,
  getPendingOperationsList,
  getOperationListByArrayOfTransactionIds,
};
