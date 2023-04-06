const Router = require('express');
const UserController = require('./controllers/UserController')

const routes = new Router();

routes.get('/users', UserController.search);
routes.post('/users', UserController.store);
routes.post('/')

module.exports = routes;