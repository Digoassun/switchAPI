const express = require("express");
const routes = require("./routes");
const cors = require("cors");
const bodyParser = require('body-parser')
require("./database");
require("dotenv").config();

const app = express();

app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({limit:'50mb', extended:true}));

app.use(cors());

// Local server
app.listen(3000,()=>console.log('aberto'))

app.use(express.json());
app.use(routes);
