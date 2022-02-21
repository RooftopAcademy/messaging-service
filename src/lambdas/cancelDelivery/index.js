const {
  connectToDatabase,
  ObjectId,
} = require('/opt/nodejs/connectToDatabase');

exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify('Deleted'),
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const client = await connectToDatabase();

  const deliveries = client.db('messaging').collection('deliveries');

  const {
    pathParameters: { id },
  } = event;

  if (!ObjectId.isValid(id)) {
    response.statusCode = 400;
    response.body = JSON.stringify({ message: 'Invalid id' });
    return response;
  }

  const writeResult = await deliveries.updateOne(
    {
      _id: ObjectId(id),
      deletedAt: { $exists: false },
      scheduledFor: { $gt: new Date() },
    },
    {
      $set: {
        deletedAt: new Date(),
      },
    }
  );

  await client.close();

  if (writeResult.modifiedCount == 0) {
    response.statusCode = 404;
    response.body = JSON.stringify({ message: 'Not found' });
  }

  return response;
};
