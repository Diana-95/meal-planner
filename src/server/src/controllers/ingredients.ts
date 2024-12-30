import express, { Express } from "express";
import { ingredientRepository } from "../data";
import { IngredientInput, IngredientQueryParams } from "../data/repository/ingredients";
import { idParamSchema, infoType, ingredientIdsSchema, ingredientSchema, validate } from "../middleware/inputValidationSchemas";
import { getUser } from "./utils";
const rowLimit = 10;
const API = '/api/ingredients';
const API_BY_ID = '/api/ingredients/:id'

export const registerFormMiddleware = (app: Express) => {
    app.use(express.urlencoded({ extended: true }))
}

export const registerIngredientController = (app: Express) => {
    app.post(API, validate(ingredientSchema, infoType.body), 
    async (req, res) => {
        const receivedData = req.body; // Access the sent data

        // validate
        const prod = receivedData as IngredientInput;

        console.log("Received data:", receivedData);
        const dbResponse = await ingredientRepository.create(prod);
        res.status(201).json({ rowID: dbResponse });
    });

    app.get(API, validate(ingredientIdsSchema, infoType.query), 
    async (req, res) => {
        const { dishIdP, productIdP } = req.query;
        const queryParams: IngredientQueryParams = {
            dishId: dishIdP as string | undefined,
            productId: productIdP as string | undefined
        }
        const meals = await ingredientRepository.get(undefined, rowLimit, queryParams);
        console.log("/api/data/ingredient/getall");
        console.log(meals);
        res.status(200).json(meals);
    });

    app.get(API_BY_ID, validate(idParamSchema, infoType.params), 
    async (req, res) => {
        const { id } = req.params;
        const user = getUser(req, res);
        if(!user) return;
        
        const ingredient = await ingredientRepository.getById(Number(id), user.userId);
        console.log("/api/data/get/:id");
        console.log(ingredient);
        res.status(200).json(ingredient);
    });
   
    app.put(API_BY_ID, validate(ingredientSchema, infoType.body), 
    async (req, res) => {
        const { id } = req.params;
        const receivedData = req.body; // Access the sent data

        // validate
        const prod: IngredientInput = {
            ...receivedData as IngredientInput,
            id: Number(id)
        }

        console.log("Received data:", receivedData);
        await ingredientRepository.update(prod);
        res.status(204).json();
    });

    app.delete(API_BY_ID, validate(idParamSchema, infoType.params), 
    async (req, res) => {
        const { id } = req.params; // Access the sent data
        const user = getUser(req, res);
        if(!user) return;
        console.log("Received data:", id);
        await ingredientRepository.delete(Number(id), user.userId);
        res.status(201).json();
    });
};

