const Sequelize = require("sequelize");
const User = require("../models/User");
const databaseConfig = require("../config/database");

const connection = new Sequelize(databaseConfig);

User.init(connection);

module.exports = connection;
