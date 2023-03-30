const express = require('express');
const bookRouter = require('./src/routes/books.router');
// const path = require('path');
const cors = require('cors');

const app = express();

const port = 1910;

let allowedOrigins = [, /localhost:\d{4}$/];

let corsOptions = {
  origin: allowedOrigins,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// // view engine setup
// app.set('views', path.join(__dirname, 'src/views'));
// app.set('view engine', 'jade');

app.use('/books', bookRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}.`);
});

module.exports = app;
