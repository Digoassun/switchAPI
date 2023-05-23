const express = require("express");
const routes = require("./routes");
const cors = require("cors");
require("./database");
require("dotenv").config();

const app = express();
app.use(cors())

// Prod server
// const server = https.createServer({
//     key: fs.readFileSync('/home/ubuntu/app/src/privkey.pem'),
//     cert: fs.readFileSync('/home/ubuntu/app/src/fullchain.pem'),
//     requestCert: false,
//     rejectUnauthorized: false
// }, app);
// server.listen(3000, ()=>console.log('aberto'));

// Local server
app.listen(3000,()=>console.log('aberto'))

app.use(express.json());
app.use(routes);
