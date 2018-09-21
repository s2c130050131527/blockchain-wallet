import mongodb from 'mongodb';

const MongoClient = mongodb.MongoClient;
const serverUrl = 'localhost:27017/msg-sender';


class Database {
  constructor() {
    this.db = {};
    this._connect();

  }

   static getInstance() {
      return this.db;
  }
  _connect() {
    MongoClient.connect(`mongodb://${serverUrl}`, (err,client) => {
      this.db = client.db('msg-sender');
    })
      
  }
  _close() {
    console.log('====================================');
    console.log('Connection closed');
    mongoose.connection.close();
    console.log('====================================');
  }
}

export default new Database();
