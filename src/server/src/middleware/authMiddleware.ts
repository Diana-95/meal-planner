import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface MyJWTPayload extends JwtPayload {
  userId: number;
  username: string;
  email: string;
  role?: string;
}

export interface AuthRequest extends Request {
  user?: MyJWTPayload;
}

const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies?.authToken; // Assume Bearer token
  console.log('req.cookies=', req.cookies);
  if (!token) {
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return;
  }

  try {
    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey || secretKey === 'your_secret_key') {
      res.status(500).json({ message: 'Server configuration error: JWT secret not properly configured.' });
      return;
    }
    const decodedUser = jwt.verify(token, secretKey) as MyJWTPayload;
    req.user = decodedUser; // Attach the user data to the request object
    console.log('verify token user=', decodedUser)
    next();
  } catch (error) {
    console.log('error', error)
    res.status(403).json({ message: 'Invalid token.' });
  }
};

export default verifyToken;
