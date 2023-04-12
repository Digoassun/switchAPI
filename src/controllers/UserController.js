const User = require('../models/User')
const jwt = require('jsonwebtoken');

module.exports = {
    async getAll(req,res){
        try{
            const users = await User.findAll();

            if(!users){
                return res.status(400).json({error:true, msg: 'Não existem usuários cadastrados'})
            }
            return res.json(users)
        } catch(err){
            res.status(400).send({error:true, msg:err})
        }
    },
    
    async getOne(req,res){
        try{
            const user = await User.findOne({where: {id: req.params.id}});
            if(!user){
                return res.status(400).json({error:true, msg: 'Usuário não encontrado'})
            }
            return res.status(200).json(user);
        } catch(err){
            res.status(400).send({error:true, msg:err})
        }
    },
    
    async update(req, res){
        try{
            const user = await User.findOne({where: {id: req.params.id}});
        
            const {name, email, password} = req.body;
            if(!user){
                return res.status(400).json({error:true, msg: 'Usuário não encontrado'})
            }
            await user.update({name,email,password}, {where: req.params.id})
            return res.status(200).json(user)
        } catch(err){
            res.status(400).send({error:true, msg:err})
        }
    },

    async delete(req, res){
        try{
            const user = await User.findOne({where: {id: req.params.id}});
            if(!user){
                return res.status(400).json({error:true, msg: 'Usuário não encontrado'})
            }
            await user.destroy()
            return res.status(200).json(user)
        } catch(err){
            res.status(400).send({error:true, msg:err})
        }
    },

    async register(req, res){
        try{
            const {name, email, password, passwordConfirmation} = req.body;
            const user = await User.findOne({where: {email: email}});
            if(user){
                return res.status(400).json({error:true, msg: 'Email ja está sendo usado'})
            }

            if(passwordConfirmation !== password){
                return res.status(400).json({error:true, msg: 'As senhas precisam ser iguais'})
            }           

            const newUser = await User.create({name,email,password})  
            return res.status(200).json(newUser)
        } catch(err){
            res.status(400).send({msg:err.errors});
        }
    },

    async login(req, res){
        try{
            const {email, password} = req.body;
            const user = await User.findOne({where: {email: email}});
            if(!user){
                return res.status(400).json({error:true, msg: 'Usuário não encontrado'})
            }

            const checkPassoword = await bcrypt.compare(password, user.password)
            if(!checkPassoword){
                return res.status(400).json({error:true, msg: 'Senha inválida'})
            }
            const secret = process.env.SECRET
            const token = jwt.sign({id: user.id}, secret)

            res.status(200).json({msg: 'Autenticação sucedida', token})

        } catch(err){
            res.status(400).send({error:true, msg:err})
        }
    },
}