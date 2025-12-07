import "dotenv/config";

import { db } from "../data/knex-client";

async function addEmojiColumn() {
    const localDb = db;

    try {
        const hasColumn = await localDb.schema.hasColumn("Products", "emoji");

        if (hasColumn) {
            console.log("✓ Emoji column already exists in Products table");
            await localDb.destroy();
            process.exit(0);
        }

        await localDb.schema.alterTable("Products", (table) => {
            table.text("emoji").nullable();
        });

        console.log("✓ Successfully added emoji column to Products table");
        await localDb.destroy();
        process.exit(0);
    } catch (error) {
        console.error("Error adding emoji column:", error);
        await localDb.destroy();
        process.exit(1);
    }
}

addEmojiColumn();