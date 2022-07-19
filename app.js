const express = require('express');
const fs = require('fs');

const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//#############################################################################################
// 1/ MIDDLEWARE
//#############################################################################################
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//######################################################################
// 2/ ROUTE
//######################################################################

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/user', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
//
//#############################################################################################
// 3/ START SERVE
//#############################################################################################
module.exports = app;
