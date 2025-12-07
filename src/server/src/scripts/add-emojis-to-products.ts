import "dotenv/config";
import { ProductRepository } from "../data/repository/products";
import { db } from "../data/knex-client";

// Automatically assign emoji based on product name keywords
const getProductEmoji = (productName: string): string | null => {
    const name = productName.toLowerCase().trim();
    const words = name.split(/\s+/);
    
    // Category-based keyword matching (order matters - more specific first)
    const categoryKeywords: Array<{ keywords: string[]; emoji: string }> = [
        // Meats & Poultry
        { keywords: ['chicken', 'poultry'], emoji: '🍗' },
        { keywords: ['turkey'], emoji: '🦃' },
        { keywords: ['beef', 'steak', 'burger'], emoji: '🥩' },
        { keywords: ['pork', 'bacon', 'ham'], emoji: '🥓' },
        { keywords: ['lamb'], emoji: '🐑' },
        
        // Seafood
        { keywords: ['salmon', 'tuna', 'fish', 'cod', 'trout'], emoji: '🐟' },
        { keywords: ['shrimp', 'prawn', 'lobster', 'crab'], emoji: '🦐' },
        { keywords: ['oyster', 'clam', 'mussel'], emoji: '🦪' },
        
        // Dairy & Eggs
        { keywords: ['milk', 'cream'], emoji: '🥛' },
        { keywords: ['cheese'], emoji: '🧀' },
        { keywords: ['butter', 'margarine'], emoji: '🧈' },
        { keywords: ['yogurt', 'yoghurt'], emoji: '🥛' },
        { keywords: ['egg'], emoji: '🥚' },
        
        // Vegetables
        { keywords: ['tomato'], emoji: '🍅' },
        { keywords: ['onion'], emoji: '🧅' },
        { keywords: ['garlic'], emoji: '🧄' },
        { keywords: ['carrot'], emoji: '🥕' },
        { keywords: ['potato'], emoji: '🥔' },
        { keywords: ['lettuce', 'salad', 'cabbage'], emoji: '🥬' },
        { keywords: ['cucumber', 'pickle'], emoji: '🥒' },
        { keywords: ['bell pepper', 'pepper', 'capsicum'], emoji: '🫑' },
        { keywords: ['mushroom'], emoji: '🍄' },
        { keywords: ['spinach', 'kale'], emoji: '🥬' },
        { keywords: ['broccoli', 'cauliflower'], emoji: '🥦' },
        { keywords: ['corn'], emoji: '🌽' },
        { keywords: ['peas'], emoji: '🫛' },
        { keywords: ['bean'], emoji: '🫘' },
        
        // Fruits
        { keywords: ['lemon', 'lime'], emoji: '🍋' },
        { keywords: ['orange'], emoji: '🍊' },
        { keywords: ['apple'], emoji: '🍎' },
        { keywords: ['banana'], emoji: '🍌' },
        { keywords: ['berry', 'strawberry', 'blueberry'], emoji: '🫐' },
        { keywords: ['avocado'], emoji: '🥑' },
        { keywords: ['grape'], emoji: '🍇' },
        
        // Grains & Starches
        { keywords: ['rice'], emoji: '🍚' },
        { keywords: ['pasta', 'noodle', 'spaghetti'], emoji: '🍝' },
        { keywords: ['bread', 'roll', 'bagel'], emoji: '🍞' },
        { keywords: ['flour', 'wheat'], emoji: '🌾' },
        { keywords: ['oats', 'oatmeal'], emoji: '🌾' },
        
        // Spices & Seasonings
        { keywords: ['salt'], emoji: '🧂' },
        { keywords: ['pepper', 'chili', 'chilli'], emoji: '🌶️' },
        { keywords: ['herb', 'basil', 'oregano', 'parsley'], emoji: '🌿' },
        
        // Oils & Fats
        { keywords: ['oil', 'olive'], emoji: '🫒' },
        { keywords: ['vinegar'], emoji: '🫗' },
        
        // Sweets & Baking
        { keywords: ['sugar', 'honey', 'syrup'], emoji: '🍬' },
        { keywords: ['chocolate'], emoji: '🍫' },
        { keywords: ['cake', 'cookie', 'biscuit'], emoji: '🍰' },
        
        // Beverages
        { keywords: ['coffee', 'cafe', 'espresso'], emoji: '☕' },
        { keywords: ['tea'], emoji: '🫖' },
        { keywords: ['juice'], emoji: '🧃' },
        { keywords: ['water'], emoji: '💧' },
        
        // Snacks
        { keywords: ['crisp', 'chip', 'cracker'], emoji: '🍟' },
        { keywords: ['nut', 'almond', 'walnut', 'peanut'], emoji: '🥜' },
    ];
    
    // Check each category
    for (const category of categoryKeywords) {
        for (const keyword of category.keywords) {
            // Check if any word in the product name matches the keyword
            if (words.some(word => word.includes(keyword) || keyword.includes(word)) || 
                name.includes(keyword)) {
                return category.emoji;
            }
        }
    }
    
    // Return null for unknown products (don't assign default emoji)
    return null;
};

async function addEmojisToProducts() {
    const localDb = db;
    const productRepository = new ProductRepository();

    try {
        // Get all users
        const users = await localDb("Users").select("id", "username");
        
        if (users.length === 0) {
            console.log('No users found in the database.');
            await db.destroy();
            process.exit(1);
        }

        console.log(`Found ${users.length} user(s). Adding emojis to products...\n`);

        let totalUpdated = 0;

        for (const user of users) {
            console.log(`Processing products for user: ${user.username} (ID: ${user.id})`);
            
            // Get all products for this user that don't have emojis
            const products = await localDb("Products")
                .where('userId', user.id)
                .where(function() {
                    this.whereNull('emoji').orWhere('emoji', '');
                })
                .select('*');
            
            if (products.length === 0) {
                console.log(`  No products without emojis found for ${user.username}\n`);
                continue;
            }

            let userUpdated = 0;
            for (const product of products) {
                const emoji = getProductEmoji(product.name);
                
                if (emoji) {
                    try {
                        await productRepository.updatePatch(
                            { id: product.id, emoji },
                            user.id
                        );
                        console.log(`  ✓ "${product.name}" → ${emoji}`);
                        userUpdated++;
                    } catch (error) {
                        console.error(`  ✗ Error updating "${product.name}":`, error);
                    }
                } else {
                    console.log(`  - "${product.name}" → No matching emoji found`);
                }
            }
            
            console.log(`  ✓ Updated ${userUpdated} products for ${user.username}\n`);
            totalUpdated += userUpdated;
        }

        console.log(`✓ Complete! Updated ${totalUpdated} products total with emojis.`);
        await localDb.destroy();
        process.exit(0);
    } catch (error) {
        console.error('Error adding emojis to products:', error);
        await localDb.destroy();
        process.exit(1);
    }
}

// Run the script
addEmojisToProducts();

