const Joi = require("joi");
const TaskJoiModel = require("../validations/task");
const { findAgentName, lock } = require("../services/agent_services");

const { deleteMultipleOperation, createManyOperation } = require("../services/operations_queue_services");

const logger = require("../../utils/logger");

const LockOperation = async ({ agent_name, is_locked, platform } = {}) => {
  try {
    if (is_locked) {
      // lock agent process
      const agent = await findAgentName(agent_name);
      logger.debug("RPA-Lock", { data: agent });

      if (!agent) {
        return { status: false, message: "Agent not found" };
      }

      let agent_id = agent._id;
      let agentLock = await lock(agent_id, is_locked);

      // lock agent process ends

      // deleteing agent related tasks from collection
      const deleteTasks = await deleteMultipleOperation({ agent_name, platform });

      return {
        status: true,
        success: true,
        message: "Agent is Locked and Tasks deleted successfully",
        data: { agent: agentLock, deletedTasks: deleteTasks },
      };
    }
  } catch (error) {
    logger.error("Lock-Operation-Error", { data: error });
    return { status: false, message: "something went wrong!", error: error.message };
  }
};

const unlockOperation = async ({ agent_name, is_locked, pending_tasks }) => {
  try {
    pending_tasks = pending_tasks.map((task) => ({ ...task }));

    const validator = Joi.array().items(TaskJoiModel).validate(pending_tasks);
    if (validator.error) {
      return {
        status: false,
        message: validator.error.message,
      };
    }

    if (!is_locked && pending_tasks) {
      const agent = await findAgentName(agent_name);

      if (!agent) {
        return { status: false, message: "Agent not found" };
      }
      let agent_id = agent._id;

      let agentUnlock = await lock(agent_id, is_locked);

      // uppend tasks
      let uppendTask = await createManyOperation(pending_tasks);
      // console.log(uppendTask);

      return {
        status: true,
        message: "Agent Released and Tasks Added successfully!",
        data: { agent: agentUnlock, tasks: uppendTask },
      };
    }
  } catch (error) {
    logger.error("UnLock-Operation-Error", { data: error });
    return { status: false, message: "something went wrong!", error: error.message };
  }
};

module.exports = {
  LockOperation,
  unlockOperation,
};
