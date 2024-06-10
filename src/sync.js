const sequelize = require('./config/database');
const bcrypt = require('bcryptjs');

const User = require('./models/users');
const Assignment = require('./models/assignments');
const Course = require('./models/courses');
const CourseEnrollments = require('./models/enrollments');

const userData = require('./data/users.json');
const courseData = require('./data/courses.json');
const enrollmentData = require('./data/enrollments.json');
const assignmentData = require('./data/assignments.json');

// Define client fields for bulk creation
const UserClientFields = ['username', 'email', 'password', 'role'];
const CourseClientFields = ['id', 'title', 'description', 'instructorId'];
const EnrollmentClientFields = ['courseId', 'userId'];
const AssignmentClientFields = ['id', 'courseId', 'title', 'description', 'points', 'due'];

const syncDatabase = async () => {
  try {
    // Drop tables in the correct order to avoid foreign key constraint issues
    await sequelize.getQueryInterface().dropTable('CourseEnrollments');
    await sequelize.getQueryInterface().dropTable('Assignments');
    await sequelize.getQueryInterface().dropTable('Courses');
    await sequelize.getQueryInterface().dropTable('Users');

    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully.');

    // Insert Users
    const users = userData.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 8)
    }));
    await User.bulkCreate(users, { fields: UserClientFields });

    // Insert Courses
    await Course.bulkCreate(courseData, { fields: CourseClientFields });

    // Insert Enrollments
    await CourseEnrollments.bulkCreate(enrollmentData, { fields: EnrollmentClientFields });

    // Insert Assignments
    await Assignment.bulkCreate(assignmentData, { fields: AssignmentClientFields });

    console.log("Database initialized successfully.");
    process.exit(0); // Exit process after successful initialization
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1); // Exit process with error
  }
};

syncDatabase();
