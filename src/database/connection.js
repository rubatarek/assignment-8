import { MongoClient } from 'mongodb';


const url = 'mongodb://localhost:27017';

export  const databaseConnection = async () => {
    const client = new MongoClient(url);

await client.connect();
  console.log('Connected successfully to server');

const dbName = 'library';
return client.db(dbName);

}
