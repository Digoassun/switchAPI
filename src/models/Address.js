const Sequelize = require("sequelize");

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
                street: {
                    type: Sequelize.STRING,
                    validate: {
                        notEmpty: {msg: "Insira uma rua"},
                    },
                },
                number: {
                    type: Sequelize.STRING,
                    validate: {
                        notEmpty: {msg: "Insira um número"},
                    },
                },
                complement: {
                    type: Sequelize.STRING,
                    allowNull: true
                },
            },
            {
                sequelize,
            }
        );

        return this;

    }
    static associate(models){
        Address.belongsTo(models.User,{foreignKey:'user_id', as:'user'})
        Address.belongsTo(models.Neighborhood,{foreignKey:'neighborhood_id', as:'neighborhood'})
    }
}

module.exports = Address;
