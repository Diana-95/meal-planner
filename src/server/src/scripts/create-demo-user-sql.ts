import "dotenv/config";
import bcrypt from 'bcrypt';
import { db } from "../data/knex-client";

async function createDemoUserSQL() {
    try {
        // Check if demo user already exists
        const existing = await db('Users').where({ username: 'demo' }).first();
        
        if (existing) {
            console.log(`✓ Demo user already exists (ID: ${existing.id})`);
            // Update password
            const hashedPassword = await bcrypt.hash('demo123', 10);
            await db('Users')
                .where({ username: 'demo' })
                .update({ password_hash: hashedPassword });
            console.log('✓ Updated demo user password to: demo123');
        } else {
            console.log('Creating demo user...');
            const hashedPassword = await bcrypt.hash('demo123', 10);
            const [inserted] = await db('Users')
                .insert({
                    username: 'demo',
                    email: 'demo@mealplanner.com',
                    password_hash: hashedPassword,
                    role: 'user'
                })
                .returning('id');
            
            const userId = typeof inserted === 'number' ? inserted : inserted.id;
            console.log(`✓ Created demo user (ID: ${userId})`);
            console.log(`  Username: demo`);
            console.log(`  Password: demo123`);
        }

        console.log('\n✓ Demo user is ready!');
        await db.destroy();
        process.exit(0);
    } catch (error) {
        console.error('✗ Error creating demo user:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        await db.destroy();
        process.exit(1);
    }
}

// Run the function
createDemoUserSQL();
