const Address = require("../models/Address");
const cep = require('cep-promise')
const User = require("../models/User");
const Neighborhood = require("../models/Neighborhood");
const City = require("../models/City");
const State = require("../models/State");

module.exports = {
    async getAllStates(req, res) {
        try {
            const state = await State.findAll();
            return res.status(200).json(state);
        } catch (err) {
            res.status(400).send({error: true, msg: err});
        }
    },

    async getAllCities(req, res) {
        try {
            const city = await City.findAll();
            return res.status(200).json(city);
        } catch (err) {
            res.status(400).send({error: true, msg: err});
        }
    },

    async getAllNeighborhoods(req, res) {
        try {
            const neighborhood = await Neighborhood.findAll();
            return res.status(200).json(neighborhood);
        } catch (err) {
            res.status(400).send({error: true, msg: err});
        }
    },

    async buildCepBody(req, res) {
        try {
            const address = await cep(req.body.cep)
            return res.status(200).json(address);
        } catch (err) {
            res.status(400).send({error: true, msg: err.errors[0].message});
        }
    },

    async getAll(req, res) {

        try {
            const addresses = await Address.findAll({
                include: {
                    association: 'neighborhood', attributes: ['id', 'neighborhood'],
                    include: {
                        association: 'city', attributes: ['id', 'city'],
                        include: {
                            association: 'state', attributes: ['id', 'state'],
                        }
                    }
                }
            });

            return res.status(200).json(addresses);
        } catch (err) {
            res.status(400).send({error: true, msg: err});
        }
    },

    async getAllFormUser(req,res){
        try {
            const user = await User.findByPk(req.params.id, {
                include: {
                    association: 'addresses', attributes: ['id', 'zipcode', 'street',"user_id"],
                    include: {
                        association: 'neighborhood', attributes: ['id', 'neighborhood'],
                        include: {
                            association: 'city', attributes: ['id', 'city'],
                            include: {
                                association: 'state', attributes: ['id', 'state'],
                            }
                        }
                    }
                }
            });
            if (!user) {
                return res.status(400).json({error: true, msg: "Usuário não encontrado"});
            }

            return res.status(200).json({addresses: user.addresses});
        } catch (err) {
            res.status(400).send({error: true, msg: err});
        }
    },

    async getOne(req, res) {
        try {
            const address = await Address.findByPk(req.params.id, {
                include: {
                    association: 'neighborhood', attributes: ['id', 'neighborhood'],
                    include: {
                        association: 'city', attributes: ['id', 'city'],
                        include: {
                            association: 'state', attributes: ['id', 'state'],
                        }
                    }
                }
            })
            console.log(address)
            return res.status(200).json(address)
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
            console.log(address)
            if (!address) {
                return res.status(400).json({error: true, msg: "Endereço não encontrado"});
            }
            const [stateExist] = await State.findOrCreate({where: {state: state}});
            const [cityExist] = await City.findOrCreate({where: {city: city, state_id: stateExist.dataValues.id}});
            const [neighborhoodExist] = await Neighborhood.findOrCreate({
                where: {
                    neighborhood: neighborhood, city_id: cityExist.dataValues.id
                }
            });

            await address.update({
                zipcode,
                street,
                neighborhood_id: neighborhoodExist.dataValues.id
            }, {where: req.params.id});
            return res.status(200).json({address, msg: `Endereço da rua ${address.street} atualizado`});
        } catch (err) {
            res.status(400).send({error: true, msg: err.errors});
        }
    },

    async register(req, res) {
        try {
            const {user_id} = req.params;
            console.log(req.body)
            const {zipcode, state, city, neighborhood, street} = req.body;

            const user = await User.findOne({where: {id: req.params.user_id}});
            if (!user) {
                return res.status(400).json({error: true, msg: "Usuário não existe"});
            }
            const [stateExist] = await State.findOrCreate({where: {state: state}});
            const [cityExist] = await City.findOrCreate({where: {city: city, state_id: stateExist.dataValues.id}});
            const [neighborhoodExist] = await Neighborhood.findOrCreate({
                where: {
                    neighborhood: neighborhood,
                    city_id: cityExist.dataValues.id
                }
            });

            const newAddress = await Address.create({
                zipcode,
                street,
                neighborhood_id: neighborhoodExist.dataValues.id,
                user_id
            });
            return res.status(200).json(newAddress);
        } catch (err) {
            res.status(400).send({error: true, msg: err});
        }
    },


};
