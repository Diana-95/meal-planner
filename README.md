# Meal Planner

A full-stack meal planning application with React frontend and Node.js/Express backend.

## Prerequisites

- **Node.js** (v20 or higher recommended)
- **npm** (comes with Node.js)
- **PostgreSQL** 13+ (local install or Docker container)

## Project Structure

```
meal-planner/
├── src/
│   ├── client/     # React frontend
│   └── server/     # Node.js/Express backend
```

## Setup Instructions

### 1. Install Dependencies

#### Server Dependencies
```bash
cd src/server
npm install
```

#### Client Dependencies
```bash
cd src/client
npm install
```

### 2. Server Configuration

Create a `.env` file in the `src/server` directory:

```bash
cd src/server
touch .env
```

Add the following environment variables to `.env` (adjust as needed for your Postgres server):

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/meal_planner
PGSSLMODE=disable
JWT_SECRET_KEY=your_secret_key_here
```

**Note:** 
- You can omit `DATABASE_URL` and instead provide `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, and `PGDATABASE` if you prefer discrete values.
- Set `PGSSLMODE=require` when connecting to managed/cloud databases that demand TLS. Use `PGSSL_REJECT_UNAUTHORIZED=false` if you need to skip certificate validation (not recommended for production).
- `JWT_SECRET_KEY` is used for JWT token signing. Use a strong, random string in production.

### 3. Database Setup

1. Start a Postgres instance locally (Docker example):
   ```bash
   docker run --name meal-planner-db \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=meal_planner \
     -p 5432:5432 -d postgres:16
   ```
2. Compile the server and apply the schema:
   ```bash
   cd src/server
   npm run build
   node dist/scripts/reset-db.js
   ```
3. (Optional) Populate demo data:
   ```bash
   npm run seed:products
   npm run seed:dishes
   ```

For one-time migration instructions from `meals.db`, see `src/server/docs/sqlite-to-postgres.md`.

## Running the Application

### Option A: Docker Compose (Postgres + API + Client)

1. Build and start everything:
   ```bash
   docker compose up --build
   ```
2. Services:
   - Client: http://localhost:3000
   - API: http://localhost:4000/api
   - Postgres: localhost:5433 (user/password `meal`)
3. To stop containers:
   ```bash
   docker compose down
   ```

> The compose file uses a production build of the API and the CRA dev server for the UI. Edit `docker-compose.yml` if you need different env vars/secrets.

### Start the Server

In one terminal window:

```bash
cd src/server
npm start
```

The server will start on **http://localhost:4000**

The server uses `tsc-watch` to automatically compile TypeScript and restart on changes.

### Start the Client

In another terminal window:

```bash
cd src/client
npm start
```

The client will start on **http://localhost:3000** and automatically open in your browser.

## Development

### Server Scripts

- `npm start` - Start the server with auto-reload (uses tsc-watch)
- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch mode for TypeScript compilation
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

### Client Scripts

- `npm start` - Start the development server
- `npm test` - Run tests
- `npm run build` - Build for production

## API Endpoints

The server API is available at `http://localhost:4000/api`

The server is configured to accept requests from `http://localhost:3000` (CORS).

## Troubleshooting

### Database Issues

If you encounter database errors:
1. Make sure the `.env` file exists in `src/server`
2. Confirm the Postgres instance is running and `DATABASE_URL` (or the discrete env vars) are correct
3. Re-run `node dist/scripts/reset-db.js` to recreate the schema if necessary
4. Review `src/server/docs/sqlite-to-postgres.md` for migration/reset tips

### Port Already in Use

If port 3000 or 4000 is already in use:
- **Client**: React will automatically suggest using a different port
- **Server**: Change the port in `src/server/src/server.ts` (line 17)

### TypeScript Compilation Errors

If you see TypeScript errors:
1. Make sure all dependencies are installed
2. Run `npm run build` in the server directory to check for compilation errors
3. Check that your Node.js version is compatible (v20+ recommended)

## Testing

### Server Tests
```bash
cd src/server
npm test
```

### Client Tests
```bash
cd src/client
npm test
```

## Demo Mode

The application supports a demo mode that allows visitors to explore the app with pre-populated data without requiring registration.

### Enabling Demo Mode

1. Seed the demo user data:
   ```bash
   cd src/server
   npm run seed:demo
   ```
2. Restart your application

### How Demo Mode Works

- **Auto-login**: If the demo user exists, visitors are automatically logged in as the demo user on first visit
- **Read-only**: The demo account is read-only - all write operations (POST, PUT, DELETE) are blocked by the server
- **Shared data**: All visitors see the same demo data (products, dishes, meals)
- **Demo credentials**: username: `demo`, password: `demo123`

### Disabling Demo Mode

To disable demo mode, simply delete the demo user from the database. The system will automatically detect that the demo user doesn't exist and will not attempt auto-login.

### Demo Data

The demo user includes:
- 30+ sample products (ingredients and groceries)
- 20+ sample dishes with recipes and ingredients
- Meal plans for the next 30 days


