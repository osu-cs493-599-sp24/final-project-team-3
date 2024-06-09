const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseEnrollments = sequelize.define('CourseEnrollments', {
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false
});

module.exports = CourseEnrollments;
