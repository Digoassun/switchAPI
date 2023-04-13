const Router = require('express');
const UserController = require('./controllers/UserController');
const authMiddleware = require('./middleware/authMiddleware');

const routes = new Router();

routes.get('/users', authMiddleware, UserController.getAll);
routes.get('/users/:id', authMiddleware, UserController.getOne);
routes.post('/register', UserController.register);
routes.post('/auth/login', UserController.login);
routes.put('/users/:id', authMiddleware, UserController.update);
routes.delete('/users/:id', authMiddleware, UserController.delete);

module.exports = routes;