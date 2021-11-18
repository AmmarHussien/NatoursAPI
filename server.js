const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('uncaught Exception Shutting down');

  process.exit(0);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log('DB Connection Successful');
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`listening on ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('unhandledRejection Shutting down');
  server.close(() => {
    process.exit(1);
  });
});
