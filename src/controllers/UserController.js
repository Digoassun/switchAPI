const User = require('../models/User')

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
            return res.json(user);
        } catch(err){
            res.status(400).send({error:err})
        }
    },

    async post(req, res){
        try {
            const {name, email, password} = req.body;

            const user = await User.create({name,email,password})
            return res.json(user)
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
            return res.json(user)
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
            return res.json(user)
        } catch(err){
            res.status(400).send({error:err})
        }
    },
}