const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const colors = require('colors');

// bring in ENV variables
dotenv.config({ path: './config/config.env' });

// Connect to Database
connectDB();

// Route files
const bootcamps = require('./routes/bootcamps');
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

app.use('/api/v1/bootcamps/', bootcamps);

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
