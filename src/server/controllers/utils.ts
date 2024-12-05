import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";

export const getUser = (req: AuthRequest, res: Response) => {
    const receivedUser = req.user;
    if(!receivedUser)
        res.status(401).json('no user');
    return receivedUser;

}