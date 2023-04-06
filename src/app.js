const express = require('express');
const routes = require('./routes');
require('./database')
const app = express();

app.listen(3000);

app.use(express.json());

app.use(routes);
