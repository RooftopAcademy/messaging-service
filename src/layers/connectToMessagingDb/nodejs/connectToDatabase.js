const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

exports.connectToDatabase = async () => {
  const client = new MongoClient(
    'mongodb://rooftop:np7L89sUycueLz3v@notification-service-db.cluster-cdj7fojgsvpn.us-east-1.docdb.amazonaws.com:27017/?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false',
    {
      tlsCAFile: path.resolve(__dirname, 'rds-combined-ca-bundle.pem'), //Specify the DocDB; cert
    }
  );

  try {
    await client.connect();
    return client;
  } catch (error) {
    await client.close();
    throw error;
  }
};

exports.ObjectId = ObjectId;
