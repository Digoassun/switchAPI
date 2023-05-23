const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const {S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand} = require("@aws-sdk/client-s3");
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");
const cep = require('cep-promise')

require("dotenv").config();

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey
    },
    region: bucketRegion
})

const storage = multer.memoryStorage()
const upload = multer({storage: storage}).single('image')

module.exports = {
    async getAll(req, res) {
        try {
            const users = await User.findAll({
            include:{
                association:'addresses'
            }
        });

            if (!users) {
                return res.status(400).json({error: true, msg: "Não existem usuários cadastrados"});
            }
            for (const user of users) {
                const getObjectParams = {
                    Bucket: bucketName,
                    Key: user.image,
                }
                if (getObjectParams.Key) {
                    const command = new GetObjectCommand(getObjectParams);
                    const url = await getSignedUrl(s3, command, {expiresIn: 3600});
                    user.image_url = url
                }
            }

            return res.json(users);
        } catch (err) {
            res.status(400).send({error: true, msg: err});
        }
    },

    async getOne(req, res) {
        try {
            const user = await User.findByPk(req.params.id, {include: { association: 'addresses'}});
            if (!user) {
                return res.status(400).json({error: true, msg: "Usuário não encontrado"});
            }
            if (user.image) {
                const getObjectParams = {
                    Bucket: bucketName,
                    Key: user.image,
                }
                if (getObjectParams.Key) {
                    const command = new GetObjectCommand(getObjectParams);
                    user.image_url = await getSignedUrl(s3, command, {expiresIn: 3600})
                }
            }

            return res.status(200).json({name: user.name, email: user.email, password: "",addresses:user.addresses, image_url: user.image_url, phone: (user.phone? user.phone :''), document: (user.document? user.document :'')});
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

            if (user.image) {
                const params = {
                    Bucket: bucketName,
                    Key: user.image
                }
                const command = new DeleteObjectCommand(params);
                await s3.send(command)
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
            const {name, email, password,phone, document, role,} = req.body;
            let imgName;

            if (!user) {
                return res.status(400).json({error: true, msg: "Usuário não encontrado"});
            }
            if (req.file) {
                const hashImgName = await bcrypt.hash(req.file.originalname, 10)

                const putParams = {
                    Bucket: bucketName,
                    Key: hashImgName,
                    Body: req.file.buffer,
                    ContentType: req.file.mimetype
                }
                imgName = putParams.Key;
                if (user.image) {
                    const deleteParams = {
                        Bucket: bucketName,
                        Key: user.image
                    }
                    const deleteCommand = new DeleteObjectCommand(deleteParams);
                    await s3.send(deleteCommand)
                }
                const putCommand = new PutObjectCommand(putParams)

                await s3.send(putCommand)
            }

            await user.update({name, email, password,phone, document, role, image: imgName}, {where: req.params.id});
            return res.status(200).json({user, msg: `Usuário ${user.name} atualizado com sucesso`});
        } catch (err) {
            res.status(400).send({error: true, msg: err.errors});
        }
    },

    async register(req, res) {
        try {
            const {name, email, password, passwordConfirmation, role, phone, document} = req.body;
            let img = null;

            const user = await User.findOne({where: {email: email}});
            if (user) {
                return res.status(400).json({error: true, msg: "Email ja está sendo usado"});
            }

            if (passwordConfirmation !== password) {
                return res.status(400).json({error: true, msg: "As senhas precisam ser iguais"});
            }

            if (req.file) {
                const hashImgName = await bcrypt.hash(req.file.originalname, 10)

                img = {
                    Bucket: bucketName,
                    Key: hashImgName,
                    Body: req.file.buffer,
                    ContentType: req.file.mimetype
                }
                const command = new PutObjectCommand(img)
                await s3.send(command)
            }

            const newUser = await User.create({name, email, password, role, phone, document, image: img?.Key});
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

    async urlCreate(req, res) {
        try {
            const originalName = req.file.originalname;

            const putParams = {
                Bucket: bucketName,
                Key: originalName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype
            }
            const putCommand = new PutObjectCommand(putParams)
            await s3.send(putCommand)

            const getObjectParams = {
                Bucket: bucketName,
                Key: putParams.Key,
            }

            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, {expiresIn: 3600});
            return res.status(200).json(url);

        } catch (err) {
            res.status(400).send({error: true, msg: 'Selecione uma imagem válida'});
        }
    },

    async urlDelete(req, res) {
        try {
            const deleteParams = {
                Bucket: bucketName,
                Key: req.params.file,
            }

            const deleteCommand = new DeleteObjectCommand(deleteParams);
            await s3.send(deleteCommand)
            return res.status(200).json('Imagem deletada');

        } catch (err) {
            res.status(400).send({error: true, msg: err});
        }
    },

    upload
};
