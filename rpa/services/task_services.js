const OperationsQueueModel = require("../models/operations_queue");

const createTask = async (details) => {
  const newTask = await OperationsQueueModel(details);
  const savedTask = await newTask.save();
  return savedTask;
};

const createManyTask = async (details) => {
  const insertedTask = [];

  for (let i = 0; i < details.length; i += 1) {
    const taskExists = await OperationsQueueModel.findOne({ transactionId: details[i].transactionId });
    if (!taskExists) {
      // save task in db
      const newTasks = await OperationsQueueModel(details[i]);
      const saveTasks = await newTasks.save();
      insertedTask.push(saveTasks);
    }
  }
  // const newTasks = await OperationsQueueModel.insertMany(details, { ordered: false });
  // const saveTasks = await newTasks.save();
  return insertedTask;
  // return newTasks;
};

const deleteTaskByTransactionId = async (id) => {
  // console.log(id);
  const taskDelete = await OperationsQueueModel.findOneAndDelete({ transaction_id: id });
  // console.log(taskDelete);
  return taskDelete;
};

const deleteTask = async (id) => {
  const deleted = await OperationsQueueModel.findByIdAndDelete(id);
  return deleted;
};

const deleteMultipleTask = async (details) => {
  // console.log(details);
  const { office, agent_name, platform } = details;
  const deleted = await OperationsQueueModel.deleteMany({
    office: { $in: [office] },
    agentName: { $in: [agent_name] },
    platform: { $in: [platform] },
    status: "pending",
  });
  // console.log(deleted);
  return deleted;
};

const updateTask = async (id, details) => {
  const {
    office,
    transaction_id,
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
  const task = await OperationsQueueModel.findByIdAndUpdate(id);
  task.office = office || task.office;
  task.transaction_id = transaction_id || task.transaction_id;
  task.platform = platform || task.platform;
  task.admin_username = admin_username || task.admin_username;
  task.admin_password = admin_password || task.admin_password;
  task.status = status || task.status;
  task.message = message || task.message;
  task.operation_type = operation_type || task.operation_type;
  task.operation_data.user_username = user_username || task.operation_data.user_username;
  task.operation_data.deposit_remark = deposit_remark || task.operation_data.deposit_remark;
  task.operation_data.deposit_amount = deposit_amount || task.operation_data.deposit_amount;

  await task.save();
  return task;
};

const taskByid = async (id) => {
  const task = await OperationsQueueModel.findById(id);
  return task;
};

const allTasks = async () => {
  const tasks = await OperationsQueueModel.find({});
  return tasks;
};

const allTasksCount = async (filter = {}) => {
  const tasks = await OperationsQueueModel.countDocuments(filter);
  return tasks;
};

const tasks = async (details) => {
  const { limit, skip, filter } = details;
  // console.log('filter reformat', filter);
  const taskList = await OperationsQueueModel.find(filter).limit(limit).skip(skip).sort({ createdAt: -1 });

  return taskList;
};

const updateTaskStatusById = async (transactionId, status, updatedBy) => {
  const task = await OperationsQueueModel.findOneAndUpdate({ transaction_id: transactionId });
  task.status = status || task.status;
  task.updated_by = updatedBy || task.updated_by;
  await task.save();
  return task;
};

const getPendingTasksList = async () => {
  const taskList = await OperationsQueueModel.find({ status: "PENDING" }, "_id");
  return taskList;
};

const getTaskListByArrayOfTransactionIds = async (transactionIds) => {
  // console.log("transac", transactionIds);
  const taskLists = await OperationsQueueModel.find(
    { transactionId: { $in: transactionIds } },
    "transactionId status operationsType message"
  );
  return taskLists;
};

module.exports = {
  createTask,
  deleteTaskByTransactionId,
  deleteTask,
  deleteMultipleTask,
  updateTask,
  taskByid,
  tasks,
  allTasks,
  createManyTask,
  updateTaskStatusById,
  getPendingTasksList,
  getTaskListByArrayOfTransactionIds,
  allTasksCount,
};
