const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Ensure this path is correct

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'instructor', 'student'),
    allowNull: false,
  },
}, {
  timestamps: false,
});

module.exports = User;
