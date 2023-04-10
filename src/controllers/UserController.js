const User = require('../models/User')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
    async getAll(req,res){
        try{
            const users = await User.findAll();

            if(!users){
                return res.status(400).json({error: 'This table is empty'})
            }
            return res.json(users)
        } catch(err){
            res.status(400).send({error:err})
        }
    },
    
    async getOne(req,res){
        try{
            const user = await User.findOne({where: {id: req.params.id}});
            if(!user){
                return res.status(400).json({error: 'User not found'})
            }
            return res.status(200).json(user);
        } catch(err){
            res.status(400).send({error:err})
        }
    },
    
    async update(req, res){
        try{
            const user = await User.findOne({where: {id: req.params.id}});
        
            const {name, email, password} = req.body;
            if(!user){
                return res.status(400).json({error: 'User not found'})
            }
            await user.update({name,email,password}, {where: req.params.id})
            return res.status(200).json(user)
        } catch(err){
            res.status(400).send({error:err})
        }
    },

    async delete(req, res){
        try{
            const user = await User.findOne({where: {id: req.params.id}});
            if(!user){
                return res.status(400).json({error: 'User not found'})
            }
            await user.destroy()
            return res.status(200).json(user)
        } catch(err){
            res.status(400).send({error:err})
        }
    },

    async register(req, res){
        try{
            const {name, email, password, passwordConfirmation} = req.body;
            const user = await User.findOne({where: {email: email}});
            if(user){
                return res.status(400).json({error: 'Email already being used'})
            }

            if(passwordConfirmation !== password){
                return res.status(400).json({error: 'The passwords must be equal'})
            }

            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)

            const newUser = await User.create({name,email,password: passwordHash})  
            return res.status(200).json(newUser)
        } catch(err){
            res.status(400).send({error:err})
        }
    },

    async login(req, res){
        try{
            const {email, password} = req.body;
            const user = await User.findOne({where: {email: email}});
            if(!user){
                return res.status(400).json({error: 'User not found'})
            }

            const checkPassoword = await bcrypt.compare(password, user.password)
            if(!checkPassoword){
                return res.status(400).json({error: 'Invalid password'})
            }
            const secret = process.env.SECRET
            const token = jwt.sign({id: user.id}, secret)

            res.status(200).json({msg: 'Autenticação realizada com sucesso', token})

        } catch(err){
            res.status(400).send({error:err})
        }
    },
}