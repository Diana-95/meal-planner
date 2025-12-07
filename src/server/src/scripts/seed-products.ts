import "dotenv/config";
import { ProductRepository } from "../data/repository/products";
import { Product } from "../entity/product";
import { db } from "../data/knex-client";

// Sample products to add
const sampleProducts: Omit<Product, 'id' | 'userId'>[] = [
    { name: 'Chicken Breast', measure: 'kg', price: 8.99 },
    { name: 'Ground Beef', measure: 'kg', price: 12.99 },
    { name: 'Salmon Fillet', measure: 'kg', price: 18.99 },
    { name: 'Eggs', measure: 'piece', price: 0.25 },
    { name: 'Milk', measure: 'piece', price: 3.49 },
    { name: 'Butter', measure: 'piece', price: 4.99 },
    { name: 'Cheese', measure: 'kg', price: 9.99 },
    { name: 'Tomatoes', measure: 'kg', price: 4.99 },
    { name: 'Onions', measure: 'kg', price: 2.99 },
    { name: 'Garlic', measure: 'piece', price: 0.50 },
    { name: 'Carrots', measure: 'kg', price: 2.49 },
    { name: 'Potatoes', measure: 'kg', price: 2.99 },
    { name: 'Rice', measure: 'kg', price: 5.99 },
    { name: 'Pasta', measure: 'kg', price: 3.99 },
    { name: 'Olive Oil', measure: 'piece', price: 8.99 },
    { name: 'Salt', measure: 'piece', price: 1.99 },
    { name: 'Black Pepper', measure: 'piece', price: 2.99 },
    { name: 'Flour', measure: 'kg', price: 3.49 },
    { name: 'Sugar', measure: 'kg', price: 4.99 },
    { name: 'Bread', measure: 'piece', price: 2.99 },
    { name: 'Lettuce', measure: 'piece', price: 2.49 },
    { name: 'Cucumber', measure: 'piece', price: 1.49 },
    { name: 'Bell Pepper', measure: 'kg', price: 5.99 },
    { name: 'Mushrooms', measure: 'kg', price: 7.99 },
    { name: 'Spinach', measure: 'kg', price: 4.99 },
    { name: 'Broccoli', measure: 'kg', price: 4.49 },
    { name: 'Chicken Thighs', measure: 'kg', price: 7.99 },
    { name: 'Pork Chops', measure: 'kg', price: 11.99 },
    { name: 'Shrimp', measure: 'kg', price: 19.99 },
    { name: 'Lemon', measure: 'piece', price: 0.75 },
];

async function seedProducts() {
    const localDb = db;
    const productRepository = new ProductRepository();

    try {
        // Get all users from the database
        const users = await localDb('Users').select('id', 'username');
        
        if (users.length === 0) {
            console.log('No users found in the database. Please create a user first.');
            await db.destroy();
            process.exit(1);
        }

        console.log(`Found ${users.length} user(s). Adding products for each user...\n`);

        let totalProductsAdded = 0;

        for (const user of users) {
            console.log(`Adding products for user: ${user.username} (ID: ${user.id})`);
            
            let userProductsAdded = 0;
            for (const product of sampleProducts) {
                try {
                    // Check if product already exists for this user
                    const existing = await localDb('Products')
                        .where({ name: product.name, userId: user.id })
                        .first();
                    
                    if (!existing) {
                        await productRepository.create({
                            ...product,
                            id: 0, // Will be auto-generated
                            userId: user.id
                        });
                        userProductsAdded++;
                    }
                } catch (error) {
                    console.error(`Error adding product "${product.name}" for user ${user.username}:`, error);
                }
            }
            
            console.log(`  ✓ Added ${userProductsAdded} new products for ${user.username}`);
            totalProductsAdded += userProductsAdded;
        }

        console.log(`\n✓ Seeding complete! Added ${totalProductsAdded} products total.`);
        await localDb.destroy();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding products:', error);
        await localDb.destroy();
        process.exit(1);
    }
}

// Run the seed function
seedProducts();

