import express from 'express';
import request from 'supertest';

import { dishRepository } from "../data";
import { registerDishController } from "./dishes";

// Import Jest globals for TypeScript


// Mock dependencies
jest.mock("../data", () => ({
    dishRepository: {
        create: jest.fn(),
        get: jest.fn(),
        getById: jest.fn(),
        update: jest.fn(),
        updatePatch: jest.fn(),
        delete: jest.fn(),
    },
}));
jest.mock("./utils", () => ({
    getUser: jest.fn().mockReturnValue({
        userId: 1,
        username: "testuser",
        email: ""
    })
}));

describe("dishes controller", () => {
    const app = express();
    app.use(express.json());
    registerDishController(app);

    jest.mock('../data');
    beforeEach(() => {
        jest.clearAllMocks();
    }
    );
    test("create new dish", async () => {   
        (dishRepository.create as jest.Mock).mockResolvedValue(2);

        const res = await request(app)
            .post("/api/dishes")
            .send({ name: 'Pizza', recipe: 'Tomato, Cheese', imageUrl: 'http://example.com/pizza.jpg' });

        expect(res.status).toBe(201);
        expect(res.body.rowID).toBe(2);

    });

    test("get all dishes", async () => {
        (dishRepository.get as jest.Mock).mockResolvedValue([
            { id: 1, name: 'Pizza', recipe: 'Tomato, Cheese', imageUrl: 'http://example.com/pizza.jpg' },
            { id: 2, name: 'Pasta', recipe: 'Noodles, Sauce', imageUrl: 'http://example.com/pasta.jpg' }
        ]);

        const res = await request(app)
            .get("/api/dishes")
            .query({ searchName: "Pizza", cursor: 0, limit: 10 });

        expect(res.status).toBe(200);
        expect(res.body).toEqual([
            { id: 1, name: 'Pizza', recipe: 'Tomato, Cheese', imageUrl: 'http://example.com/pizza.jpg' },
            { id: 2, name: 'Pasta', recipe: 'Noodles, Sauce', imageUrl: 'http://example.com/pasta.jpg' }
        ]);
    });

    test("get dish by id", async () => {
        (dishRepository.getById as jest.Mock).mockResolvedValue({
            id: 1,
            name: 'Pizza',
            recipe: 'Tomato, Cheese',
            imageUrl: 'http://example.com/pizza.jpg'
        });

        const res = await request(app)
            .get("/api/dishes/1");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            id: 1,
            name: 'Pizza',
            recipe: 'Tomato, Cheese',
            imageUrl: 'http://example.com/pizza.jpg'
        });
    });
    test("update dish", async () => {
        (dishRepository.update as jest.Mock).mockResolvedValue(1);

        const res = await request(app)
            .put("/api/dishes/1")
            .send({ name: 'Updated Pizza', recipe: 'Updated Recipe', imageUrl: 'http://example.com/updated_pizza.jpg' });

        expect(res.status).toBe(200);
        expect(dishRepository.update).toHaveBeenCalledWith(
            {
                id: 1,
                name: 'Updated Pizza',
                recipe: 'Updated Recipe',
                imageUrl: 'http://example.com/updated_pizza.jpg'
            },
            1
        );
        expect(res.body).toEqual({ success: true });
    }
    );
    test("delete dish", async () => {   
        (dishRepository.delete as jest.Mock).mockResolvedValue(1);

        const res = await request(app)
            .delete("/api/dishes/1");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    }
    );
    test("update dish with patch", async () => {
        const mockUpdatePatch = jest.fn();
        (dishRepository.updatePatch as jest.Mock) = mockUpdatePatch;
        (mockUpdatePatch as jest.Mock).mockResolvedValue(1);

        const res = await request(app)
            .patch("/api/dishes/1")
            .send({ name: 'Updated Pizza' });

        expect(res.status).toBe(200);
        expect(res.body.success).toEqual(true);
        expect(mockUpdatePatch).toHaveBeenCalledWith(
            { id: 1,
              name: 'Updated Pizza' },
            1
        );
    });
});