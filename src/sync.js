/*
synchronize models with the database

Run this script once to create the tables in database:

node src/sync.js
*/
const sequelize = require('./config/database');
const User = require('./models/users');
const submission = require('./models/submissions')
// Add other models here

const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Unable to synchronize the database:', error);
    process.exit(1);
  }
};

syncDatabase();
