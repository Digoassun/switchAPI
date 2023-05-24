const Address = require("../models/Address");
const cep = require('cep-promise')
const User = require("../models/User");
const Neighborhood = require("../models/Neighborhood");
const City = require("../models/City");
const State = require("../models/State");

module.exports = {
    async buildCepBody(req, res){
        try{
            const address = await cep(req.body.cep)
            return res.status(200).json(address);
        }catch(err){
            res.status(400).send({error: true, msg: err});
        }
    },

    async getAll(req, res) {
        try {
            const addresses = await Address.findAll();

            return res.json(addresses);
        } catch (err) {
            res.status(400).send({error: true, msg: err});
        }
    },

    async getOne(req, res) {
       try{
           const{user_id} = req.params
           const user = await User.findByPk(user_id, {
               include:{association:'addresses'}
           })
           return res.json(user?.addresses)
        } catch (err) {
            res.status(400).send({error: true, msg: err});
        }
    },

    async delete(req, res) {
        try {
            const address = await Address.findByPk(req.params.id);
            if (!address) {
                return res.status(400).json({error: true, msg: "Endereço não encontrado"});
            }

            await address.destroy();
            return res.status(200).json({address, msg: `Endereço da rua ${address.street} deletado`});
        } catch (err) {
            res.status(400).send({error: true, msg: err});
        }
    },

    async update(req, res) {
        try {
            const address = await Address.findByPk(req.params.id);
            const {zipcode, state, city, neighborhood, street} = req.body;

            if (!address) {
                return res.status(400).json({error: true, msg: "Endereço não encontrado"});
            }

            await address.update({zipcode, state, city, neighborhood, street}, {where: req.params.id});
            return res.status(200).json({address, msg: `Endereço da rua ${address.street} atualizado`});
        } catch (err) {
            res.status(400).send({error: true, msg: err.errors});
        }
    },

    async register(req, res) {
        try {
            const {user_id} = req.params
            const {zipcode, state, city, neighborhood, street} = req.body;

            const user = await User.findOne({where: {id: req.params.user_id}});
            const stateExist = await State.findOne({where: {state: state}});
            const cityExist = await City.findOne({where: {city: city}});
            const neighborhoodExist = await Neighborhood.findOne({where: {neighborhood: neighborhood}});
            if (!user) {
                return res.status(400).json({error: true, msg: "Usuário não existe"});
            }
            if (!stateExist){
                const newState = await State.create({state});
            }
            if (!cityExist){
                const cityExist = await City.create({city});
            }
            if (!neighborhoodExist){
                const neighborhoodExist = await Neighborhood.create({neighborhood});
            }

            const newAddress = await Address.create({zipcode, street,user_id});
            return res.status(200).json(newAddress);
        } catch (err) {
            res.status(400).send({error: true, msg: err});
        }
    },
};
