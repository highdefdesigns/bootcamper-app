path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// bring in ENV variables
dotenv.config({ path: './config/config.env' });

// Connect to Database
connectDB();

// Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');

// Custom middleware
const logger = require('./middleware/logger');

const app = express();

// body parser
app.use(express.json());

// Custom logging middleware
app.use(logger);

// Dev logging middleware (Morgan)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading .jpgs .png etc.
app.use(fileupload());

// Set static folder for image
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers on route
app.use('/api/v1/bootcamps/', bootcamps);
app.use('/api/v1/courses/', courses);
app.use('/api/v1/auth/', auth);

app.use(errorHandler);

const PORT = process.env.PORT || 5500;

const server = app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`.yellow.bold
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // close server and exit process
  server.close(() => {
    process.exit(1);
  });
});
