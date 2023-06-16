const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;

require("dotenv").config();
const cloudName = process.env.CLOUD_NAME
const apiKey = process.env.API_KEY
const apiSecret = process.env.API_SECRET

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
})

module.exports = {
    async getAll(req, res) {
        try {
            const users = await User.findAll();

            if (!users) {
                return res.status(400).json({error: true, msg: "Não existem usuários cadastrados"});
            }

            return res.json(users);
        } catch (err) {
            res.status(400).send({error: true, msg: err});
        }
    },

    async getOne(req, res) {
        try {
            const user = await User.findByPk(req.params.id, {
                include: {
                    association: 'addresses', attributes: ['id', 'zipcode', 'street'],
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


            return res.status(200).json({
                name: user.name,
                email: user.email,
                password: "",
                addresses: user.addresses,
                image_url: user.image_url,
                phone: (user.phone ? user.phone : ''),
                document: (user.document ? user.document : '')
            });
        } catch (err) {
            res.status(400).send({error: true, msg: err});
        }
    },

    async delete(req, res) {
        try {
            const user = await User.findOne({where: {id: req.params.id}});
            if (!user) {
                return res.status(400).json({error: true, msg: "Usuário não encontrado"});
            }
            if(user.image){
                await cloudinary.uploader.destroy(user.image,{
                    type:'upload',
                    resource_type:'image'
                })
            }
            await user.destroy();
            return res.status(200).json({user, msg: `Usuário ${user.name} deletado`});
        } catch (err) {
            res.status(400).send({error: true, msg: err});
        }
    },

    async update(req, res) {
        try {
            const user = await User.findOne({where: {id: req.params.id}});
            const {name, email, password, phone, document, role, encodedImage} = req.body;

            if (!user) {
                return res.status(400).json({error: true, msg: "Usuário não encontrado"});
            }
            let imageUpload = {secure_url: user.image_url, public_id: user.image};

            if (encodedImage) {
                imageUpload = await cloudinary.uploader.upload(encodedImage, {
                    public_id: `${Date.now()}`,
                    resource_type: 'image',
                    folder: 'image',
                })
            }

            if(encodedImage && user.image){
                await cloudinary.uploader.destroy(user.image,{
                    type:'upload',
                    resource_type:'image'
                })
            }

            await user.update({
                name,
                email,
                password,
                phone,
                document,
                role,
                image_url: imageUpload.secure_url,
                image: imageUpload.public_id
            }, {where: req.params.id});
            return res.status(200).json({user, msg: `Usuário ${user.name} atualizado com sucesso`});
        } catch (err) {
            res.status(400).send({error: true, msg: err.errors});
        }
    },

    async register(req, res) {
        try {
            const {name, email, password, passwordConfirmation, role, phone, document, encodedImage} = req.body;
            let imageUpload = {secure_url: '', public_id: ''};

            const user = await User.findOne({where: {email: email}});
            if (user) {
                return res.status(400).json({error: true, msg: "Email ja está sendo usado"});
            }

            if (encodedImage) {
                imageUpload = await cloudinary.uploader.upload(encodedImage, {
                    public_id: `${Date.now()}`,
                    resource_type: 'image',
                    folder: 'image',
                })
            }

            if (passwordConfirmation !== password) {
                return res.status(400).json({error: true, msg: "As senhas precisam ser iguais"});
            }

            const newUser = await User.create({
                name,
                email,
                password,
                image_url: imageUpload.secure_url,
                image: imageUpload.public_id,
                role,
                phone,
                document
            });
            return res.status(200).json(newUser);
        } catch (err) {
            res.status(400).send({error: true, msg: err.errors});
        }
    },

    async login(req, res) {
        try {
            const {email, password} = req.body;
            const user = await User.findOne({where: {email: email}});
            if (!user) {
                return res.status(400).json({error: true, msg: "Usuário não encontrado"});
            }

            const checkPassword = await bcrypt.compare(password, user.password);

            if (!checkPassword) {
                console.log(password, user.password);
                return res.status(400).json({error: true, msg: "Senha inválida"});
            }
            const secret = process.env.SECRET;
            const token = jwt.sign({id: user.id}, secret);

            res.status(200).json({user, msg: "Autenticação sucedida", token});
        } catch (err) {
            res.status(400).send({error: true, msg: "Erro de login"});
        }
    },

};
