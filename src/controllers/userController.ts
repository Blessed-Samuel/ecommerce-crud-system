import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/database";

interface AuthRequest extends Request {
    user?: any;
}

export class UserController {
    // Register new user
    static async register(req: Request, res: Response) {
        try {
            const { first_name, last_name, email, password, phone } = req.body;

            if (!first_name || !last_name || !email || !password) {
                return res.status(400).json({ message: "All required fields must be provided" });
            }

            const [existingUsers]: any = await pool.query(
                "SELECT user_id FROM users WHERE email = ?",
                [email]
            );

            if (existingUsers.length > 0) {
                return res.status(400).json({ message: "User already exists with this email" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const [result]: any = await pool.query(
                `INSERT INTO users (first_name, last_name, email, password_hash, phone, role) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [first_name, last_name, email, hashedPassword, phone || null, 'user']
            );

            // Generate token
            const token = jwt.sign(
                { user_id: result.insertId, email, role: 'user' },
                process.env.JWT_SECRET || 'fallback-secret',
                { expiresIn: '1h' }
            );

            res.status(201).json({
                message: "User registered successfully",
                user: {
                    user_id: result.insertId,
                    first_name,
                    last_name,
                    email,
                    role: 'user'
                },
                token
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: "Error registering user" });
        }
    }

    // Login user
    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required" });
            }

            const [users]: any = await pool.query(
                "SELECT user_id, first_name, last_name, email, password_hash, role FROM users WHERE email = ? AND is_active = 1",
                [email]
            );

            if (users.length === 0) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const user = users[0];
            const isValidPassword = await bcrypt.compare(password, user.password_hash);

            if (!isValidPassword) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const token = jwt.sign(
                { user_id: user.user_id, email: user.email, role: user.role },
                process.env.JWT_SECRET || 'fallback-secret',
                { expiresIn: '1h' }
            );

            res.json({
                message: "Login successful",
                user: {
                    user_id: user.user_id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role: user.role
                },
                token
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: "Error during login" });
        }
    }

    // Get profile
    static async getProfile(req: AuthRequest, res: Response) {
        try {
            const userId = req.user.user_id;
            const [users]: any = await pool.query(
                "SELECT user_id, first_name, last_name, email, phone, role, created_at FROM users WHERE user_id = ?",
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json({ user: users[0] });
        } catch (error) {
            console.error('Profile fetch error:', error);
            res.status(500).json({ message: "Error fetching user profile" });
        }
    }

    // Update profile
    static async updateProfile(req: AuthRequest, res: Response) {
        try {
            const userId = req.user.user_id;
            const { first_name, last_name, phone } = req.body;

            const [result]: any = await pool.query(
                "UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE user_id = ?",
                [first_name, last_name, phone, userId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json({ message: "Profile updated successfully" });
        } catch (error) {
            console.error('Profile update error:', error);
            res.status(500).json({ message: "Error updating profile" });
        }
    }

    // Admin: get all users
    static async getAllUsers(req: Request, res: Response) {
        try {
            const [users] = await pool.query(
                "SELECT user_id, first_name, last_name, email, phone, role, is_active, created_at FROM users ORDER BY created_at DESC"
            );
            res.json({ users });
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({ message: "Error fetching users" });
        }
    }

    // Admin: update user
    static async updateUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { role, is_active } = req.body;

            const [result]: any = await pool.query(
                "UPDATE users SET role = ?, is_active = ? WHERE user_id = ?",
                [role, is_active, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json({ message: "User updated successfully" });
        } catch (error) {
            console.error('User update error:', error);
            res.status(500).json({ message: "Error updating user" });
        }
    }
}
