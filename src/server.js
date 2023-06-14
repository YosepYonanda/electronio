/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable linebreak-style */
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();
const port = 8080;

app.use('/', routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
