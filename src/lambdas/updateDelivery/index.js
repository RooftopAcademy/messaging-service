const {
  connectToDatabase,
  ObjectId,
} = require('/opt/nodejs/connectToDatabase');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  let id;

  try {
    id = ObjectId(event.pathParameters.id);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid id' }),
      headers,
    };
  }

  const body = JSON.parse(event.body);

  const delivery = {};

  ['messageId', 'scheduledFor', 'recipients', 'data'].forEach((prop) => {
    if (body[prop] != undefined) {
      delivery[prop] = body[prop];
    }
  });

  if (body.recipients) {
    const len = body.recipients.length;

    delivery.statistics = {
      success: 0,
      failed: 0,
      pending: len,
      total: len,
    };
  }

  if (delivery.scheduledFor) {
    delivery.scheduledFor = new Date(delivery.scheduledFor);

    if (delivery.scheduledFor < new Date()) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Scheduled date can't be a past date",
        }),
        headers,
      };
    }
  }

  const client = await connectToDatabase(),
    db = client.db('messaging'),
    deliveries = db.collection('deliveries'),
    messages = db.collection('messages');

  if (delivery.messageId) {
    try {
      delivery.messageId = ObjectId(delivery.messageId);

      const message = await messages.findOne(
        { _id: delivery.messageId, deletedAt: { $exists: false } },
        { _id: 1 }
      );

      if (!message) {
        await client.close();
        return {
          statusCode: 422,
          body: JSON.stringify({ message: 'Message does not exist' }),
          headers,
        };
      }
    } catch {
      await client.close();
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid messageId' }),
        headers,
      };
    }
  }

  const { matchedCount } = await deliveries.updateOne(
    {
      _id: id,
      deletedAt: { $exists: false },
    },
    {
      $set: {
        ...delivery,
        updatedAt: new Date(),
      },
    }
  );

  await client.close();

  if (matchedCount < 1) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Delivery not found' }),
      headers,
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Updated' }),
    headers,
  };
};
