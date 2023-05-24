const Sequelize = require("sequelize");
const User = require("../models/User");
const Address = require("../models/Address");
const Neighborhood = require("../models/Neighborhood");
const City = require("../models/City");
const State = require("../models/State");
const databaseConfig = require("../config/database");

const connection = new Sequelize(databaseConfig);

User.init(connection);
Address.init(connection);
Neighborhood.init(connection);
City.init(connection);
State.init(connection);

User.associate(connection.models);
Address.associate(connection.models);
Neighborhood.associate(connection.models);
City.associate(connection.models);
State.associate(connection.models);

module.exports = connection;
