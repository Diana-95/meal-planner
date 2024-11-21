import express, { Express } from "express";
import { mealRepository } from "../data";
import { Meal } from "../entity/meal";
import { MealInput } from "../data/repository/meal_repository";
const rowLimit = 10;

export const registerFormMiddleware = (app: Express) => {
    app.use(express.urlencoded({ extended: true }))
}

export const registerMealInsert = (app: Express) => {
    app.post('/api/data', async (req, res) => {
        const receivedData = req.body; // Access the sent data

        // validate
        const meal: MealInput = {
            id: 0,
            name: req.body.title,
            startDate: req.body.start,
            endDate: req.body.end,
            dishId: req.body.dishId
        }

        console.log("Received data:", receivedData);
        const dbResponse = await mealRepository.create(meal);
        res.status(201).json({ rowID: dbResponse });
        // Send a response back
        //res.json({ message: 'Data received successfully!', receivedData });
    });

    app.post('/api/data/update', async (req, res) => {
        const receivedData = req.body; // Access the sent data

        // validate
        const meal: MealInput = {
            id: req.body.id,
            name: req.body.title,
            startDate: req.body.start,
            endDate: req.body.end,
            dishId: req.body.dishId
        }

        console.log("Received data:", receivedData);
        await mealRepository.update(meal);
        res.status(201).json();
        // Send a response back
        //res.json({ message: 'Data received successfully!', receivedData });
    });
// /update/dish

app.post('/api/data/update/dish', async (req, res) => {
    const [mealId, dishId] = [req.body.id, req.body.dishId]; // Access the sent data

    console.log("Received data:", mealId);
    await mealRepository.updateDishId(mealId, dishId);
    res.status(201).json();
    // Send a response back
    //res.json({ message: 'Data received successfully!', receivedData });
});

    app.post('/api/data/delete', async (req, res) => {
        const receivedData = req.body; // Access the sent data

        console.log("Received data:", receivedData);
        await mealRepository.delete(receivedData.id);
        res.status(201).json();
    });
    // deleteDishFromMeals
    app.post('/api/data/deletedish', async (req, res) => {
        const receivedData = req.body; // Access the sent data

        console.log("Received data:", receivedData);
        await mealRepository.deleteDishFromMeals(receivedData.id);
        res.status(201).json();
    });

    app.get('/api/data/getall', async (req, res) => {
        console.log("/api/data/getall");
        const meals = await mealRepository.getAll(rowLimit);

        console.log(meals);
        res.status(200).json(meals);
    });

    app.get('/api/data/get/:id', async (req, res) => {
        const mealId = Number(req.params.id);
        const meal = await mealRepository.findById(mealId);
        console.log("/api/data/get/:id");
        console.log(meal);
        res.status(200).json(meal);
    });
};

