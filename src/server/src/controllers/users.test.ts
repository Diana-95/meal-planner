import express from 'express';
import bcrypt from 'bcrypt';
import { userRepository } from '../data';
import { User } from '../entity/user';

import { registerUserController } from './users';
import request from 'supertest';
import verifyToken from '../middleware/authMiddleware';
import protectedRoutes from '../middleware/protectedRoutes';

jest.mock('../data', () => ({
    userRepository: {
        create: jest.fn(),
        get: jest.fn(),
        getById: jest.fn(),
        update: jest.fn(),
        updatePart: jest.fn(),
        delete: jest.fn(),
        isUserExists: jest.fn(),
        findOne: jest.fn(),
    },
}));

jest.mock('../middleware/authMiddleware', () => {
  return {
    __esModule: true,
    default: jest.fn((req, res, next) => {
      req.user = { userId: 1, email: 'test@mail.com', username: 'tester' };
      next();
    }),
  };
});


describe('users controller', () => {
    const app = express();
    app.use(express.json());
    app.use('/api', protectedRoutes);
    registerUserController(app);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('register', async () => {
        (userRepository.create as jest.Mock).mockReturnValue(2);
        (userRepository.isUserExists as jest.Mock).mockReturnValue(false);
        const res = await request(app)
            .post('/register')
            .send({  username: 'username', password: 'pswd123456', email: 'email@mail.com' });
        expect(res.status).toBe(201);
        expect(res.body).toBe(2);

        expect(userRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                username: 'username',
                email: 'email@mail.com'
            })
        );
    });

    test('login', async () => {
        const pswdHash = await bcrypt.hash('pswd1234', 10);
        (userRepository.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            username: 'username',
            email: 'email@mail.com',
            password_hash: pswdHash
        } satisfies User);
        const res = await request(app)
            .post('/login')
            .send({ username: 'username', password: 'pswd1234' });
        expect(res.status).toBe(201);
        expect(res.body).toEqual(
           expect.objectContaining({
                id: 1,
                username: 'username',
                email: 'email@mail.com',
                password_hash: pswdHash
            })
        );
    });

    test('update user', async () => {
        (userRepository.update as jest.Mock).mockReturnValue(1);
        (userRepository.getById as jest.Mock).mockResolvedValue({
            id: 1,
            username: 'username',
            email: 'email@mail.com',
            password_hash: 'hashed_password'
        } satisfies User);
       
        const res = await request(app)
            .put('/api/me')
            .send({ username: 'new_username', password: 'pswd1234', email: 'email@gmail.com' });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true    
        });
        expect(verifyToken).toHaveBeenCalled(); // Or .toHaveBeenCalledWith(...)
        expect(userRepository.update).toHaveBeenCalledWith(
            expect.objectContaining({
                username: 'new_username',
                email: 'email@gmail.com'
            })
        );
    });

    test('update user partially', async () => {
        (userRepository.updatePart as jest.Mock).mockReturnValue(1);
        const res = await request(app)
            .patch('/api/me')
            .send({ username: 'new_username' });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true   
        });
        expect(verifyToken).toHaveBeenCalled(); // Or .toHaveBeenCalledWith(...)
        expect(userRepository.updatePart).toHaveBeenCalledWith(
            expect.objectContaining({
                username: 'new_username'
            })
        );
    });

    test('get user info', async () => {
        const res = await request(app)
            .get('/api/me');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            userId: 1, email: 'test@mail.com', username: 'tester'
        });
    });
});