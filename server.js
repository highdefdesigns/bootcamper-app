const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');

const bootcamps = require('./routes/bootcamps');
const logger = require('./middleware/logger');

// bring in ENV variables
dotenv.config({ path: './config/config.env' });

const app = express();

// Custom logging middleware
app.use(logger);
// Dev logging middleware (Morgan)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/bootcamps/', bootcamps);

const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
