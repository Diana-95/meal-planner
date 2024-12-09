import { createServer } from "http";
import express, {Express} from "express";
import helmet from "helmet";
import cors from 'cors';
import { registerMealInsert } from "./controllers/meals";
import { registerDishController } from "./controllers/dishes";
import { registerProductController } from "./controllers/products";
import { registerIngredientController } from "./controllers/ingredients";
import protectedRoutes from "./middleware/protectedRoutes";
import { registerUserController } from "./controllers/users";
import cookieParser from 'cookie-parser';

const port = 4000;
const expressApp: Express = express();

expressApp.use(cors({ origin: 'http://localhost:3000', credentials: true, }));

expressApp.use(helmet());
expressApp.use(express.json());
expressApp.use(cookieParser());
expressApp.use('/api', protectedRoutes);

registerUserController(expressApp);
registerMealInsert(expressApp);
registerDishController(expressApp);
registerProductController(expressApp);
registerIngredientController(expressApp);

const server = createServer(expressApp);
// server.on('upgrade', (req, socket, head) => proxy.ws(req, socket, head));
server.listen(port,
    () => console.log(`HTTP Server listening on port ${port}`));

