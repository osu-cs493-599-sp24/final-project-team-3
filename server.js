const express = require('express');
const sequelize = require('./src/config/database'); // Ensure the path is correct
const apiRoutes = require('./src/api'); // Ensure the path is correct

const app = express();
app.use(express.json());
app.use('/', apiRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};


startServer();
