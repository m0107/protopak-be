const TaskJoiModel = require("../validations/task");

const { createOperation } = require("../services/operations_queue_services");

const agentService = require("../services/agent_services");

const platformService = require("../services/platform_services");

const logger = require("../../utils/logger");

const createOperations = async ({ task }) => {
  try {
    const validator = TaskJoiModel.validate(task);
    if (validator.error) {
      return {
        status: false,
        message: validator.error.message,
      };
    }
    const { agentName, platform } = validator.value;

    let platformExists = await platformService.findPlatformName(platform);
    if (!platformExists) platformExists = await platformService.create({ platform_name: platform });

    let agentExists = await agentService.getByFilter({ agentName, platform_id: platformExists._id });
    if (!agentExists)
      agentExists = await agentService.create({ agent_name: agentName, platform_id: platformExists._id });

    // if (!checkAgentNameExist && findPlatformIdFromPlatformName) {
    //   // const { _id } = findPlatformIdFromPlatformName;
    //   // const newAgentDetails = {
    //   //   agent_name: agentName,
    //   //   platform_id: _id,
    //   // };
    //   // const createNewAgent = await create(newAgentDetails);
    //   logger.error("create-new-agent-for-operations", { data: createNewAgent });
    //   if (createNewAgent.error) {
    //     logger.error("create-new-agent-for-operations-error", { data: createNewAgent.error });
    //     return {
    //       status: false,
    //       message: "Agent was not registered, Something went wrong when registering the agent!",
    //       error: createNewAgent.error,
    //     };
    //   }
    const result = await createOperation(task);
    return { status: true, message: "Operation Added", data: result };
    // }
    // await createOperation(task);
    // console.log('ress', ress);
    // return { status: true, message: "Operation Added", data: task };
  } catch (error) {
    logger.error("Create-Operations-Error", { data: error });
    return { status: false, message: "something went wrong!", error };
  }
};

module.exports = {
  createOperations,
};
