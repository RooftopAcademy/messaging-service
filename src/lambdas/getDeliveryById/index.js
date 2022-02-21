const {
  connectToDatabase,
  ObjectId,
} = require('/opt/nodejs/connectToDatabase');

exports.handler = async (event) => {
  const client = await connectToDatabase();

  const deliveries = client.db('messaging').collection('deliveries');

  const { pathParameters } = event;

  let id;
  let status = 200;
  let message;

  try {
    id = ObjectId(pathParameters.id);
    message = await deliveries.findOne({
      _id: id,
      deletedAt: { $exists: false },
    });

    if (!message) {
      status = 404;
      message = { message: 'Not found' };
    }
  } catch {
    status = 400;
    message = { message: 'Invalid delivery id' };
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
