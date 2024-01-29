import express from "express";
import { checkAuthorization } from "./middleware/check_authorization";
import { customerController } from "./controllers/customer.controller";
import { userController } from "./controllers/user.controller";
import { messageController } from "./controllers/message.controller";

const routes = express.Router();

routes.post("/login", userController.login);
routes.get("/customer", checkAuthorization, customerController.getCustomers);
routes.put("/customer/name/:id", checkAuthorization, customerController.updateName)
routes.put("/customer/session/:id", checkAuthorization, customerController.leftSession)

routes.get("/message", checkAuthorization, messageController.getMessages)
routes.post("/message", checkAuthorization, messageController.sendMessage)

routes.get("/users/current", checkAuthorization, userController.get);

export { routes };
