import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/database";
import {
    User,
    CreateUserRequest,
    ApiResponse,
} from "../types/entities";
import { v4 as uuidv4 } from "uuid";

// authentication request types.
interface AuthRequest extends Request {
    user?: {
        user_id: string;
        email: string;
        role: "user" | "admin";
    };
}

// response type for authentication.
interface AuthResponse {
    message: string;
    user: {
        user_id: string;
        first_name: string;
        last_name: string;
        email: string;
        role: "user" | "admin";
    };
    token: string;
}

interface ProfileResponse {
    user: Omit<User, 'password_hash'>;
}

interface UsersListResponse {
    users: Omit<User, 'password_hash'>[];
}

export class UserController {
    // Register new user
    static async register(
        req: Request<{}, ApiResponse<AuthResponse>, CreateUserRequest>,
        res: Response<ApiResponse<AuthResponse>>
    ) {
        try {
            const { first_name, last_name, email, password, phone, role } = req.body;

            if (!first_name || !last_name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "All required fields must be provided"
                });
            }

            // Check if user exists
            const [existingUsers]: any = await pool.query(
                "SELECT user_id FROM users WHERE email = ?",
                [email]
            );

            if (existingUsers.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "User already exists with this email"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user_id = uuidv4();
            const userRole: "user" | "admin" = role === "admin" ? "admin" : "user";

            await pool.query(
                `INSERT INTO users 
                (user_id, first_name, last_name, email, password_hash, phone, role, is_active, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [user_id, first_name, last_name, email, hashedPassword, phone || null, userRole, true]
            );

            const token = jwt.sign(
                { user_id, email, role: userRole },
                process.env.JWT_SECRET || 'fallback-secret',
                { expiresIn: '1h' }
            );

            // console.log(`Registeration Token: ${token}`);

            const responseData: AuthResponse = {
                message: "User registered successfully",
                user: { user_id, first_name, last_name, email, role: userRole },
                token
            };

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: responseData
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: "Error registering user",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    // Login user
    static async login(
        req: Request<{}, ApiResponse<AuthResponse>, { email: string; password: string }>,
        res: Response<ApiResponse<AuthResponse>>
    ) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Email and password are required"
                });
            }

            const [rows] = await pool.query(
                "SELECT user_id, first_name, last_name, email, password_hash, role FROM users WHERE email = ? AND is_active = 1",
                [email]
            );
            const users = rows as User[];

            if (users.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            const user = users[0];
            const isValidPassword = await bcrypt.compare(password, user.password_hash);

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            const token = jwt.sign(
                { user_id: user.user_id, email: user.email, role: user.role },
                process.env.JWT_SECRET || 'fallback-secret',
                { expiresIn: '1h' }
            );

            // console.log(`Generated Login Token: ${token}`);

            const responseData: AuthResponse = {
                message: "Login successful",
                user: {
                    user_id: user.user_id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role: user.role
                },
                token
            };

            res.json({
                success: true,
                message: "Login successful",
                data: responseData
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: "Error during login",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    // Get profile
    static async getProfile(req: AuthRequest, res: Response<ApiResponse<ProfileResponse>>) {
        try {
            const userId = req.user?.user_id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const [rows] = await pool.query(
                "SELECT user_id, first_name, last_name, email, phone, role, date_of_birth, is_active, created_at, updated_at FROM users WHERE user_id = ?",
                [userId]
            );
            const users = rows as User[];

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            const user = users[0];
            const { password_hash, ...userWithoutPassword } = user;

            res.json({
                success: true,
                message: "Profile retrieved successfully",
                data: { user: userWithoutPassword }
            });
        } catch (error) {
            console.error('Profile fetch error:', error);
            res.status(500).json({
                success: false,
                message: "Error fetching user profile",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    // Update profile
    static async updateProfile(
        req: AuthRequest,
        res: Response<ApiResponse<{ message: string }>>
    ) {
        try {
            const userId = req.user?.user_id;
            const { first_name, last_name, phone, date_of_birth } = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const [result]: any = await pool.query(
                "UPDATE users SET first_name = ?, last_name = ?, phone = ?, date_of_birth = ?, updated_at = NOW() WHERE user_id = ?",
                [first_name, last_name, phone, date_of_birth, userId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            res.json({
                success: true,
                message: "Profile updated successfully",
                data: { message: "Profile updated successfully" }
            });
        } catch (error) {
            console.error('Profile update error:', error);
            res.status(500).json({
                success: false,
                message: "Error updating profile",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    // Admin: get all users
    static async getAllUsers(req: Request, res: Response<ApiResponse<UsersListResponse>>) {
        try {
            const [rows] = await pool.query(
                "SELECT user_id, first_name, last_name, email, phone, role, date_of_birth, is_active, created_at, updated_at FROM users ORDER BY created_at DESC"
            );
            const users = rows as User[];

            const usersWithoutPasswords = users.map(({ password_hash, ...user }) => user);

            res.json({
                success: true,
                message: "Users retrieved successfully",
                data: { users: usersWithoutPasswords }
            });
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({
                success: false,
                message: "Error fetching users",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    // Admin: update user
    static async updateUser(
        req: Request<{ id: string }, ApiResponse<{ message: string }>, { role: "user" | "admin"; is_active: boolean }>,
        res: Response<ApiResponse<{ message: string }>>
    ) {
        try {
            const { id } = req.params;
            const { role, is_active } = req.body;

            if (!['user', 'admin'].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid role. Must be 'user' or 'admin'"
                });
            }

            const [result]: any = await pool.query(
                "UPDATE users SET role = ?, is_active = ?, updated_at = NOW() WHERE user_id = ?",
                [role, is_active, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            res.json({
                success: true,
                message: "User updated successfully",
                data: { message: "User updated successfully" }
            });
        } catch (error) {
            console.error('User update error:', error);
            res.status(500).json({
                success: false,
                message: "Error updating user",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }
}
