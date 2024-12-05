import express, { Express } from "express";
import { dishRepository } from "../data";
import { Dish } from "../entity/dish";
import { getUser } from "./utils";
const rowLimit = 10;


export const registerFormMiddleware = (app: Express) => {
    app.use(express.urlencoded({ extended: true }))
}

export const registerDishController = (app: Express) => {
    app.post('/api/data/dish', async (req, res) => {
        const receivedData = req.body; // Access the sent data

        const user = getUser(req, res);
        if(!user) return;
        // validate
        const dish: Dish = {
            ...req.body as Dish,
            userId: user.userId
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

    app.post('/api/data/dish/delete', async (req, res) => {
        const receivedData = req.body; // Access the sent data

        console.log("Received data:", receivedData);
        await dishRepository.delete(receivedData.id);
        res.status(201).json();
        // Send a response back
        //res.json({ message: 'Data received successfully!', receivedData });
    });

    app.get('/api/data/dish/getall', async (req, res) => {
        const user = getUser(req, res);
        if(!user) return;

        const meals = await dishRepository.getAll(rowLimit, user.userId);
        console.log("/api/data/getall");
        // console.log(meals);
        res.status(200).json(meals);
    });

    app.get('/api/data/dish/getallsuggestions/:query', async (req, res) => {
        const user = getUser(req, res);
        if(!user) return;

        const searchQuery = req.params.query;
        const meals = await dishRepository.findSuggestedDishes(searchQuery, rowLimit, user.userId);
        console.log("/api/data/getall/suggestions");
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

