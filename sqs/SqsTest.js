const addTask = require("./addTask");
const receive = require("./receive");

const testSqsQueue = () => {
  const producerParams = {
    // Remove DelaySeconds parameter and value for FIFO queues
    DelaySeconds: 1,
    MessageAttributes: {
      Title: {
        DataType: "String",
        StringValue: "The Whistler",
      },
      Author: {
        DataType: "String",
        StringValue: "John Grisham",
      },
      WeeksOn: {
        DataType: "Number",
        StringValue: "6",
      },
    },
    MessageBody:
      "Information about current NY Times fiction bestseller for week of 12/11/2016.",
    // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
    // MessageGroupId: "Group1",  // Required for FIFO queues
    QueueUrl: "https://sqs.ap-south-1.amazonaws.com/542542184102/Staging-Queue",
  };
  addTask(producerParams);
  receive();
};

testSqsQueue();
