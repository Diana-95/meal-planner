import express, { Express, Response } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { userRepository } from "../data";
import { User } from "../entity/user";
import { AuthRequest, MyJWTPayload } from "../middleware/authMiddleware";
import { infoType, loginSchema, registerSchema, validate } from "../middleware/inputValidationSchemas";


export const registerFormMiddleware = (app: Express) => {
    app.use(express.urlencoded({ extended: true }))
}

const signToken = (userId: number, username: string, email: string, res: Response) => {
    const userJWTPayload: MyJWTPayload = {
        userId,
        username,
        email
    }
    const token = jwt.sign(userJWTPayload, 'your_secret_key', {
        expiresIn: '1h',
    });

        // set cookies after registration
    res.cookie('authToken', token, {
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        secure: false, // Use HTTPS in production
        sameSite: 'lax', // Prevent cross-site request forgery
        maxAge: 60 * 60 * 1000, // 1 hour
    });
}

export const registerUserController = (app: Express) => {
    app.post('/register', validate(registerSchema, infoType.body), async (req, res) => {
        console.log('register');
        const { username, password, email } = req.body;

        const isUserExists = await userRepository.isUserExists(username, email);
        if(isUserExists) 
            return res.status(401).json({ error: 'User already exists' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user: User = {
            id: 0,
            username,
            email,
            password_hash: hashedPassword
        }
        const id = await userRepository.create(user);
        
        signToken(id, username, email, res);
        res.status(201).json(id);

    });

    app.post('/login', validate(loginSchema, infoType.body), async (req, res) => {

        const { username, password } = req.body;
        const user = await userRepository.findOne( username );
        console.log(username);
        if (!user) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        signToken(user.id, username, user.email, res);
        res.status(201).json({ user });
        
    });

    app.get('/api/me', async (req: AuthRequest, res) => {
        const user = req.user;
        //check if user is valid?
        res.status(200).json(user);

    });

    app.patch('/api/users/:id', async (req: AuthRequest, res) => {
        const user = req.user;

        const { username, password, email } = req.body;
        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
        const updateUser: Partial<User> = {
            username,
            email,
            password_hash:  hashedPassword,
            id: user?.userId
        }
        userRepository.updatePart(updateUser);
        res.status(200).json(user);

    });
}

