const Router = require("express");
const UserController = require("./controllers/UserController");
const AddressController = require("./controllers/AddressController");
const authMiddleware = require("./middleware/authMiddleware");
const {upload} = require("./controllers/UserController");

const routes = new Router();

//Users routes
routes.post("/register", upload,UserController.register);
routes.post("/auth/login", UserController.login);

routes.get("/users", authMiddleware, UserController.getAll);
routes.get("/users/:id", authMiddleware, UserController.getOne);
routes.put("/users/:id",upload, authMiddleware, UserController.update);
routes.delete("/users/:id", authMiddleware, UserController.delete);

routes.post("/url-create",upload,UserController.urlCreate);
routes.delete("/url-delete/:file", upload, UserController.urlDelete);

//Addresses routes

routes.get("/addresses", AddressController.getAll);
routes.put("/addresses/:id", AddressController.update);
routes.delete("/addresses/:id", AddressController.delete);

routes.get("/users/:user_id/addresses", AddressController.getOne);
routes.post("/users/:user_id/addresses", AddressController.register);

routes.post("/build-cep-body", AddressController.buildCepBody);

module.exports = routes;
