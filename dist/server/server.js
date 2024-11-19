"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const meals_1 = require("./controllers/meals");
const dishes_1 = require("./controllers/dishes");
const products_1 = require("./controllers/products");
const ingredients_1 = require("./controllers/ingredients");
const port = 4000;
const expressApp = (0, express_1.default)();
expressApp.use((0, cors_1.default)({ origin: 'http://localhost:3000' }));
expressApp.use((0, helmet_1.default)());
expressApp.use(express_1.default.json());
(0, meals_1.registerMealInsert)(expressApp);
(0, dishes_1.registerDishController)(expressApp);
(0, products_1.registerProductController)(expressApp);
(0, ingredients_1.registerIngredientController)(expressApp);
const server = (0, http_1.createServer)(expressApp);
// server.on('upgrade', (req, socket, head) => proxy.ws(req, socket, head));
server.listen(port, () => console.log(`HTTP Server listening on port ${port}`));
