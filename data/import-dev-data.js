const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../models/tourModel');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, (err) => {
    if (!err) {
      console.log('database connection success!');
    } else {
      console.log('database error connection ', err);
    }
  })
  .then((conn) => {
    console.log(conn.connection);
  });

//READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

//Import json file into DB

const importData = async (req, res) => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// Delete Data ALL from DB

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully Deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);
