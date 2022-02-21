const {
  connectToDatabase,
  ObjectId,
} = require('/opt/nodejs/connectToDatabase');

exports.handler = async (event) => {
  const client = await connectToDatabase();

  const collection = client.db('messaging').collection('messages');

  const {
    pathParameters: { id },
  } = event;

  if (!ObjectId.isValid(id)) {
    response.statusCode = 400;
    response.body = JSON.stringify({ message: 'Invalid id' });
    return response;
  }

  const writeResult = await collection.updateOne(
    {
      _id: ObjectId(id),
      deletedAt: { $exists: false },
    },
    {
      $set: {
        deletedAt: new Date(),
      },
    }
  );

  if (writeResult.modifiedCount == 0) {
    response.statusCode = 404;
    response.body = JSON.stringify({ message: 'Message not found' });
  }

  await client.close();

  const response = {
    statusCode: 200,
    body: JSON.stringify({ message: 'Deleted' }),
    headers: {
      'Content-Type': 'application/json',
    },
  };
  return response;
};
