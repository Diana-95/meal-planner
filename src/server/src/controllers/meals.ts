import express, { Express } from "express";
import { mealRepository } from "../data";
import { MealInput } from "../data/repository/meals";
import { AuthRequest } from "../middleware/authMiddleware";
import { getUser } from "./utils";
import { idParamSchema, infoType, mealIdsSchema, mealPatchSchema, mealQuerySchema, mealSchema, validate } from "../middleware/inputValidationSchemas";
const API = '/api/meals';
const API_BY_ID = '/api/meals/:id'

export const registerFormMiddleware = (app: Express) => {
    app.use(express.urlencoded({ extended: true }))
}

export const registerMealController = (app: Express) => {
    app.post(API, validate(mealSchema, infoType.body), async (req: AuthRequest, res) => {
        const {name, startDate, endDate, dishIds = [] } = req.body; // Access the sent data

        const user = getUser(req, res);
        if(!user) return;
        // validate
        const meal: MealInput = {
            id: 0,
            name,
            startDate,
            endDate,
            dishIds: Array.isArray(dishIds) ? dishIds : [],
            userId: user.userId
        }

        const dbResponse = await mealRepository.create(meal);
        res.status(201).json({ rowID: dbResponse });
    });


app.get(API, validate(mealQuerySchema, infoType.query), async (req, res) => {
    const user = getUser(req, res);
    if (!user) return;
    
    const { startDate, endDate, cursor, limit, searchName } = req.query;
    
    const queryParams = {
        userId: user.userId,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        searchName: searchName as string | undefined,
    };
    
    const meals = await mealRepository.get(
        cursor ? Number(cursor) : undefined,
        limit ? Number(limit) : 100,
        queryParams
    );
    
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
            const { name, startDate, endDate, dishIds = [] } = req.body; // Access the sent data
            const { id } = idParamSchema.parse(req.params);

            const user = getUser(req, res);
            if(!user) return;
            // validate
            const meal: MealInput = {
                id,
                name,
                startDate,
                endDate,
                dishIds: Array.isArray(dishIds) ? dishIds : [],
                userId: user.userId
            }

            await mealRepository.update(meal);
            res.status(200).json({ success: true });
       
    });

    app.patch(
        API_BY_ID, 
        validate(mealPatchSchema, infoType.body), 
        validate(idParamSchema, infoType.params),
        async (req: AuthRequest, res) => {
            const { name, startDate, endDate, dishIds } = req.body; // Access the sent data
            const { id } = idParamSchema.parse(req.params);
            const user = getUser(req, res);
            if(!user) return;
            // validate
            const meal: MealInput = {
                id,
                name,
                startDate,
                endDate,
                dishIds: dishIds !== undefined ? (Array.isArray(dishIds) ? dishIds : []) : undefined as number[] | undefined,
                userId: user.userId
            }

            await mealRepository.updatePatch(meal);
            res.status(204).json({ success: true });
    });

    app.delete(API_BY_ID, validate(idParamSchema, infoType.params), async (req, res) => {
        const { id } = req.params; // Access the sent data
        const user = getUser(req, res);
        if(!user) return;

        console.log("Received data:", id);
        await mealRepository.delete(Number(id), user.userId);
        res.status(201).json({ success: true });
    });

    // Get aggregated ingredients from multiple meals
    app.post(`${API}/ingredients`, validate(mealIdsSchema, infoType.body), async (req, res) => {
        const user = getUser(req, res);
        if (!user) return;

        try {
            const { mealIds } = req.body;
            
            // Validate that all meals belong to the user
            const meals = await mealRepository.get(undefined, 1000, { userId: user.userId });
            const userMealIds = new Set(meals.map(m => m.id));
            const invalidMealIds = mealIds.filter((id: number) => !userMealIds.has(id));
            
            if (invalidMealIds.length > 0) {
                return res.status(403).json({ 
                    error: 'Some meal IDs do not belong to the current user',
                    invalidMealIds 
                });
            }

            const aggregatedIngredients = await mealRepository.getAggregatedIngredients(mealIds, user.userId);
            
            res.status(200).json(aggregatedIngredients);
        } catch (error) {
            console.error('Error aggregating ingredients:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

};

