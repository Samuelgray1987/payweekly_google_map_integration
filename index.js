require('./config');

const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/route');

// set port from env
const port = process.env.PORT;

// create app
const app = express();

// add middleware to handle json data
app.use(bodyParser.json());

// add /api/route/planning routes
app.use('/node/api/route/planning', routes);

// start listening for requests
app.listen(port, () => {});

// export app (so we can test)
module.exports = app;