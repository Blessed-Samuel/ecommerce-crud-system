import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/entities';

// JWT payload interface
interface JWTPayload {
    user_id: string;
    email: string;
    role: "user" | "admin";
    iat?: number;
    exp?: number;
}

// Extend Request interface properly
interface AuthRequest extends Request {
    user?: {
        user_id: string;
        email: string;
        role: "user" | "admin";
    };
}

export const authenticateToken = (req: AuthRequest, res: Response<ApiResponse<never>>, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access denied. No token provided."
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JWTPayload;

        // Set user with proper typing
        req.user = {
            user_id: decoded.user_id,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};

export const requireAdmin = (req: AuthRequest, res: Response<ApiResponse<never>>, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: "Admin privileges required"
        });
    }

    next();
};

export const requireUser = (req: AuthRequest, res: Response<ApiResponse<never>>, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (req.user.role !== 'user' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: "User privileges required"
        });
    }

    next();
};
