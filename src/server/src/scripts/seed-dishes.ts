import "dotenv/config";
import { DishRepository } from "../data/repository/dishes";
import { IngredientRepository } from "../data/repository/ingredients";
import { Dish } from "../entity/dish";
import { db } from "../data/knex-client";

// Sample dishes with recipes and ingredients
interface DishSeedData {
    name: string;
    recipe: string;
    imageUrl: string;
    ingredients: Array<{ productName: string; quantity: number }>;
}

const sampleDishes: DishSeedData[] = [
    {
        name: 'Grilled Chicken Breast',
        recipe: '1. Season chicken breast with salt and pepper. 2. Heat grill to medium-high. 3. Grill chicken for 6-7 minutes per side until internal temperature reaches 165°F. 4. Let rest for 5 minutes before serving.',
        imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400',
        ingredients: [
            { productName: 'Chicken Breast', quantity: 0.5 },
            { productName: 'Salt', quantity: 1 },
            { productName: 'Black Pepper', quantity: 1 },
            { productName: 'Olive Oil', quantity: 1 }
        ]
    },
    {
        name: 'Spaghetti Carbonara',
        recipe: '1. Cook pasta according to package directions. 2. In a pan, cook diced bacon until crispy. 3. Whisk eggs and cheese together. 4. Drain pasta, reserving some pasta water. 5. Toss hot pasta with bacon, then quickly mix in egg mixture off heat. 6. Add pasta water if needed for creaminess. Serve immediately.',
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
        ingredients: [
            { productName: 'Pasta', quantity: 0.5 },
            { productName: 'Eggs', quantity: 4 },
            { productName: 'Cheese', quantity: 0.2 },
            { productName: 'Black Pepper', quantity: 1 }
        ]
    },
    {
        name: 'Caesar Salad',
        recipe: '1. Wash and chop lettuce into bite-sized pieces. 2. Make dressing: mix olive oil, lemon juice, garlic, and parmesan. 3. Toss lettuce with dressing. 4. Add croutons and additional parmesan. 5. Serve immediately.',
        imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
        ingredients: [
            { productName: 'Lettuce', quantity: 1 },
            { productName: 'Cheese', quantity: 0.1 },
            { productName: 'Lemon', quantity: 1 },
            { productName: 'Olive Oil', quantity: 1 },
            { productName: 'Garlic', quantity: 2 }
        ]
    },
    {
        name: 'Beef Stir Fry',
        recipe: '1. Slice beef into thin strips. 2. Heat oil in a wok or large pan. 3. Stir-fry beef until browned, remove. 4. Add vegetables (bell peppers, carrots, mushrooms) and stir-fry. 5. Return beef to pan, add soy sauce and seasonings. 6. Serve over rice.',
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
        ingredients: [
            { productName: 'Ground Beef', quantity: 0.5 },
            { productName: 'Bell Pepper', quantity: 0.3 },
            { productName: 'Carrots', quantity: 0.2 },
            { productName: 'Mushrooms', quantity: 0.2 },
            { productName: 'Rice', quantity: 0.3 },
            { productName: 'Onions', quantity: 0.1 }
        ]
    },
    {
        name: 'Roasted Salmon with Vegetables',
        recipe: '1. Preheat oven to 400°F. 2. Place salmon fillet on a baking sheet. 3. Arrange vegetables (broccoli, carrots, potatoes) around salmon. 4. Drizzle with olive oil, season with salt and pepper. 5. Roast for 15-20 minutes until salmon flakes easily. 6. Serve hot.',
        imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
        ingredients: [
            { productName: 'Salmon Fillet', quantity: 0.4 },
            { productName: 'Broccoli', quantity: 0.3 },
            { productName: 'Carrots', quantity: 0.2 },
            { productName: 'Potatoes', quantity: 0.3 },
            { productName: 'Olive Oil', quantity: 1 },
            { productName: 'Lemon', quantity: 1 }
        ]
    },
    {
        name: 'Vegetable Pasta',
        recipe: '1. Cook pasta until al dente. 2. In a pan, sauté garlic and onions in olive oil. 3. Add tomatoes, bell peppers, and mushrooms. 4. Cook until vegetables are tender. 5. Toss with pasta, add salt and pepper. 6. Top with cheese and serve.',
        imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400',
        ingredients: [
            { productName: 'Pasta', quantity: 0.4 },
            { productName: 'Tomatoes', quantity: 0.3 },
            { productName: 'Bell Pepper', quantity: 0.2 },
            { productName: 'Mushrooms', quantity: 0.2 },
            { productName: 'Onions', quantity: 0.1 },
            { productName: 'Garlic', quantity: 2 },
            { productName: 'Cheese', quantity: 0.1 },
            { productName: 'Olive Oil', quantity: 1 }
        ]
    },
    {
        name: 'Chicken and Rice Bowl',
        recipe: '1. Cook rice according to package directions. 2. Season and cook chicken breast, then slice. 3. Steam or sauté vegetables (broccoli, carrots). 4. Assemble bowl with rice, chicken, and vegetables. 5. Drizzle with sauce if desired.',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        ingredients: [
            { productName: 'Chicken Breast', quantity: 0.3 },
            { productName: 'Rice', quantity: 0.3 },
            { productName: 'Broccoli', quantity: 0.2 },
            { productName: 'Carrots', quantity: 0.2 }
        ]
    },
    {
        name: 'Mushroom Risotto',
        recipe: '1. Heat broth in a separate pot. 2. Sauté mushrooms and onions. 3. Add rice, toast for 1 minute. 4. Add warm broth one ladle at a time, stirring constantly. 5. Continue until rice is creamy and tender. 6. Stir in butter and cheese. Serve hot.',
        imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400',
        ingredients: [
            { productName: 'Rice', quantity: 0.4 },
            { productName: 'Mushrooms', quantity: 0.3 },
            { productName: 'Onions', quantity: 0.1 },
            { productName: 'Butter', quantity: 1 },
            { productName: 'Cheese', quantity: 0.1 }
        ]
    },
    {
        name: 'Greek Salad',
        recipe: '1. Chop tomatoes, cucumber, and bell peppers. 2. Slice red onion thinly. 3. Combine vegetables in a bowl. 4. Add olives and feta cheese. 5. Drizzle with olive oil and lemon juice. 6. Season with salt and pepper. Toss and serve.',
        imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
        ingredients: [
            { productName: 'Tomatoes', quantity: 0.4 },
            { productName: 'Cucumber', quantity: 1 },
            { productName: 'Bell Pepper', quantity: 0.2 },
            { productName: 'Onions', quantity: 0.1 },
            { productName: 'Cheese', quantity: 0.1 },
            { productName: 'Olive Oil', quantity: 1 },
            { productName: 'Lemon', quantity: 1 }
        ]
    },
    {
        name: 'Beef Tacos',
        recipe: '1. Cook ground beef with onions and seasonings until browned. 2. Warm taco shells or tortillas. 3. Prepare toppings: lettuce, tomatoes, cheese. 4. Fill shells with beef. 5. Add toppings and serve with salsa.',
        imageUrl: 'https://images.unsplash.com/photo-1565299585323-38174c3d6a3e?w=400',
        ingredients: [
            { productName: 'Ground Beef', quantity: 0.4 },
            { productName: 'Onions', quantity: 0.1 },
            { productName: 'Lettuce', quantity: 1 },
            { productName: 'Tomatoes', quantity: 0.2 },
            { productName: 'Cheese', quantity: 0.1 }
        ]
    },
    {
        name: 'Berry Smoothie',
        recipe: '1. Combine milk, frozen berries, and a touch of sugar in a blender. 2. Blend until smooth and creamy. 3. Add ice if desired for a thicker consistency. 4. Pour into a glass and serve immediately. Garnish with fresh berries if available.',
        imageUrl: 'https://images.unsplash.com/photo-1553530979-2b5c1c85b51b?w=400',
        ingredients: [
            { productName: 'Milk', quantity: 1 },
            { productName: 'Sugar', quantity: 0.05 },
            { productName: 'Lemon', quantity: 0.5 }
        ]
    },
    {
        name: 'Green Smoothie',
        recipe: '1. Blend spinach, cucumber, and lemon juice with milk. 2. Add a touch of sugar or honey for sweetness. 3. Blend until completely smooth. 4. Pour into a glass and enjoy immediately for maximum freshness.',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        ingredients: [
            { productName: 'Spinach', quantity: 0.2 },
            { productName: 'Cucumber', quantity: 1 },
            { productName: 'Milk', quantity: 1 },
            { productName: 'Lemon', quantity: 0.5 },
            { productName: 'Sugar', quantity: 0.05 }
        ]
    },
    {
        name: 'Shakshuka',
        recipe: '1. Heat olive oil in a skillet over medium heat. 2. Sauté onions and bell peppers until softened. 3. Add garlic and tomatoes, cook until tomatoes break down. 4. Season with salt and pepper. 5. Make wells in the sauce and crack eggs into them. 6. Cover and cook until eggs are set to your preference. 7. Garnish with fresh herbs and serve with bread.',
        imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400',
        ingredients: [
            { productName: 'Tomatoes', quantity: 0.4 },
            { productName: 'Onions', quantity: 0.1 },
            { productName: 'Bell Pepper', quantity: 0.2 },
            { productName: 'Garlic', quantity: 2 },
            { productName: 'Eggs', quantity: 4 },
            { productName: 'Olive Oil', quantity: 1 },
            { productName: 'Salt', quantity: 1 },
            { productName: 'Black Pepper', quantity: 1 }
        ]
    },
    {
        name: 'Eggs Benedict',
        recipe: '1. Toast bread slices. 2. Poach eggs until whites are set but yolks are still runny. 3. Prepare hollandaise sauce: melt butter, whisk with lemon juice and egg yolks over gentle heat. 4. Place a slice of bread on a plate, top with cheese, add a poached egg. 5. Drizzle with hollandaise sauce. 6. Season with salt and pepper. Serve immediately.',
        imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400',
        ingredients: [
            { productName: 'Eggs', quantity: 4 },
            { productName: 'Bread', quantity: 2 },
            { productName: 'Butter', quantity: 2 },
            { productName: 'Lemon', quantity: 1 },
            { productName: 'Cheese', quantity: 0.1 },
            { productName: 'Salt', quantity: 1 },
            { productName: 'Black Pepper', quantity: 1 }
        ]
    },
    {
        name: 'Scrambled Eggs with Vegetables',
        recipe: '1. Dice bell peppers, onions, and mushrooms. 2. Sauté vegetables in butter until tender. 3. Whisk eggs with salt and pepper. 4. Pour eggs into the pan with vegetables. 5. Cook over medium-low heat, gently stirring until eggs are creamy and set. 6. Serve hot with toast.',
        imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
        ingredients: [
            { productName: 'Eggs', quantity: 4 },
            { productName: 'Bell Pepper', quantity: 0.2 },
            { productName: 'Onions', quantity: 0.1 },
            { productName: 'Mushrooms', quantity: 0.2 },
            { productName: 'Butter', quantity: 1 },
            { productName: 'Salt', quantity: 1 },
            { productName: 'Black Pepper', quantity: 1 }
        ]
    },
    {
        name: 'French Toast',
        recipe: '1. Whisk eggs, milk, and a pinch of sugar together in a shallow bowl. 2. Dip bread slices in the egg mixture, coating both sides. 3. Melt butter in a pan over medium heat. 4. Cook bread slices until golden brown on each side. 5. Serve with a drizzle of maple syrup or fresh fruit.',
        imageUrl: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400',
        ingredients: [
            { productName: 'Bread', quantity: 4 },
            { productName: 'Eggs', quantity: 3 },
            { productName: 'Milk', quantity: 1 },
            { productName: 'Butter', quantity: 1 },
            { productName: 'Sugar', quantity: 0.05 }
        ]
    },
    {
        name: 'Pancakes',
        recipe: '1. Mix flour, sugar, and salt in a bowl. 2. In another bowl, whisk eggs and milk together. 3. Combine wet and dry ingredients, mixing until just combined. 4. Melt butter in a pan over medium heat. 5. Pour batter to form pancakes, cook until bubbles form on top. 6. Flip and cook until golden brown. Serve with butter and syrup.',
        imageUrl: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400',
        ingredients: [
            { productName: 'Flour', quantity: 0.3 },
            { productName: 'Eggs', quantity: 2 },
            { productName: 'Milk', quantity: 1 },
            { productName: 'Sugar', quantity: 0.1 },
            { productName: 'Butter', quantity: 1 },
            { productName: 'Salt', quantity: 1 }
        ]
    },
    {
        name: 'Avocado Toast',
        recipe: '1. Toast bread slices until golden. 2. Mash avocado with lemon juice, salt, and pepper. 3. Spread the avocado mixture on toast. 4. Top with a poached or fried egg if desired. 5. Garnish with additional black pepper and serve immediately.',
        imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400',
        ingredients: [
            { productName: 'Bread', quantity: 2 },
            { productName: 'Eggs', quantity: 2 },
            { productName: 'Lemon', quantity: 0.5 },
            { productName: 'Salt', quantity: 1 },
            { productName: 'Black Pepper', quantity: 1 }
        ]
    },
    {
        name: 'Vegetable Omelet',
        recipe: '1. Dice mushrooms, bell peppers, and onions. 2. Sauté vegetables in butter until tender. 3. Whisk eggs with salt and pepper. 4. Pour eggs into the pan, tilting to spread evenly. 5. When bottom is set, add cheese and vegetables to one half. 6. Fold the other half over and cook until cheese melts. Serve hot.',
        imageUrl: 'https://images.unsplash.com/photo-1612927654023-3c550dccff35?w=400',
        ingredients: [
            { productName: 'Eggs', quantity: 3 },
            { productName: 'Mushrooms', quantity: 0.2 },
            { productName: 'Bell Pepper', quantity: 0.2 },
            { productName: 'Onions', quantity: 0.1 },
            { productName: 'Cheese', quantity: 0.1 },
            { productName: 'Butter', quantity: 1 },
            { productName: 'Salt', quantity: 1 },
            { productName: 'Black Pepper', quantity: 1 }
        ]
    },
    {
        name: 'Greek Yogurt Parfait',
        recipe: '1. Layer yogurt in a glass or bowl. 2. Add fresh fruits if available (tomatoes for a savory version or berries for sweet). 3. Drizzle with honey or add a touch of sugar. 4. Top with nuts if desired. 5. Repeat layers. 6. Serve chilled for a refreshing breakfast.',
        imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
        ingredients: [
            { productName: 'Milk', quantity: 1 },
            { productName: 'Sugar', quantity: 0.05 },
            { productName: 'Lemon', quantity: 0.5 }
        ]
    }
];

async function seedDishes() {
    const localDb = db;
    const dishRepository = new DishRepository();
    const ingredientRepository = new IngredientRepository();

    try {
        // Get all users from the database
        const users = await localDb('Users').select('id', 'username');
        
        if (users.length === 0) {
            console.log('No users found in the database. Please create a user first.');
            await db.destroy();
            process.exit(1);
        }

        console.log(`Found ${users.length} user(s). Adding dishes for each user...\n`);

        let totalDishesAdded = 0;

        for (const user of users) {
            console.log(`Adding dishes for user: ${user.username} (ID: ${user.id})`);
            
            let userDishesAdded = 0;
            for (const dishData of sampleDishes) {
                try {
                    // Check if dish already exists for this user
                    const existing = await localDb('Dishes')
                        .where({ name: dishData.name, userId: user.id })
                        .first();
                    
                    if (existing) {
                        continue; // Skip if dish already exists
                    }

                    // Create the dish
                    const dishId = await dishRepository.create({
                        id: 0,
                        name: dishData.name,
                        recipe: dishData.recipe,
                        imageUrl: dishData.imageUrl,
                        userId: user.id,
                        ingredientList: []
                    });

                    // Add ingredients for this dish
                    let ingredientsAdded = 0;
                    for (const ingredientData of dishData.ingredients) {
                        // Find the product by name for this user
                        const product = await localDb('Products')
                            .where({ name: ingredientData.productName, userId: user.id })
                            .first();
                        
                        if (product) {
                            await ingredientRepository.create({
                                id: 0,
                                productId: product.id,
                                dishId: dishId,
                                quantity: ingredientData.quantity
                            });
                            ingredientsAdded++;
                        } else {
                            console.log(`    ⚠ Product "${ingredientData.productName}" not found for user ${user.username}, skipping ingredient`);
                        }
                    }

                    if (ingredientsAdded > 0) {
                        userDishesAdded++;
                        console.log(`    ✓ Added "${dishData.name}" with ${ingredientsAdded} ingredients`);
                    } else {
                        // If no ingredients were added, delete the dish
                        await localDb('Dishes').where('id', dishId).del();
                        console.log(`    ⚠ Skipped "${dishData.name}" - no matching products found`);
                    }
                } catch (error) {
                    console.error(`    ✗ Error adding dish "${dishData.name}" for user ${user.username}:`, error);
                }
            }
            
            console.log(`  ✓ Added ${userDishesAdded} new dishes for ${user.username}\n`);
            totalDishesAdded += userDishesAdded;
        }

        console.log(`✓ Seeding complete! Added ${totalDishesAdded} dishes total.`);
        await localDb.destroy();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding dishes:', error);
        await localDb.destroy();
        process.exit(1);
    }
}

// Run the seed function
seedDishes();

