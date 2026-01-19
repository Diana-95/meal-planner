import "dotenv/config";
import bcrypt from 'bcrypt';
import { UserRepository } from "../data/repository/users";
import { User } from "../entity/user";
import { db } from "../data/knex-client";

async function createDemoUser() {
    const userRepository = new UserRepository();

    try {
        // Check if demo user already exists
        let demoUser = await userRepository.findOne('demo');
        
        if (!demoUser) {
            console.log('Creating demo user...');
            const hashedPassword = await bcrypt.hash('demo123', 10);
            const user: User = {
                id: 0,
                username: 'demo',
                email: 'demo@mealplanner.com',
                password_hash: hashedPassword
            };
            const userId = await userRepository.create(user);
            demoUser = await userRepository.getById(userId);
            console.log(`✓ Created demo user (ID: ${userId})`);
            console.log(`  Username: demo`);
            console.log(`  Password: demo123`);
        } else {
            console.log(`✓ Demo user already exists (ID: ${demoUser.id})`);
            // Update password to ensure it's correct
            console.log('Updating demo user password...');
            const hashedPassword = await bcrypt.hash('demo123', 10);
            await userRepository.updatePart({
                id: demoUser.id,
                password_hash: hashedPassword
            });
            console.log('✓ Updated demo user password to: demo123');
        }

        console.log('\n✓ Demo user is ready!');
        await db.destroy();
        process.exit(0);
    } catch (error) {
        console.error('✗ Error creating demo user:', error);
        await db.destroy();
        process.exit(1);
    }
}

// Run the function
createDemoUser();
