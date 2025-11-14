import express, { Express } from "express";
import { dishRepository } from "../data";
import { Dish } from "../entity/dish";
import { getUser } from "./utils";
import { DishQuery } from "../data/repository/dishes";
import { dishPatchSchema, dishSchema, idParamSchema, infoType, searchSchema, validate } from "../middleware/inputValidationSchemas";

const API = '/api/dishes';
const API_BY_ID = '/api/dishes/:id';

export const registerFormMiddleware = (app: Express) => {
    app.use(express.urlencoded({ extended: true }))
}

export const registerDishController = (app: Express) => {
    app.post(API, validate(dishSchema, infoType.body), async (req, res) => {
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

    app.get(API, validate(searchSchema, infoType.query), async (req, res) => {
        const user = getUser(req, res);
        if(!user) return;
        const {searchName, cursor, limit} = req.query;
        const query: DishQuery = {
            searchName: searchName as string | undefined,
            userId: user.userId
        }
        const meals = await dishRepository.get(Number(cursor), Number(limit), query);
        console.log("/api/data/getall");

        res.status(200).json(meals);
    });

    app.get(API_BY_ID, validate(idParamSchema, infoType.params), async (req, res) => {
        const { id } = req.params;
        const user = getUser(req, res);
        if(!user) return;
        
        try {
            const dish = await dishRepository.getById(Number(id), user.userId);
            console.log("/api/data/get/:id", id);
            console.log("Dish found:", dish.name);
            res.status(200).json(dish);
        } catch (error) {
            console.error(`Error fetching dish ${id}:`, error);
            
            // Check if it's a "not found" error
            if (error instanceof Error && error.message.includes('not found')) {
                return res.status(404).json({ error: 'Dish not found' });
            }
            
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.put(API_BY_ID, 
        validate(dishSchema, infoType.body),
        validate(idParamSchema, infoType.params),
         async (req, res) => {
        const receivedData = req.body; // Access the sent data
        const user = getUser(req, res);
        if(!user) return;
        // validate
        const dish: Dish = {
            ...receivedData as Dish,
            id: Number(req.params.id)
        }

        console.log("Received data:", receivedData);
        await dishRepository.update(dish, user.userId);
        res.status(200).json({ success: true });
        // Send a response back
        //res.json({ message: 'Data received successfully!', receivedData });
    });

    app.patch(API_BY_ID, 
        validate(dishPatchSchema, infoType.body),
        validate(idParamSchema, infoType.params),
         async (req, res) => {
        const receivedData = req.body; // Access the sent data
        const user = getUser(req, res);
        if(!user) return;
        // validate
        const dish: Dish = {
            ...receivedData as Dish,
            id: Number(req.params.id)
        }

        console.log("Received data:", receivedData);
        await dishRepository.updatePatch(dish, user.userId);
        res.status(200).json({ success: true });
        // Send a response back
        //res.json({ message: 'Data received successfully!', receivedData });
    });

    app.delete(API_BY_ID, validate(idParamSchema, infoType.params), async (req, res) => {
        const { id } = req.params; // Access the sent data
        const user = getUser(req, res);
        if(!user) return;
        console.log("Received data:", id);
        await dishRepository.delete(Number(id), user.userId);
        res.status(200).json({ success: true });
        // Send a response back
        //res.json({ message: 'Data received successfully!', receivedData });
    });
};

