const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');

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
                        notEmpty:{msg:'Insert a email value'},
                        len:{args: [4,16], msg:'Password must contain 4 to 16 characters'}
                    }
                },
            },
            {
                sequelize,
                hooks:{
                    beforeCreate: async (user, options) =>{
                        if(user.password.length < 4 || user.password.length > 16){
                            options.validate
                        } else {
                            const salt = await bcrypt.genSalt(12)
                            const passwordHash = await bcrypt.hash(user.password, salt)
                            user.password = passwordHash;
                        }
                    }
                }
            }
        );
        return this
    }
}

module.exports = User;