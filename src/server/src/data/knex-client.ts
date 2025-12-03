import knex, { Knex } from "knex";

type ConnectionConfig = string | Knex.StaticConnectionConfig | Knex.ConnectionConfigProvider;

const resolveSslConfig = () => {
    const sslMode = process.env.PGSSLMODE;
    if (sslMode !== "require") {
        return undefined;
    }

    const rejectUnauthorized = process.env.PGSSL_REJECT_UNAUTHORIZED !== "false";
    return { rejectUnauthorized };
};

const buildConnection = (): ConnectionConfig => {
    if (process.env.DATABASE_URL) {
        return {
            connectionString: process.env.DATABASE_URL,
            ssl: resolveSslConfig(),
        };
    }

    const password = process.env.PGPASSWORD;
    return {
        host: process.env.PGHOST ?? "127.0.0.1",
        port: Number(process.env.PGPORT ?? 5432),
        user: process.env.PGUSER ?? "postgres",
        password: typeof password === "string" ? password : "",
        database: process.env.PGDATABASE ?? "meal_planner",
        ssl: resolveSslConfig(),
    };
};

export const db: Knex = knex({
    client: "pg",
    connection: buildConnection(),
    pool: {
        min: Number(process.env.DB_POOL_MIN ?? 0),
        max: Number(process.env.DB_POOL_MAX ?? 10),
    },
    searchPath: ["public"],
});

export default db;

