import express, { Express } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { userRepository } from "../data";
import { User } from "../entity/user";
import { AuthRequest, MyJWTPayload } from "../middleware/authMiddleware";


export const registerFormMiddleware = (app: Express) => {
    app.use(express.urlencoded({ extended: true }))
}

export const registerUserController = (app: Express) => {
    app.post('/register', async (req, res) => {

        try {
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
            const userJWTPayload: MyJWTPayload = {
                userId: id,
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
            res.status(201).json({ message: 'User registered successfully' });
            } catch (error) {
                res.status(500).json({ error: 'Registration failed' });
            }

    });

    app.post('/login', async (req, res) => {
        console.log('/login', req.body);
        try {
            const { username, password } = req.body;
            const user = await userRepository.findOne( username );

            console.log('/login', user);
            const hashedPassword = await bcrypt.hash(password, 10);
            if (!user) {
                return res.status(401).json({ error: 'Authentication failed' });
            }
            console.log('/login pswd', hashedPassword);
            console.log('/login pswd', user.password_hash);
            const passwordMatch = await bcrypt.compare(password, user.password_hash);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Authentication failed' });
            }
            const userJWTPayload: MyJWTPayload = {
                userId: user.id,
                username,
                email: user.email
            }
            const token = jwt.sign( userJWTPayload, 'your_secret_key', {
                expiresIn: '1h',
                });
                res.cookie('authToken', token, {
                    httpOnly: true,
                    secure: false, // In development mode, set this to `false`
                    sameSite: 'lax', // Use `lax` or `strict` for localhost
                    maxAge: 60 * 60 * 1000 // 1 hour
                });
                  
            res.status(200).json({ user });
            } catch (error) {
                res.status(500).json({ error: 'Registration failed' });
            }
    });

    app.get('/api/me', async (req: AuthRequest, res) => {
        const user = req.user;
        res.status(200).json(user);

    });
}