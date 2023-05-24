const Sequelize = require("sequelize");

class Neighborhood extends Sequelize.Model {
    static init(sequelize) {
        super.init(
            {
                neighborhood: {
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
        Neighborhood.hasMany(models.Address,{foreignKey:'neighborhood_id', as:'neighborhoods'})
        Neighborhood.belongsTo(models.City,{foreignKey:'city_id', as:'cities'})
    }
}

module.exports = Neighborhood;
