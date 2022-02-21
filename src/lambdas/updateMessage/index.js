const {
  connectToDatabase,
  ObjectId,
} = require('/opt/nodejs/connectToDatabase');

exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({ message: 'Updated' }),
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const client = await connectToDatabase();

  const collection = client.db('messaging').collection('messages');

  const body = JSON.parse(event.body);

  const message = {};

  ['type', 'subject', 'contentPlain', 'contentHtml'].forEach((prop) => {
    if (body[prop] != undefined) {
      message[prop] = body[prop];
    }
  });

  const {
    pathParameters: { id },
  } = event;

  if (!ObjectId.isValid(id)) {
    await client.close();

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
        ...message,
        updatedAt: new Date(),
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
