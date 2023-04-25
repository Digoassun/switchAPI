const express = require("express");
const routes = require("./routes");
const cors = require("cors");
require("./database");
require("dotenv").config();

const app = express();
app.use(cors());
app.listen(3000);
app.use(express.json());
app.use(routes);
