const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./users');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  instructorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false
});

// Define relationships
Course.belongsToMany(User, { through: 'CourseEnrollments', as: 'students' });
User.belongsToMany(Course, { through: 'CourseEnrollments', as: 'courses' });

module.exports = Course;
