const Sequelize = require("sequelize");

class State extends Sequelize.Model {
    static init(sequelize) {
        super.init(
            {
                state: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
            },
            {
                sequelize,
            }
        );

        return this;

    }
    static associate(models){
        State.hasMany(models.City,{foreignKey:'city_id', as:'cities'})
    }
}

module.exports = State;
