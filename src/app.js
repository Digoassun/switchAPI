const express = require("express");
const routes = require("./routes");
const cors = require("cors");
require("./database");
require("dotenv").config();

const app = express();
app.use(cors())

// Local server
app.listen(3000,()=>console.log('aberto'))

app.use(express.json());
app.use(routes);
