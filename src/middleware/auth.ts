import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired token." });
    }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    authenticateToken(req, res, () => {
        if (req.user?.role === 'admin') next();
        else res.status(403).json({ message: "Admin privileges required" });
    });
};

export const requireUser = (req: AuthRequest, res: Response, next: NextFunction) => {
    authenticateToken(req, res, () => {
        if (req.user?.role === 'user' || req.user?.role === 'admin') next();
        else res.status(403).json({ message: "User privileges required" });
    });
};
