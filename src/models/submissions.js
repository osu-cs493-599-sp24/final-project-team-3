const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Submission = sequelize.define('Submission', {
  submissionId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  assignmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  grade: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'Submissions',
});

const User = require('./users');
console.log('User Model:', User);
console.log('User Model Name:', User.name);
console.log('User Prototype:', User.prototype);

Submission.belongsTo(User, { foreignKey: 'studentId' });

module.exports = Submission;
