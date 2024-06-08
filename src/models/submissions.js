const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://user:password@localhost:3306/tarpaulin');

const Submission = sequelize.define('Submission', {
  submissionId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  assignmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Assignments',
      key: 'assignmentId'
    }
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'userId'
    }
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  grade: {
    type: DataTypes.INTEGER,
    allowNull: true // Grades can be null initially and updated later
  }
}, {
  tableName: 'Submissions'
});

// Assuming you have models for Assignment and User already defined elsewhere and imported here
const { User, Assignment } = require('../api/index'); // Path might need adjustment based on your structure

// Define associations
Submission.belongsTo(Assignment, { foreignKey: 'assignmentId' });
Submission.belongsTo(User, { foreignKey: 'studentId' });

// Sync model with database
async function syncModel() {
  try {
    await Submission.sync();
    console.log('The table for the Submission model was just (re)created!');
  } catch (error) {
    console.error('Error syncing the Submission model:', error);
  }
}

syncModel();

module.exports = Submission;
