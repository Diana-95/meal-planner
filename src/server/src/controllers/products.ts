import express, { Express } from "express";
import { productRepository } from "../data";
import { Product } from "../entity/product";
import { AuthRequest } from "../middleware/authMiddleware";
import { getUser } from "./utils";
const rowLimit = 10;


export const registerFormMiddleware = (app: Express) => {
    app.use(express.urlencoded({ extended: true }))
}

export const registerProductController = (app: Express) => {
    app.post('/api/data/product', async (req, res) => {
        const receivedData = req.body; // Access the sent data
        // validate
        const receivedUser = getUser(req, res);
        if(!receivedUser) return;
        const prod: Product = {
            ...receivedData as Product,
            userId: receivedUser?.userId
        }

        console.log("Received data:", receivedData);
        const dbResponse = await productRepository.create(prod);
        res.status(201).json({ rowID: dbResponse });
    });

    app.post('/api/data/product/update', async (req, res) => {
        const receivedData = req.body; // Access the sent data

        // validate
        const prod: Product = receivedData as Product;

        console.log("Received data:", receivedData);
        await productRepository.update(prod);
        res.status(201).json();
    });

    app.post('/api/data/product/delete', async (req, res) => {
        const receivedData = req.body; // Access the sent data

        console.log("Received data:", receivedData);
        await productRepository.delete(receivedData.id);
        res.status(201).json();
    });

    app.get('/api/data/product/getall', async (req: AuthRequest, res) => {
        const receivedUser = getUser(req, res);
        if(!receivedUser) return;

        const meals = await productRepository.getAll(rowLimit, receivedUser.userId);
        console.log("/api/data/product/getall");
        console.log(meals);
        console.log('user=', req.user);
        res.status(200).json(meals);
    });

    app.get('/api/data/product/getallsuggestions/:query', async (req, res) => {
        const receivedUser = getUser(req, res);
        if(!receivedUser) return;

        const searchQuery = req.params.query;
        const products = await productRepository.finSuggestedProducts(searchQuery, rowLimit, receivedUser.userId);
        console.log("/api/data/product/getallSuggestions");
        console.log(products);
        res.status(200).json(products);
    });

    app.get('/api/data/product/:id', async (req, res) => {
        const dishId = Number(req.params.id);
        const dish = await productRepository.findById(dishId);
        console.log("/api/data/get/:id");
        console.log(dish);
        res.status(200).json(dish);
    });
};

