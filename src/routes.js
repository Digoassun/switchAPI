const Router = require("express");
const UserController = require("./controllers/UserController");
const authMiddleware = require("./middleware/authMiddleware");
const {upload} = require("./controllers/UserController");

const routes = new Router();

routes.post("/register", upload,UserController.register);
routes.post("/auth/login", UserController.login);

routes.get("/users", authMiddleware, UserController.getAll);
routes.get("/users/:id", authMiddleware, UserController.getOne);
routes.put("/users/:id",upload, authMiddleware, UserController.update);
routes.delete("/users/:id", authMiddleware, UserController.delete);

routes.post("/url-create",upload,UserController.urlCreate);
routes.delete("/url-delete/:file", upload, UserController.urlDelete);

module.exports = routes;
