import { createServer } from "http";
import express, {Express} from "express";
import helmet from "helmet";
import cors from 'cors';
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })
import { registerMealController } from "./controllers/meals";
import { registerDishController } from "./controllers/dishes";
import { registerProductController } from "./controllers/products";
import { registerIngredientController } from "./controllers/ingredients";
import protectedRoutes from "./middleware/protectedRoutes";
import { registerUserController } from "./controllers/users";
import cookieParser from 'cookie-parser';


const port = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : 4000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const serverUrl = process.env.SERVER_URL || 'http://localhost:4000';
const expressApp: Express = express();


expressApp.use(cors({ origin: clientUrl, credentials: true, }));

expressApp.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", serverUrl],
        fontSrc: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
  })
);
expressApp.use(express.json());
expressApp.use(cookieParser());
expressApp.use('/api', protectedRoutes);

registerUserController(expressApp);
registerMealController(expressApp);
registerDishController(expressApp);
registerProductController(expressApp);
registerIngredientController(expressApp);

const server = createServer(expressApp);
server.listen(port,
    () => console.log(`HTTP Server listening on port ${port}`));

