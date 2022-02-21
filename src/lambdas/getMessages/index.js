const { connectToDatabase } = require('/opt/nodejs/connectToDatabase');

exports.handler = async (event) => {
  const client = await connectToDatabase();

  const queryParamType = event.queryStringParameters?.type;

  let queryLimit = Number(event.queryStringParameters?.limit);
  let queryPage = Number(event.queryStringParameters?.page);

  const collection = client.db('messaging').collection('messages');

  let status = 200;

  queryLimit = Number.isNaN(queryLimit) ? 20 : queryLimit;
  queryLimit = queryLimit <= 100 ? queryLimit : 100;

  queryPage = Number.isNaN(queryPage) ? 1 : queryPage;
  queryPage = queryPage >= 1 ? queryPage : 1;

  const filter = {};

  if (queryParamType != undefined) {
    filter.queryParamType = queryParamType;
  }

  let message = await collection
    .find({
      ...filter,
      deletedAt: { $exists: false },
    })
    .sort({ updatedAt: -1 })
    .limit(queryLimit)
    .skip((queryPage - 1) * queryLimit)
    .toArray();

  await client.close();

  const response = {
    statusCode: status,
    body: JSON.stringify({ message: message }),
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return response;
};
