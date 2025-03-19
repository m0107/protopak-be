const moment = require("moment-timezone");
const betBookIndex = require("../controllers/betBook/betBookIndex");
const lotusBookIndex = require("../controllers/lotusBook/lotusBookIndex");
const lordExch = require("../controllers/lordExchange/lordExchIndex");
const laserBookIndex = require("../controllers/laserBook/laserBookIndex");
// importing BetBhaiIndex
const betBhaiIndex = require("../controllers/betBhai/betBhaiIndex");
const tigerExchIndex = require("../controllers/tigerExchange/tigerExchIndex");
const skyExchangeIndex = require("../controllers/skyExchange/skyExchangeIndex");

const {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} = require("@aws-sdk/client-sqs");

const sqsClient = new SQSClient({
  region: process.env.AWS_S3_BUCKET_REGION,
});

module.exports = async () => {
  let sqsReceiveMessage = true;
  process.on("SIGTERM", () => {
    console.log("SIGTERM signal received..............");
    console.info("Closing sqs connection..............");
    sqsReceiveMessage = false;
  });
  while (sqsReceiveMessage) {
    let currentReceiptHandler;
    try {
      const params = {
        QueueUrl: process.env.AWS_SQS_QUEUE_URL,
        MaxNumberOfMessages: parseInt(process.env.AWS_SQS_MAX_MSG || 10),
        WaitTimeSeconds: parseInt(process.env.AWS_SQS_WAIT_TIME_SECONDS || 20),
      };
      // console.log(params);
      const command = new ReceiveMessageCommand(params);
      const response = await sqsClient.send(command);
      // console.group("response:", response);
      if (response.Messages) {
        for (let i = 0; i < response.Messages.length; i++) {
          console.log("task:", response.Messages[i].Body);
          let reqAddTaskObj = JSON.parse(response.Messages[i].Body);
          currentReceiptHandler = response.Messages[i].ReceiptHandle;
          if (reqAddTaskObj.service === "betBook247") {
            await betBookIndex(reqAddTaskObj);
          } else if (reqAddTaskObj.service === "lotusBook247") {
            await lotusBookIndex(reqAddTaskObj);
          } else if (reqAddTaskObj.service === "lordExch") {
            await lordExch(reqAddTaskObj);
          } else if (["laserBook247", "ambaniBook247"].includes(reqAddTaskObj.service)) {
            await laserBookIndex(reqAddTaskObj);
          } else if (reqAddTaskObj.service === "betBhai") {
            await betBhaiIndex(reqAddTaskObj);
          } else if (["tigerExch247", "jupiterExch"].includes(reqAddTaskObj.service)) {
            await tigerExchIndex(reqAddTaskObj);
          } else if (reqAddTaskObj.service === "skyExchange") {
            await skyExchangeIndex(reqAddTaskObj);
          }
          await deleteMessage(currentReceiptHandler);
        }
      } else {
        console.log(
          "No Message Found! ",
          moment().format("DD-MM-YYYY hh:mm:ss")
        );
        await new Promise((resolve, reject) =>
          setTimeout(() => {
            resolve();
          }, parseInt(process.env.AWS_SQS_WAIT_TILL_NO_MSG || 10))
        );
      }
    } catch (error) {
      if (currentReceiptHandler) {
        await deleteMessage(currentReceiptHandler);
      }
      console.log("Sqs read Error", error);
      // throw "Sqs read Error!! ";
    }
  }
};

const deleteMessage = async (receiptHandle) => {
  const command = new DeleteMessageCommand({
    QueueUrl: process.env.AWS_SQS_QUEUE_URL,
    ReceiptHandle: receiptHandle,
  });
  const response = await sqsClient.send(command);
  // console.log("delete response:", response);
};
