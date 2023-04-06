const Router = require('express');
const UserController = require('./controllers/UserController')

const routes = new Router();

routes.get('/users', UserController.getAll);
routes.get('/users/:id', UserController.getOne);
routes.post('/users', UserController.post);
routes.post('/register', UserController.register);
routes.post('/auth/login', UserController.login);
routes.put('/users/:id', UserController.update);
routes.delete('/users/:id', UserController.delete);
routes.post('/')

module.exports = routes;