const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  pool: {
    max: 10,       // Maximum number of connections in the pool
    min: 0,        // Minimum number of connections in the pool
    acquire: 30000, // Maximum time (ms) to try to get a connection before throwing an error
    idle: 10000    // Maximum time (ms) a connection can be idle before being released
  }
});

module.exports = sequelize;
