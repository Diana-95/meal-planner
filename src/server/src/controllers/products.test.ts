import { API, registerProductController } from "./products";

import express from 'express';
import request from 'supertest';
import { productRepository } from "../data";

jest.mock('../data', () => ({
    productRepository: {
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

describe('products controller', () => {
    const app = express();
    app.use(express.json());
    registerProductController(app); 

    test('create new product', async () => {
        (productRepository.create as jest.Mock).mockReturnValue(2);
        const res = await request(app)
            .post(API)
            .send({ name: 'Product1', measure: 'kg', price: 100 });
        expect(res.status).toBe(201);
        expect(res.body.rowID).toBe(2);
        expect(productRepository.create).toHaveBeenCalledWith({
            name: 'Product1',
            measure: 'kg',
            price: 100,
            userId: 1
        });
    });

    test('get all products', async () => {
        (productRepository.get as jest.Mock).mockResolvedValue([
            { id: 1, name: 'Product1', measure: 'kg', price: 100 },
            { id: 2, name: 'Product2', measure: 'kg', price: 200 }
        ]);
        const res = await request(app)
            .get(API)
            .query({ searchName: "Product", cursor: 1, limit: 10 });
        expect(res.status).toBe(200);
        expect(res.body).toEqual([
            { id: 1, name: 'Product1', measure: 'kg', price: 100 },
            { id: 2, name: 'Product2', measure: 'kg', price: 200 }
        ]);
    });

    test('get product by id', async () => {
        (productRepository.getById as jest.Mock).mockResolvedValue({
            id: 1,
            name: 'Product1',
            measure: 'kg',
            price: 100
        });
        const res = await request(app)
            .get(`${API}/1`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            id: 1,
            name: 'Product1',
            measure: 'kg',
            price: 100
        });
    });
    test('update product by id', async () => {
        (productRepository.update as jest.Mock).mockResolvedValue(1);
        const res = await request(app)
            .put(`${API}/1`)
            .send({ name: 'Updated Product', measure: 'kg', price: 150 });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(productRepository.update).toHaveBeenCalledWith(
            { id: 1, name: 'Updated Product', measure: 'kg', price: 150 },
            1
        );
    }
    );
    test('patch product by id', async () => {
        (productRepository.updatePatch as jest.Mock).mockResolvedValue(1);
        const res = await request(app)
            .patch(`${API}/1`)
            .send({ name: 'Patched Product', price: 120 });
        expect(res.status).toBe(200);
        expect(productRepository.updatePatch).toHaveBeenCalledWith(
            { id: 1, name: 'Patched Product', price: 120, measure: undefined},
            1
        );
    }
    );
    test('delete product by id', async () => {
        (productRepository.delete as jest.Mock).mockResolvedValue(1);
        const res = await request(app)
            .delete(`${API}/1`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(productRepository.delete).toHaveBeenCalledWith(1, 1);
    }
    );
    test('create product with missing fields', async () => {
        const res = await request(app)
            .post(API)
            .send({ measure: 'kg' }); // Missing measure and price
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    }
    );
    test('get all products with search', async () => {
        (productRepository.get as jest.Mock).mockResolvedValue([
            { id: 1, name: 'Product1', measure: 'kg', price: 100 },
            { id: 2, name: 'Product2', measure: 'kg', price: 200 }
        ]);
        const res = await request(app)
            .get(API)
            .query({ searchName: "Product", cursor: 0, limit: 10 });
        expect(res.status).toBe(200);
        expect(res.body).toEqual([
            { id: 1, name: 'Product1', measure: 'kg', price: 100 },
            { id: 2, name: 'Product2', measure: 'kg', price: 200 }
        ]);
    }
    )

});