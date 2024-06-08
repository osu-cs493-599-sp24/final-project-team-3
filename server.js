const express = require('express');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();
app.use(express.json());

// Connect to the database
sequelize.sync({ force: false }).then(() => {
  console.log('Database synced');
});

// Routes
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const assignmentRoutes = require('./routes/assignments');
const submissionRoutes = require('./routes/submissions');

app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
