import "dotenv/config";
import { db } from "../data/knex-client";

async function checkProducts() {
    const localDb = db;

    try {
        // Get testUser
        const testUser = await localDb('Users')
            .where({ username: 'testUser' })
            .first();
        
        if (!testUser) {
            console.log('testUser not found');
            await db.destroy();
            process.exit(1);
        }

        console.log(`Found testUser with ID: ${testUser.id}\n`);

        // Get all products for testUser
        const products = await localDb('Products')
            .where('userId', testUser.id)
            .select('*')
            .orderBy('id', 'asc');

        console.log(`Total products for testUser: ${products.length}\n`);
        
        if (products.length > 0) {
            console.log('Products:');
            products.forEach((product, index) => {
                console.log(`${index + 1}. ID: ${product.id}, Name: ${product.name}, Measure: ${product.measure}, Price: ${product.price}`);
            });
        } else {
            console.log('No products found for testUser');
        }

        await localDb.destroy();
        process.exit(0);
    } catch (error) {
        console.error('Error checking products:', error);
        await localDb.destroy();
        process.exit(1);
    }
}

checkProducts();

