const AWS = require('aws-sdk');
const { connectToDatabase } = require('/opt/nodejs/connectToDatabase');

AWS.config.update({ region: process.env.REGION });
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

exports.handler = async function () {
  const clientMongoDB = await connectToDatabase();

  const deliveries = clientMongoDB.db('messaging').collection('deliveries');

  const scheduledMessages = await deliveries
    .aggregate([
      {
        $match: {
          status: { $eq: 'SCHEDULED' },
          scheduledFor: { $lte: new Date() },
          deletedAt: { $exists: false },
        },
      },
      {
        $lookup: {
          from: 'messages',
          localField: 'messageId',
          foreignField: '_id',
          as: 'message',
        },
      },
      {
        $unwind: '$message',
      },
    ])
    .toArray();

  await clientMongoDB.close();

  if (scheduledMessages) {
    const params = {
      MessageBody: JSON.stringify(scheduledMessages),
      QueueUrl: process.env.QUEUE_URL,
      MessageGroupId: 'grandecristian',
      MessageDeduplicationId: Date.now().toString(),
    };
    try {
      await sqs.sendMessage(params).promise();
    } catch (error) {
      console.log(error);
    }
  }

  const response = {
    statusCode: 200,
    body: {},
  };

  return response;
};
