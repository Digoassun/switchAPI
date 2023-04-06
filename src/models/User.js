const Sequelize = require('sequelize');

class User extends Sequelize.Model{
    static init(sequelize){
        super.init(
            {
                name: {
                    type:Sequelize.STRING,
                    validate:{
                        notEmpty:{msg:'Insert a name value'}
                    }
                },                
                email: {
                    type: Sequelize.STRING,
                    validate:{
                        notEmpty:{msg:'Insert a email value'},
                        isEmail:{msg:'Insert a valid email'}
                    }
                },
                password: {
                    type: Sequelize.STRING,
                    validate:{
                        len:{args:[4,15] ,msg:'Insert a password with length between 4 and 15 characters'}
                    }
                },
            },
            {
                sequelize
            }
        );
        return this
    }
}

module.exports = User;