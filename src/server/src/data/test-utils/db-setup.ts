import { Knex } from "knex";
import { newDb } from "pg-mem";

export async function setupTestDB(): Promise<Knex> {
  const pg = newDb({
    autoCreateForeignKeyIndices: true,
  });

  const knexInstance = pg.adapters.createKnex() as Knex;

  await knexInstance.schema.createTable("Products", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("measure").notNullable().defaultTo("unit");
    table.decimal("price", 10, 2).notNullable();
    table.integer("userId").notNullable().defaultTo(1);
  });

  await knexInstance("Products").insert([
    { name: "Pizza", measure: "unit", price: 9.99, userId: 1 },
    { name: "Burger", measure: "unit", price: 7.5, userId: 1 },
  ]);

  return knexInstance;
}
