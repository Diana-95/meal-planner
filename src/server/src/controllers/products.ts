import express, { Express } from "express";
import { productRepository } from "../data";
import { Product } from "../entity/product";
import { AuthRequest } from "../middleware/authMiddleware";
import { getUser } from "./utils";
import { ProductQueryParams } from "../data/repository/products";
import { idParamSchema, infoType, productPatchSchema, productSchema, searchSchema, validate } from "../middleware/inputValidationSchemas";
const API = '/api/products';
const API_BY_ID = '/api/products/:id';

export const registerFormMiddleware = (app: Express) => {
    app.use(express.urlencoded({ extended: true }))
}

export const registerProductController = (app: Express) => {
    app.post(API, validate(productSchema, infoType.body), async (req, res) => {
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

    app.get(API, validate(searchSchema, infoType.query), async (req: AuthRequest, res) => {
        const receivedUser = getUser(req, res);
        if(!receivedUser) return;

        const { searchName, cursor = 1, limit = 10 } = req.query;
        console.log('products query', req.query);
        const queryParams: ProductQueryParams = {
            searchName: searchName as string | undefined,
            userId: receivedUser.userId
        }
        const products = await productRepository.get(Number(cursor), Number(limit), queryParams);
        console.log("/api/data/product/getall");
        console.log(products);
        console.log('user=', req.user);
        res.status(200).json(products);
    });

    app.get(API_BY_ID, validate(idParamSchema, infoType.params), async (req, res) => {
        const { id } = req.params;
        const user = getUser(req, res);
        if(!user) return;

        const dish = await productRepository.getById(Number(id), user.userId);
        console.log("/api/data/get/:id");
        console.log(dish);
        if(dish) res.status(200).json(dish);
        else res.status(404).json({ error: "Resource not found" });
    });

    app.put(API_BY_ID, validate(productSchema, infoType.body), async (req, res) => {
        const receivedData = req.body; // Access the sent data
        const user = getUser(req, res);
        if(!user) return;
        // validate
        const prod: Product = {
            ...receivedData as Product,
            id: Number(req.params.id)
        };
        console.log("prod=", prod);
        console.log("Received data:", receivedData);
        await productRepository.update(prod, user.userId);
        res.status(204).json({ success: true });
    });

    app.patch(API_BY_ID, validate(productPatchSchema, infoType.body), async (req, res) => {
        const {name, price, measure} = req.body; // Access the sent data
        const user = getUser(req, res);
        if(!user) return;
        // validate
        const prod: Product = {
            name, 
            price,
            measure,
            id: Number(req.params.id),
            userId: user.userId
        };
        console.log("prod=", prod);
        await productRepository.updatePatch(prod, user.userId);
        res.status(204).json({ success: true });
    });

    app.delete(API_BY_ID, validate(idParamSchema, infoType.params), async (req, res) => {
        const { id } = idParamSchema.parse(req.params);
        const user = getUser(req, res);
        if(!user) return;

        console.log("Received data:", id);
        const deletedItems = await productRepository.delete(Number(id), user.userId);
        if(deletedItems > 0) res.status(204).json({ success: true });
        else res.status(404).json({error: "Resource not found"});
        
    });
};

