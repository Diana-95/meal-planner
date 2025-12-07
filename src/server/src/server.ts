import { createServer } from "http";
import express, {Express} from "express";
import helmet from "helmet";
import cors from 'cors';
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

// Compose DATABASE_URL from individual environment variables if not set
if (!process.env.DATABASE_URL) {
    const dbUser = process.env.POSTGRES_USER || process.env.PGUSER || 'postgres';
    const dbPassword = process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD || '';
    const dbHost = process.env.PGHOST || 'localhost';
    // When connecting to Docker service "postgres", always use container port 5432
    // Otherwise use POSTGRES_PORT (host port) for local development
    const dbPort = dbHost === 'postgres' ? '5432' : (process.env.POSTGRES_PORT || process.env.PGPORT || '5432');
    const dbName = process.env.POSTGRES_DB || process.env.PGDATABASE || 'meal_planner';
    
    // URL encode password to handle special characters
    const encodedPassword = encodeURIComponent(dbPassword);
    
    process.env.DATABASE_URL = `postgresql://${dbUser}:${encodedPassword}@${dbHost}:${dbPort}/${dbName}`;
    console.log('Composed DATABASE_URL from environment variables');
}

import { registerMealController } from "./controllers/meals";
import { registerDishController } from "./controllers/dishes";
import { registerProductController } from "./controllers/products";
import { registerIngredientController } from "./controllers/ingredients";
import protectedRoutes from "./middleware/protectedRoutes";
import { registerUserController } from "./controllers/users";
import cookieParser from 'cookie-parser';

// Use SERVER_HOST_PORT for the server port
const port = 4000;
const clientUrl = process.env.CLIENT_URL || `http://localhost:${process.env.CLIENT_PORT || '3000'}`;
const serverUrl = process.env.SERVER_URL || `http://localhost:${port}`;
const expressApp: Express = express();

// Support multiple origins for CORS (useful for Docker and different environments)
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [clientUrl];

console.log(`Server configuration:
  Port: ${port}
  Client URL: ${clientUrl}
  Allowed Origins: ${allowedOrigins.join(', ')}
  Server URL: ${serverUrl}
  Database URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}
`);

expressApp.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS: Allowed request from origin: ${allowedOrigins.join(', ')}`);
      
      console.warn(`CORS: Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

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

// Add error handling for server
server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    
    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
    
    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
});

server.listen(port, () => {
    console.log(`HTTP Server listening on port ${port}`);
    console.log(`CORS enabled for origin: ${clientUrl}`);
});

