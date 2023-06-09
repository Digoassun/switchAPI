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
        Neighborhood.hasMany(models.Address,{foreignKey:'neighborhood_id', as:'addresses'})
        Neighborhood.belongsTo(models.City,{foreignKey:'city_id', as:'city'})
    }
}

module.exports = Neighborhood;
