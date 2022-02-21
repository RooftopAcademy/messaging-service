const { connectToDatabase } = require('/opt/nodejs/connectToDatabase');

exports.handler = async (event) => {
  const client = await connectToDatabase();

  const collection = client.db('messaging').collection('messages');

  const body = JSON.parse(event.body);

  ['type', 'subject', 'contentPlain', 'contentHtml'].forEach((prop) => {
    if (body.prop != undefined) {
      body[prop] = event[prop];
    }
  });

  const { insertedId } = await collection.insertOne({
    ...body,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await client.close();

  const response = {
    statusCode: 201,
    body: JSON.stringify({ insertedId }),
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return response;
};
