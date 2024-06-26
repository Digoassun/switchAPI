const Router = require("express");
const UserController = require("./controllers/UserController");
const AddressController = require("./controllers/AddressController");
const authMiddleware = require("./middleware/authMiddleware");

const routes = new Router();

//Users routes
routes.post("/register", UserController.register);
routes.post("/auth/login", UserController.login);

routes.get("/users", authMiddleware, UserController.getAll);
routes.get("/users/:id", authMiddleware, UserController.getOne);
routes.put("/users/:id", authMiddleware, UserController.update);
routes.delete("/users/:id", authMiddleware, UserController.delete);

//Addresses routes
routes.get("/addresses",authMiddleware, AddressController.getAll);
routes.get("/addresses/:id",authMiddleware, AddressController.getOne);
routes.put("/addresses/:id",authMiddleware, AddressController.update);
routes.delete("/addresses/:id",authMiddleware, AddressController.delete);

routes.get("/user/:id/addresses",authMiddleware, AddressController.getAllFormUser);
routes.post("/user/:user_id/addresses",authMiddleware, AddressController.register);

routes.post("/build-cep-body",authMiddleware, AddressController.buildCepBody);

routes.get("/states",authMiddleware, AddressController.getAllStates);
routes.get("/cities",authMiddleware, AddressController.getAllCities);
routes.get("/neighborhoods",authMiddleware, AddressController.getAllNeighborhoods);

module.exports = routes;
