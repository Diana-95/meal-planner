import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

/**
 * Middleware that blocks write operations (POST, PUT, DELETE, PATCH) for demo user
 * when DEMO_MODE is enabled in environment variables
 */
export const demoModeMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Only apply protection if DEMO_MODE is enabled
    if (process.env.DEMO_MODE !== 'true') {
        return next();
    }

    // Always allow login and register endpoints (they're needed to authenticate)
    // Check both path and originalUrl to catch all cases
    const path = req.path || req.originalUrl || '';
    if (path.includes('/login') || path.includes('/register')) {
        return next();
    }

    // Only block write operations
    const writeMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    if (!writeMethods.includes(req.method)) {
        return next();
    }

    // Check if user is the demo account
    // Note: req.user will be undefined for login/register since they don't go through verifyToken
    const authReq = req as AuthRequest;
    if (authReq.user && authReq.user.username === 'demo') {
        return res.status(403).json({
            error: 'Demo account is read-only. Please register to create your own account.'
        });
    }

    // Allow the request to proceed
    next();
};
