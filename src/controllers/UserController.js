const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3=new S3Client({
  credentials:{
    accessKeyId: accessKey,
    secretAccessKey:secretAccessKey
  },
  region:bucketRegion
})

const storage = multer.memoryStorage()
const upload = multer({storage:storage})

module.exports = {
  async getAll(req, res) {
    try {
      const users = await User.findAll();

      if (!users) {
        return res.status(400).json({ error: true, msg: "Não existem usuários cadastrados" });
      }
      return res.json(users);
    } catch (err) {
      res.status(400).send({ error: true, msg: err });
    }
  },

  async getOne(req, res) {
    try {
      const user = await User.findOne({ where: { id: req.params.id } });
      if (!user) {
        return res.status(400).json({ error: true, msg: "Usuário não encontrado" });
      }
      return res.status(200).json({ name: user.name, email: user.email, password: "" });
    } catch (err) {
      res.status(400).send({ error: true, msg: err });
    }
  },

  async delete(req, res) {
    try {
      const user = await User.findOne({ where: { id: req.params.id } });
      if (!user) {
        return res.status(400).json({ error: true, msg: "Usuário não encontrado" });
      }
      await user.destroy();
      return res.status(200).json({ user, msg: `Usuário ${user.name} deletado` });
    } catch (err) {
      res.status(400).send({ error: true, msg: err });
    }
  },

  async update(req, res) {
    try {
      const user = await User.findOne({ where: { id: req.params.id } });

      const { name, email, password } = req.body;
      if (!user) {
        return res.status(400).json({ error: true, msg: "Usuário não encontrado" });
      }

      await user.update({ name, email, password }, { where: req.params.id });
      return res.status(200).json({ user, msg: "Usuário atualizado com sucesso" });
    } catch (err) {
      res.status(400).send({ error: true, msg: err.errors });
    }
  },

  async register(req, res) {
    try {
      const { name, email, password, passwordConfirmation } = req.body;
      const params = {
        Bucket:bucketName,
        Key:req.file.originalname,
        Body:req.file.buffer,
        ContentType:req.file.mimeType
      }
      const command = new PutObjectCommand(params)
      await s3.send(command)
      const user = await User.findOne({ where: { email: email } });
      if (user) {
        return res.status(400).json({ error: true, msg: "Email ja está sendo usado" });
      }

      if (passwordConfirmation !== password) {
        return res.status(400).json({ error: true, msg: "As senhas precisam ser iguais" });
      }

      // const newUser = await User.create({ name, email, password });
      // return res.status(200).json(newUser);
    } catch (err) {
      res.status(400).send({ error: true, msg: err.errors });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email: email } });
      if (!user) {
        return res.status(400).json({ error: true, msg: "Usuário não encontrado" });
      }

      const checkPassword = await bcrypt.compare(password, user.password);

      if (!checkPassword) {
        console.log(password, user.password);
        return res.status(400).json({ error: true, msg: "Senha inválida" });
      }
      const secret = process.env.SECRET;
      const token = jwt.sign({ id: user.id }, secret);

      res.status(200).json({ user, msg: "Autenticação sucedida", token });
    } catch (err) {
      res.status(400).send({ error: true, msg: "Erro de login" });
    }
  },

  upload
};
