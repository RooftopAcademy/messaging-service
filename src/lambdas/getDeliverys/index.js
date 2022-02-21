const { connectToDatabase } = require('/opt/nodejs/connectToDatabase');

exports.handler = async (event) => {
  const client = await connectToDatabase();
  const collection = client.db('messaging').collection('deliveries');

  const queryStringParameters = event.queryStringParameters;

  const queryParamStatus = event.queryStringParameters?.status;

  let queryLimit = Number(queryStringParameters?.limit);
  let queryPage = Number(queryStringParameters?.page);

  let status = 200;

  queryLimit = Number.isNaN(queryLimit) ? 10 : queryLimit;
  queryLimit = queryLimit <= 100 ? queryLimit : 100;
  queryPage = Number.isNaN(queryPage) ? 1 : queryPage;

  const filter = {};

  if (queryParamStatus) {
    filter.status = queryParamStatus;
  }

  queryPage = Number.isNaN(queryPage) ? 1 : queryPage;
  queryPage = queryPage >= 1 ? queryPage : 1;

  let deliveries = await collection
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
    body: JSON.stringify({ message: deliveries }),
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return response;
};
