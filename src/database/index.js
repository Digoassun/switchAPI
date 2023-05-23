const Sequelize = require("sequelize");
const User = require("../models/User");
const Address = require("../models/Address");
const databaseConfig = require("../config/database");

const connection = new Sequelize(databaseConfig);

User.init(connection);
Address.init(connection);

User.associate(connection.models);
Address.associate(connection.models);

module.exports = connection;
