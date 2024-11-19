import express, { Express } from "express";
import { dishRepository } from "../data";
import { Dish } from "../entity/dish";
const rowLimit = 10;


export const registerFormMiddleware = (app: Express) => {
    app.use(express.urlencoded({ extended: true }))
}

export const registerDishController = (app: Express) => {
    app.post('/api/data/dish', async (req, res) => {
        const receivedData = req.body; // Access the sent data

        // validate
        const dish: Dish = {
            id: 0,
            name: req.body.name,
            recipe: req.body.recipe,
            imageUrl: req.body.imageUrl
        }

        console.log("Received data:", receivedData);
        const dbResponse = await dishRepository.create(dish);
        res.status(201).json({ rowID: dbResponse });
    });

    app.post('/api/data/dish/update', async (req, res) => {
        const receivedData = req.body; // Access the sent data

        // validate
        const dish = receivedData as Dish;

        console.log("Received data:", receivedData);
        await dishRepository.update(dish);
        res.status(201).json();
        // Send a response back
        //res.json({ message: 'Data received successfully!', receivedData });
    });

    app.get('/api/data/dish/getall', async (req, res) => {
        const meals = await dishRepository.getAll(rowLimit);
        console.log("/api/data/getall");
        console.log(meals);
        res.status(200).json(meals);
    });

    app.get('/api/data/dish/:id', async (req, res) => {
        const dishId = Number(req.params.id);
        const dish = await dishRepository.findById(dishId);
        console.log("/api/data/get/:id");
        console.log(dish);
        res.status(200).json(dish);
    });
};

