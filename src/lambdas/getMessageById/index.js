const {
  connectToDatabase,
  ObjectId,
} = require('/opt/nodejs/connectToDatabase');

exports.handler = async (event) => {
  const client = await connectToDatabase();

  const collection = client.db('messaging').collection('messages');

  const { pathParameters } = event;

  let id;
  let status = 404;
  let message = 'Not found';

  try {
    id = ObjectId(pathParameters.id);
    message = await collection.findOne({
      _id: id,
      deletedAt: { $exists: false },
    });
  } catch (err) {
    status = 400;
    message = 'Bad request';
    console.error(err);
  }

  if (message) {
    status = 200;
  }

  await client.close();

  const response = {
    statusCode: status,
    body: JSON.stringify(message),
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return response;
};
