import { UserRepository } from "./users";
import { User } from "../../entity/user";

describe('users db repository', () => {
    const userRepository = new UserRepository();


    beforeAll(async () => {
    

    // Clean up and seed
       });

    afterAll(async () => {
   
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('create user', async () => {
        const user: User = {
            id: 0,
            username: 'testuser',
            email: 'email@mail.com',
            password_hash: 'hashedpassword',
            role: 'user'
        };  
        userRepository.create(user);
    });
});