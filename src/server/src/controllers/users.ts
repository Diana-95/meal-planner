import express, { Express, Response } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { userRepository } from "../data";
import { User } from "../entity/user";
import { AuthRequest, MyJWTPayload } from "../middleware/authMiddleware";
import { infoType, loginSchema, registerSchema, userSchema, validate } from "../middleware/inputValidationSchemas";


export const registerFormMiddleware = (app: Express) => {
    app.use(express.urlencoded({ extended: true }))
}

const signToken = (userId: number, username: string, email: string, res: Response) => {
    const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
    
    if (!JWT_SECRET_KEY || JWT_SECRET_KEY === 'your_secret_key') {
        throw new Error('JWT_SECRET_KEY environment variable must be set to a secure value');
    }

    const userJWTPayload: MyJWTPayload = {
        userId,
        username,
        email
    }
    const token = jwt.sign(userJWTPayload, JWT_SECRET_KEY, {
        expiresIn: '24h',
    });

    // Set cookies after registration/login
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('authToken', token, {
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        secure: isProduction, // Only send over HTTPS in production
        sameSite: isProduction ? 'strict' : 'lax', // Stricter in production
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
}

export const registerUserController = (app: Express) => {
    app.post('/register', validate(registerSchema, infoType.body), async (req, res) => {
        console.log('register');
        const { username, password, email } = req.body;

        const isUserExists = await userRepository.isUserExists(username, email);
        if(isUserExists) 
            return res.status(401).json({ error: 'User already exists' });
        // Security: Use bcrypt for password hashing (NOT md5, sha1, or sha256)
        // bcrypt is purpose-built for passwords with automatic salting and adjustable cost
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
        // Security: Use bcrypt.compare() to verify passwords against stored bcrypt hashes
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        signToken(user.id, username, user.email, res);
        res.status(201).json(user);
        
    });

    app.get('/api/me', async (req: AuthRequest, res) => {
        const user = req.user;
        //check if user is valid?
        res.status(200).json(user);

    });

    app.patch('/api/me', validate(userSchema, infoType.body), async (req: AuthRequest, res) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'No user was found' });
        }
        const { username, password, email } = req.body;
        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
        const updateUser: Partial<User> = {
            username,
            email,
            password_hash:  hashedPassword,
            id: user?.userId
        }
        userRepository.updatePart(updateUser);
        res.status(200).json({ success: true });

    });

    app.put('/api/me', validate(registerSchema, infoType.body), async (req: AuthRequest, res) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'No user was found' });
        }
        const { username, password, email } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const updateUser: User = {
            username,
            email,
            password_hash:  hashedPassword,
            id: user.userId
        }
        userRepository.update(updateUser);
        res.status(200).json({ success: true });

    });
}

