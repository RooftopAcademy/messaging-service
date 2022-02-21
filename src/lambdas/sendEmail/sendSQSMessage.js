const AWS = require('aws-sdk');

AWS.config.update({ region: process.env.REGION });

async function sendSQSMessage(messageBody) {
  const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

  const params = {
    MessageBody: JSON.stringify(messageBody),
    QueueUrl: process.env.QUEUE_URL,
  };

  try {
    await sqs.sendMessage(params).promise();
  } catch (error) {
    console.log(error);
  }
}

module.exports = sendSQSMessage;
