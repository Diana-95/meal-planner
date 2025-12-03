import "dotenv/config";

import { db } from "../data/knex-client";

type DatabaseError = {
    code?: string;
    message?: string;
};

const isDatabaseError = (error: unknown): error is DatabaseError =>
    typeof error === "object" && error !== null;

async function addMealDishesRelation() {
    const localDb = db;

    try {
        const hasTable = await localDb.schema.hasTable("MealDishes");

        if (!hasTable) {
            // Create MealDishes junction table (many-to-many relationship)
            await localDb.schema.createTable('MealDishes', (table) => {
                table.increments('id').primary();
                table.integer('mealId').notNullable();
                table.integer('dishId').notNullable();
                table.integer('userId').notNullable();
                
                // Foreign keys
                table.foreign('mealId').references('id').inTable('Meals').onDelete('CASCADE');
                table.foreign('dishId').references('id').inTable('Dishes').onDelete('CASCADE');
                table.foreign('userId').references('id').inTable('Users').onDelete('CASCADE');
                
                // Unique constraint: one meal-dish combination per user
                table.unique(['mealId', 'dishId', 'userId']);
            });

            console.log('✓ Successfully created MealDishes table');
        } else {
            console.log("✓ MealDishes table already exists");
        }

        // Always migrate existing data from Meals.dishId to MealDishes (in case new data was added)
        const mealsWithDishes = await localDb('Meals')
            .select('id as mealId', 'dishId', 'userId')
            .whereNotNull('dishId');

        if (mealsWithDishes.length > 0) {
            console.log(`✓ Checking ${mealsWithDishes.length} meals for unmigrated dish relationships...`);
            let migratedCount = 0;
            
            for (const meal of mealsWithDishes) {
                try {
                    // Check if this relationship already exists
                    const existing = await localDb('MealDishes')
                        .where({
                            mealId: meal.mealId,
                            dishId: meal.dishId,
                            userId: meal.userId
                        })
                        .first();

                    if (!existing) {
                        await localDb('MealDishes').insert({
                            mealId: meal.mealId,
                            dishId: meal.dishId,
                            userId: meal.userId
                        });
                        migratedCount++;
                    }
                } catch (error: unknown) {
                    // Skip if duplicate (already migrated)
                    if (!isDatabaseError(error) || error.code !== '23505') {
                        console.error(`Error migrating meal ${meal.mealId}:`, error);
                    }
                }
            }
            
            if (migratedCount > 0) {
                console.log(`✓ Successfully migrated ${migratedCount} new meal-dish relationships`);
            } else {
                console.log('✓ All meal-dish relationships are already migrated');
            }
        } else {
            console.log('✓ No meals with dishes to migrate');
        }

        console.log('✓ Migration completed successfully');
        await localDb.destroy();
        process.exit(0);
    } catch (error: unknown) {
        console.error('✗ Error during migration:', error);
        await localDb.destroy();
        process.exit(1);
    }
}

addMealDishesRelation();


