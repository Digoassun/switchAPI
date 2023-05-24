const Sequelize = require("sequelize");

class City extends Sequelize.Model {
    static init(sequelize) {
        super.init(
            {
                city: {
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
        City.hasMany(models.Neighborhood,{foreignKey:'neighborhood_id', as:'neighborhoods'})
        City.belongsTo(models.State,{foreignKey:'city_id', as:'cities'})
    }
}

module.exports = City;
