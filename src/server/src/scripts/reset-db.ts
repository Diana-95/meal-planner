import "dotenv/config";
import { readFileSync } from "fs";
import path from "path";

import { db } from "../data/knex-client";

async function resetDatabase() {
    const schemaPath = path.resolve(process.cwd(), "meals.sql");
    const sql = readFileSync(schemaPath, "utf-8");

    try {
        await db.raw(sql);
        console.log("✓ Successfully reset database schema using meals.sql");
        await db.destroy();
        process.exit(0);
    } catch (error) {
        console.error("✗ Failed to reset database schema", error);
        await db.destroy();
        process.exit(1);
    }
}

resetDatabase();

