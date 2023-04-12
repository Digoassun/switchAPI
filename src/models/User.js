const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');

class User extends Sequelize.Model{
    static init(sequelize){
        super.init(
            {
                name: {
                    type:Sequelize.STRING,
                    validate:{
                        notEmpty:{msg:'Insira um nome'}
                    }
                },                
                email: {
                    type: Sequelize.STRING,
                    validate:{
                        notEmpty:{msg:'Insira um email'},
                        isEmail:{msg:'Insira um email válido'}
                    }
                },
                password: {
                    type: Sequelize.STRING,
                    validate:{
                        notEmpty:{msg:'Insira uma senha'},
                        len:{args: [4,16], msg:'Senha deve conter de 4 a 16 caracteres'}
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