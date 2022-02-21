const {
  connectToDatabase,
  ObjectId,
} = require('/opt/nodejs/connectToDatabase');

exports.handler = async (event) => {
  const client = await connectToDatabase();
  const collection = client.db('messaging').collection('deliveries');

  await Promise.all(
    event.Records.map((record) => {
      console.log(record);

      const messageBody = JSON.parse(record.body);

      const { deliveryId, body } = messageBody;

      return collection.updateOne(
        {
          _id: ObjectId(deliveryId),
        },
        {
          $set: {
            ...body,
            updatedAt: new Date(),
          },
        }
      );
    })
  );

  await client.close();

  return {};
};
