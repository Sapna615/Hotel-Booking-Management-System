const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');

let mongoServer;

beforeAll(async () => {
  const binaryOpts = {};
  if (fs.existsSync('/opt/homebrew/bin/mongod')) {
    binaryOpts.systemBinary = '/opt/homebrew/bin/mongod';
    binaryOpts.version = '8.2.2';
  }

  mongoServer = await MongoMemoryServer.create({
    binary: binaryOpts,
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
