import express, { Express } from "express";
import { mealRepository } from "../data";
import { MealInput } from "../data/repository/meals";
import { AuthRequest } from "../middleware/authMiddleware";
import { getUser } from "./utils";
import { idParamSchema, infoType, mealPatchSchema, mealSchema, validate } from "../middleware/inputValidationSchemas";
const API = '/api/meals';
const API_BY_ID = '/api/meals/:id'

export const registerFormMiddleware = (app: Express) => {
    app.use(express.urlencoded({ extended: true }))
}

export const registerMealInsert = (app: Express) => {
    app.post(API, validate(mealSchema, infoType.body), async (req: AuthRequest, res) => {
        const {name, startDate, endDate, dishId } = req.body; // Access the sent data

        const user = getUser(req, res);
        if(!user) return;
        // validate
        const meal: MealInput = {
            id: 0,
            name,
            startDate,
            endDate,
            dishId,
            userId: user.userId
        }

        const dbResponse = await mealRepository.create(meal);
        res.status(201).json({ rowID: dbResponse });
    });

    app.get(API, async (req, res) => {
        console.log("/api/data/getall");
        const user = getUser(req, res);
        if(!user)  return;
        const meals = await mealRepository.get(undefined, 10, { userId: user.userId});

        res.status(200).json(meals);
    });

    app.get(API_BY_ID, validate(idParamSchema, infoType.params), async (req, res) => {
        const { id } = idParamSchema.parse(req.params);
        const user = getUser(req, res);
        if(!user) return;
        const meal = await mealRepository.getById(Number(id), user.userId);
        console.log("/api/data/get/:id");
        console.log(meal);
        res.status(200).json(meal);
    });

    app.put(
        API_BY_ID, 
        validate(mealSchema, infoType.body), 
        async (req: AuthRequest, res) => {
            const { name, startDate, endDate, dishId } = req.body; // Access the sent data
            const { id } = idParamSchema.parse(req.params);

            const user = getUser(req, res);
            if(!user) return;
            // validate
            const meal: MealInput = {
                id,
                name,
                startDate,
                endDate,
                dishId,
                userId: user.userId
            }

            await mealRepository.update(meal);
            res.status(204).json();
       
    });

    app.patch(
        API_BY_ID, 
        validate(mealPatchSchema, infoType.body), 
        validate(idParamSchema, infoType.params),
        async (req: AuthRequest, res) => {
            const { name, startDate, endDate, dishId } = req.body; // Access the sent data
            const { id } = idParamSchema.parse(req.params);
            const user = getUser(req, res);
            if(!user) return;
            // validate
            const meal: MealInput = {
                id,
                name,
                startDate,
                endDate,
                dishId,
                userId: user.userId
            }

            await mealRepository.update(meal);
            res.status(204).json();
    });

    app.delete(API_BY_ID, validate(idParamSchema, infoType.params), async (req, res) => {
        const { id } = req.params; // Access the sent data
        const user = getUser(req, res);
        if(!user) return;

        console.log("Received data:", id);
        await mealRepository.delete(Number(id), user.userId);
        res.status(201).json();
    });

};

