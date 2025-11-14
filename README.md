# Meal Planner

A full-stack meal planning application with React frontend and Node.js/Express backend.

## Prerequisites

- **Node.js** (v20 or higher recommended)
- **npm** (comes with Node.js)
- **SQLite3** (usually comes with Node.js, but may need to be installed separately on some systems)

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

Add the following environment variables to `.env`:

```env
DB_FILEPATH=./meals.db
JWT_SECRET_KEY=your_secret_key_here
```

**Note:** 
- `DB_FILEPATH` should point to your SQLite database file. The default is `./meals.db` (relative to the server directory).
- `JWT_SECRET_KEY` is used for JWT token signing. Use a strong, random string in production.

### 3. Database Setup

The database file (`meals.db`) should already exist in the `src/server` directory. If you need to recreate it, you can use the `meals.sql` schema file.

To initialize/reset the database (if needed):
```bash
cd src/server
# If you have a script to run the SQL file, use it
# Otherwise, you can manually run the SQL commands from meals.sql
```

## Running the Application

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
2. Check that `DB_FILEPATH` points to the correct database file
3. Ensure the database file has the correct schema (see `meals.sql`)

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

## Production Build

### Server
```bash
cd src/server
npm run build
# The compiled JavaScript will be in the dist/ directory
```

### Client
```bash
cd src/client
npm run build
# The production build will be in the build/ directory
```

