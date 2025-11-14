import express from 'express';
import { registerIngredientController } from './ingredients';
import request from 'supertest';
import { ingredientRepository } from '../data';
import { IngredientInput } from '../data/repository/ingredients';

jest.mock('../data', () => ({
    ingredientRepository: {
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
describe('ingredients controller', () => {
    const app = express();
    app.use(express.json());
    registerIngredientController(app);
    beforeEach(() => {
        jest.clearAllMocks();
    }
    );
    const API = '/api/ingredients';

    test('create new ingredient', async () => {
        (ingredientRepository.create as jest.Mock).mockReturnValue(2);
        const res = await request(app)
            .post(API)
            .send({ productId: 5, dishId: 3, quantity: 100 });
        expect(res.status).toBe(201);
        expect(res.body.rowID).toBe(2);
        const expectedIngredient = {
            productId: 5,
            dishId: 3,
            quantity: 100
        };
        expect(ingredientRepository.create).toHaveBeenCalledWith(expectedIngredient);
    }
    );
    test('get all ingredients', async () => {
        (ingredientRepository.get as jest.Mock).mockResolvedValue([
            { id: 1, name: 'Ingredient1', measure: 'kg', price: 100 },
            { id: 2, name: 'Ingredient2', measure: 'kg', price: 200 }
        ]);
        const res = await request(app)
            .get(API)
            .query({ searchName: "Ingredient", cursor: 0, limit: 10 });
        expect(res.status).toBe(200);
        expect(res.body).toEqual([
            { id: 1, name: 'Ingredient1', measure: 'kg', price: 100 },
            { id: 2, name: 'Ingredient2', measure: 'kg', price: 200 }
        ]);
    }
    );
    test('get ingredient by id', async () => {  
        (ingredientRepository.getById as jest.Mock).mockResolvedValue({
            id: 1,
            name: 'Ingredient1',
            measure: 'kg',
            price: 100
        });
        const res = await request(app)
            .get(`${API}/1`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            id: 1,
            name: 'Ingredient1',
            measure: 'kg',
            price: 100
        });
    }
    );

    test('update ingredient by id', async () => {
        (ingredientRepository.update as jest.Mock).mockResolvedValue(1);
        const res = await request(app)
            .put(`${API}/1`)
            .send({ productId: 5, dishId: 3, quantity: 150 });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        const expectedIngredient: IngredientInput = {
            id: 1,
            productId: 5,
            dishId: 3,
            quantity: 150
        };
        expect(ingredientRepository.update).toHaveBeenCalledWith(expectedIngredient);
    }
    );
    test('delete ingredient by id', async () => {
        (ingredientRepository.delete as jest.Mock).mockResolvedValue(1);
        const res = await request(app)
            .delete(`${API}/1`);
        expect(res.status).toBe(204);
        expect(ingredientRepository.delete).toHaveBeenCalledWith(1);
    }
    );
    test('get ingredient by id with user', async () => {
        (ingredientRepository.getById as jest.Mock).mockResolvedValue({
            id: 1,
            productId: 5,
            dishId: 3,
            quantity: 100
        });
        const res = await request(app)
            .get(`${API}/1`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            id: 1,
            productId: 5,
            dishId: 3,
            quantity: 100
        });
    }
    );
    test('create ingredient with missing fields', async () => {
        const res = await request(app)
            .post(API)
            .send({ productId: 5, quantity: 100 }); // Missing dishId
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    }
    );
});