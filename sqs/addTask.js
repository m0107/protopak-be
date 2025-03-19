// // Load the AWS SDK for Node.js
// const AWS = require("aws-sdk");
// // Set the region
// AWS.config.update({ region: process.env.AWS_S3_BUCKET_REGION });

// module.exports = async (reqObj) => {
//   params = {
//     MessageBody: JSON.stringify(reqObj),
//     QueueUrl: process.env.AWS_SQS_QUEUE_URL,
//   };
//   // console.log({params});
//   // Create an SQS service object
//   const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });
//   sqs.sendMessage(params, function (err, data) {
//     if (err) {
//       console.log("SQS Error in adding task", err);
//     } else {
//       console.log("SQS Success", data.MessageId);
//       console.log("[x] Sent %s", JSON.parse(params.MessageBody), {
//         messageId: data.MessageId,
//       });
//     }
//   });
// };

const {
    SQSClient,
    SendMessageCommand,
    GetQueueUrlCommand,
    ReceiveMessageCommand,
    DeleteMessageCommand,
  } = require("@aws-sdk/client-sqs");
  
  // a client can be shared by different commands.
  const sqsClient = new SQSClient({
    region: process.env.AWS_S3_BUCKET_REGION,
  });
  
  module.exports = async (reqObj) => {
    try {
      const params = {
        QueueUrl: process.env.AWS_SQS_QUEUE_URL,
        MessageBody: JSON.stringify(reqObj),
        MessageAttributes: {
          env: {
            StringValue: process.env.APP_ENV,
            DataType: "String",
          },
        },
      };
      const command = new SendMessageCommand(params);
      const response = await sqsClient.send(command);
      console.log("[x] Sent %s", JSON.stringify(reqObj));
      // console.log("response:",response);
      // return response;
    } catch (error) {
      console.log("Sqs send Error!! ", error);
      throw "Sqs send Error!! ";
    }
  };
  
