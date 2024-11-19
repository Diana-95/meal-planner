import express, { Express } from "express";
import { ingredientRepository } from "../data";
import { Ingredient } from "../entity/ingredient";
const rowLimit = 10;


export const registerFormMiddleware = (app: Express) => {
    app.use(express.urlencoded({ extended: true }))
}

export const registerIngredientController = (app: Express) => {
    app.post('/api/data/ingredient', async (req, res) => {
        const receivedData = req.body; // Access the sent data

        // validate
        const prod: Ingredient = receivedData as Ingredient;

        console.log("Received data:", receivedData);
        const dbResponse = await ingredientRepository.create(prod);
        res.status(201).json({ rowID: dbResponse });
    });

    app.post('/api/data/ingredient/update', async (req, res) => {
        const receivedData = req.body; // Access the sent data

        // validate
        const prod: Ingredient = receivedData as Ingredient;

        console.log("Received data:", receivedData);
        await ingredientRepository.update(prod);
        res.status(201).json();
    });

    app.get('/api/data/ingredient/getall', async (req, res) => {
        const meals = await ingredientRepository.getAll(rowLimit);
        console.log("/api/data/ingredient/getall");
        console.log(meals);
        res.status(200).json(meals);
    });

    app.get('/api/data/ingredient/:id', async (req, res) => {
        const id = Number(req.params.id);
        const ingredient = await ingredientRepository.findById(id);
        console.log("/api/data/get/:id");
        console.log(ingredient);
        res.status(200).json(ingredient);
    });
    // findAllByDishId
    app.get('/api/data/ingredient/bydish/:id', async (req, res) => {
        const dishId = Number(req.params.id);
        const ingredients = await ingredientRepository.findAllByDishId(dishId);
        console.log('/api/data/ingredient/bydish/:id');
        console.log(ingredients);
        res.status(200).json(ingredients);
    });
    // findAllByProductId
    app.get('/api/data/ingredient/byproduct/:id', async (req, res) => {
        const productId = Number(req.params.id);
        const ingredients = await ingredientRepository.findAllByDishId(productId);
        console.log('/api/data/ingredient/byproduct/:id');
        console.log(ingredients);
        res.status(200).json(ingredients);
    });
};

