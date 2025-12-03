import "dotenv/config";
import { MealRepository } from "../data/repository/meals";
import { db } from "../data/knex-client";

// Meal types for different times of day
type MealType = 'breakfast' | 'lunch' | 'dinner';

interface MealSeedData {
    name: string;
    type: MealType;
    dishNames: string[];
}

// Sample meal plans - we'll randomly select from these
const mealTemplates: MealSeedData[] = [
    // Breakfast options
    { name: 'Breakfast', type: 'breakfast', dishNames: ['Berry Smoothie'] },
    { name: 'Breakfast', type: 'breakfast', dishNames: ['Green Smoothie'] },
    { name: 'Breakfast', type: 'breakfast', dishNames: ['French Toast'] },
    { name: 'Breakfast', type: 'breakfast', dishNames: ['Pancakes'] },
    { name: 'Breakfast', type: 'breakfast', dishNames: ['Scrambled Eggs with Vegetables'] },
    { name: 'Breakfast', type: 'breakfast', dishNames: ['Shakshuka'] },
    { name: 'Breakfast', type: 'breakfast', dishNames: ['Eggs Benedict'] },
    { name: 'Breakfast', type: 'breakfast', dishNames: ['Avocado Toast'] },
    { name: 'Breakfast', type: 'breakfast', dishNames: ['Vegetable Omelet'] },
    { name: 'Breakfast', type: 'breakfast', dishNames: ['Greek Yogurt Parfait'] },
    
    // Lunch options
    { name: 'Lunch', type: 'lunch', dishNames: ['Caesar Salad'] },
    { name: 'Lunch', type: 'lunch', dishNames: ['Greek Salad'] },
    { name: 'Lunch', type: 'lunch', dishNames: ['Chicken and Rice Bowl'] },
    { name: 'Lunch', type: 'lunch', dishNames: ['Vegetable Pasta'] },
    { name: 'Lunch', type: 'lunch', dishNames: ['Grilled Chicken Breast'] },
    { name: 'Lunch', type: 'lunch', dishNames: ['Roasted Salmon with Vegetables'] },
    { name: 'Lunch', type: 'lunch', dishNames: ['Beef Tacos'] },
    
    // Dinner options
    { name: 'Dinner', type: 'dinner', dishNames: ['Spaghetti Carbonara'] },
    { name: 'Dinner', type: 'dinner', dishNames: ['Beef Stir Fry'] },
    { name: 'Dinner', type: 'dinner', dishNames: ['Roasted Salmon with Vegetables'] },
    { name: 'Dinner', type: 'dinner', dishNames: ['Grilled Chicken Breast'] },
    { name: 'Dinner', type: 'dinner', dishNames: ['Mushroom Risotto'] },
    { name: 'Dinner', type: 'dinner', dishNames: ['Chicken and Rice Bowl'] },
    { name: 'Dinner', type: 'dinner', dishNames: ['Vegetable Pasta'] },
    { name: 'Dinner', type: 'dinner', dishNames: ['Beef Tacos'] },
];

// Helper function to get random element from array
function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get multiple random elements
function getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
}

// Helper to format date to ISO string (what PostgreSQL expects)
function formatDate(date: Date): string {
    return date.toISOString();
}

// Helper to create date at start of day
function getStartOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Helper to create date at end of day
function getEndOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

async function seedMeals() {
    const localDb = db;
    const mealRepository = new MealRepository();

    try {
        // Get all users
        const users = await localDb('Users').select('id', 'username');
        
        if (users.length === 0) {
            console.log('No users found in the database. Please create a user first.');
            await db.destroy();
            process.exit(1);
        }

        console.log(`Found ${users.length} user(s). Adding meals for each user...\n`);

        // Start date: today
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        
        // End date: 30 days from today
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 30);

        let totalMealsAdded = 0;

        for (const user of users) {
            console.log(`Processing meals for user: ${user.username} (ID: ${user.id})`);
            
            // Get all dishes for this user
            const allDishes = await localDb('Dishes')
                .where('userId', user.id)
                .select('id', 'name');
            
            if (allDishes.length === 0) {
                console.log(`  ⚠ No dishes found for ${user.username}, skipping...\n`);
                continue;
            }

            // Separate dishes by type (breakfast vs lunch/dinner)
            const breakfastDishes = allDishes.filter(dish => {
                const name = dish.name.toLowerCase();
                return name.includes('smoothie') || 
                       name.includes('toast') || 
                       name.includes('pancake') || 
                       name.includes('egg') || 
                       name.includes('omelet') || 
                       name.includes('shakshuka') || 
                       name.includes('benedict') || 
                       name.includes('parfait');
            });

            const lunchDinnerDishes = allDishes.filter(dish => 
                !breakfastDishes.some(bd => bd.id === dish.id)
            );

            console.log(`  Found ${breakfastDishes.length} breakfast dishes and ${lunchDinnerDishes.length} lunch/dinner dishes`);

            let userMealsAdded = 0;

            // Create meals for each day
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                const dayStart = getStartOfDay(new Date(currentDate));
                const dayEnd = getEndOfDay(new Date(currentDate));

                // Create breakfast meal
                if (breakfastDishes.length > 0) {
                    const breakfastTemplate = getRandomElement(
                        mealTemplates.filter(m => m.type === 'breakfast')
                    );
                    
                    // Find matching dishes
                    const matchingDishes = breakfastDishes.filter(dish =>
                        breakfastTemplate.dishNames.some(name => 
                            dish.name.toLowerCase().includes(name.toLowerCase())
                        )
                    );

                    if (matchingDishes.length > 0) {
                        const selectedDish = getRandomElement(matchingDishes);
                        try {
                            const mealId = await mealRepository.create({
                                id: 0,
                                name: breakfastTemplate.name,
                                startDate: formatDate(dayStart) as any,
                                endDate: formatDate(dayStart) as any,
                                dishIds: [selectedDish.id],
                                userId: user.id
                            });
                            userMealsAdded++;
                        } catch (error) {
                            console.error(`    ✗ Error creating breakfast meal for ${dayStart.toISOString()}:`, error);
                        }
                    }
                }

                // Create lunch meal (60% of days)
                if (lunchDinnerDishes.length > 0 && Math.random() < 0.6) {
                    const lunchTemplate = getRandomElement(
                        mealTemplates.filter(m => m.type === 'lunch')
                    );
                    
                    const matchingDishes = lunchDinnerDishes.filter(dish =>
                        lunchTemplate.dishNames.some(name => 
                            dish.name.toLowerCase().includes(name.toLowerCase())
                        )
                    );

                    if (matchingDishes.length === 0) {
                        // If no exact match, just pick a random lunch/dinner dish
                        const randomDish = getRandomElement(lunchDinnerDishes);
                        try {
                            const mealId = await mealRepository.create({
                                id: 0,
                                name: lunchTemplate.name,
                                startDate: formatDate(dayStart) as any,
                                endDate: formatDate(dayStart) as any,
                                dishIds: [randomDish.id],
                                userId: user.id
                            });
                            userMealsAdded++;
                        } catch (error) {
                            console.error(`    ✗ Error creating lunch meal for ${dayStart.toISOString()}:`, error);
                        }
                    } else {
                        const selectedDish = getRandomElement(matchingDishes);
                        try {
                            const mealId = await mealRepository.create({
                                id: 0,
                                name: lunchTemplate.name,
                                startDate: formatDate(dayStart) as any,
                                endDate: formatDate(dayStart) as any,
                                dishIds: [selectedDish.id],
                                userId: user.id
                            });
                            userMealsAdded++;
                        } catch (error) {
                            console.error(`    ✗ Error creating lunch meal for ${dayStart.toISOString()}:`, error);
                        }
                    }
                }

                // Create dinner meal (90% of days)
                if (lunchDinnerDishes.length > 0 && Math.random() < 0.9) {
                    const dinnerTemplate = getRandomElement(
                        mealTemplates.filter(m => m.type === 'dinner')
                    );
                    
                    const matchingDishes = lunchDinnerDishes.filter(dish =>
                        dinnerTemplate.dishNames.some(name => 
                            dish.name.toLowerCase().includes(name.toLowerCase())
                        )
                    );

                    if (matchingDishes.length === 0) {
                        // If no exact match, just pick a random lunch/dinner dish
                        const randomDish = getRandomElement(lunchDinnerDishes);
                        try {
                            const mealId = await mealRepository.create({
                                id: 0,
                                name: dinnerTemplate.name,
                                startDate: formatDate(dayStart) as any,
                                endDate: formatDate(dayStart) as any,
                                dishIds: [randomDish.id],
                                userId: user.id
                            });
                            userMealsAdded++;
                        } catch (error) {
                            console.error(`    ✗ Error creating dinner meal for ${dayStart.toISOString()}:`, error);
                        }
                    } else {
                        const selectedDish = getRandomElement(matchingDishes);
                        try {
                            const mealId = await mealRepository.create({
                                id: 0,
                                name: dinnerTemplate.name,
                                startDate: formatDate(dayStart) as any,
                                endDate: formatDate(dayStart) as any,
                                dishIds: [selectedDish.id],
                                userId: user.id
                            });
                            userMealsAdded++;
                        } catch (error) {
                            console.error(`    ✗ Error creating dinner meal for ${dayStart.toISOString()}:`, error);
                        }
                    }
                }

                // Move to next day
                currentDate.setDate(currentDate.getDate() + 1);
            }
            
            console.log(`  ✓ Added ${userMealsAdded} meals for ${user.username}\n`);
            totalMealsAdded += userMealsAdded;
        }

        console.log(`✓ Seeding complete! Added ${totalMealsAdded} meals total.`);
        console.log(`  Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
        await localDb.destroy();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding meals:', error);
        await localDb.destroy();
        process.exit(1);
    }
}

// Run the seed function
seedMeals();

