const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./users');
const Course = require('./courses');
const Assignment = require('./assignments');
const CourseEnrollments = require('./enrollments');

// Define relationships
Course.belongsToMany(User, { through: CourseEnrollments, as: 'enrolledStudents' });
User.belongsToMany(Course, { through: CourseEnrollments, as: 'enrolledCourses' });

Course.hasMany(Assignment, { as: 'assignments', foreignKey: 'courseId' });
Assignment.belongsTo(Course, { foreignKey: 'courseId' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Course,
  Assignment,
  CourseEnrollments
};
