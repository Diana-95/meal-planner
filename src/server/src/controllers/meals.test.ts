import express from 'express';
import request from 'supertest';
import { registerMealController } from './meals';
import { mealRepository } from '../data';

jest.mock('../data', () => ({
    mealRepository: {
        create: jest.fn(),
        get: jest.fn(),
        getById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));
jest.mock('./utils', () => ({
    getUser: jest.fn().mockReturnValue({
        userId: 1,
        username: 'testuser',
        email: ''
    })
}));
describe('meals controller', () => {
    const app = express();
    app.use(express.json());
    registerMealController(app);

    beforeEach(() => {
        jest.clearAllMocks();
    }
    );
    test('create new meal', async () => {
        (mealRepository.create as jest.Mock).mockReturnValue(2);
        const res = await request(app)
            .post('/api/meals')
            .send({ name: 'Breakfast', startDate: '2023-10-01T08:00:00Z', endDate: '2023-10-01T09:00:00Z', dishId: 1 });
        expect(res.status).toBe(201);
        expect(res.body.rowID).toBe(2);
        expect(mealRepository.create).toHaveBeenCalledWith({
            id: 0,
            name: 'Breakfast',
            startDate: '2023-10-01T08:00:00Z',
            endDate: '2023-10-01T09:00:00Z',
            dishId: 1,
            userId: 1
        });
    }
    );
    test('get all meals', async () => {
        (mealRepository.get as jest.Mock).mockResolvedValue([
            { id: 1, name: 'Breakfast', startDate: '2023-10-01T08:00:00Z', endDate: '2023-10-01T09:00:00Z', dishId: 1, userId: 1 },
            { id: 2, name: 'Lunch', startDate: '2023-10-01T12:00:00Z', endDate: '2023-10-01T13:00:00Z', dishId: 2, userId: 1 }
        ]);
        const res = await request(app)
            .get('/api/meals')
            .query({ cursor: 0, limit: 10 });
        expect(res.status).toBe(200);
        expect(res.body).toEqual([
            { id: 1, name: 'Breakfast', startDate: '2023-10-01T08:00:00Z', endDate: '2023-10-01T09:00:00Z', dishId: 1, userId: 1 },
            { id: 2, name: 'Lunch', startDate: '2023-10-01T12:00:00Z', endDate: '2023-10-01T13:00:00Z', dishId: 2, userId: 1 }
        ]);
    }
    );
    test('get meal by id', async () => {
        (mealRepository.getById as jest.Mock).mockResolvedValue({
            id: 1,
            name: 'Breakfast',
            startDate: '2023-10-01T08:00:00Z',
            endDate: '2023-10-01T09:00:00Z',
            dishId: 1,
            userId: 1
        });
        const res = await request(app)
            .get('/api/meals/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            id: 1,
            name: 'Breakfast',
            startDate: '2023-10-01T08:00:00Z',
            endDate: '2023-10-01T09:00:00Z',
            dishId: 1,
            userId: 1
        });
    }
    );
    test('update meal by id', async () => {
        (mealRepository.update as jest.Mock).mockResolvedValue(1);
        const res = await request(app)
            .put('/api/meals/1')
            .send({ name: 'Updated Breakfast', startDate: '2023-10-01T08:00:00Z', endDate: '2023-10-01T09:00:00Z', dishId: 1 });
        expect(res.status).toBe(200);
        expect(mealRepository.update).toHaveBeenCalledWith({
            id: 1,
            name: 'Updated Breakfast',
            startDate: '2023-10-01T08:00:00Z',
            endDate: '2023-10-01T09:00:00Z',
            dishId: 1,
            userId: 1
        });
    }
    );
});