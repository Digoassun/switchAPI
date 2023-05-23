const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const User = require("./User");

class Address extends Sequelize.Model {
    static init(sequelize) {
        super.init(
            {
                zipcode: {
                    type: Sequelize.STRING,
                    validate: {
                        notEmpty: {msg: "Insira um cep"},
                    },
                },
                state: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                city: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                neighborhood: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                street: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
            },
            {
                sequelize,
            }
        );
        Address.belongsTo(User,{foreignKey:'user_id', as:'user'})
    }
}

module.exports = Address;
