const {
  connectToDatabase,
  ObjectId,
} = require('/opt/nodejs/connectToDatabase');

exports.handler = async (event) => {
  const client = await connectToDatabase();

  const collection = client.db('messaging').collection('deliveries');

  // En el body deben venir los campos messageId, recipients y scheduledFor.
  // Data es opcional.
  const body = JSON.parse(event.body);

  try {
    body.messageId = ObjectId(body.messageId);
  } catch {
    await client.close();

    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid messageId' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  // Checkea que la fecha programada no sea pasada.
  body.scheduledFor = new Date(body.scheduledFor);
  if (body.scheduledFor < new Date()) {
    await client.close();

    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid schedule' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  const messages = client.db('messaging').collection('messages');

  const message = await messages.findOne(
    {
      _id: body.messageId,
      deletedAt: { $exists: false },
    },
    { _id: 1 }
  );

  if (!message) {
    await client.close();

    return {
      statusCode: 422,
      body: JSON.stringify({ message: 'Message not found' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  const statistics = {
    success: 0,
    failed: 0,
    pending: body['recipients'].length,
    total: body['recipients'].length,
  };

  body['statistics'] = statistics;

  const { insertedId } = await collection.insertOne({
    ...body,
    status: 'SCHEDULED',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await client.close();

  return {
    statusCode: 201,
    body: JSON.stringify({ insertedId }),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};
