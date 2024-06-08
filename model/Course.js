const { DataTypes } = require('sequelize');
const sequelize = require('../lib/sequelize')

const Course = sequelize.define('Course', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Course;
