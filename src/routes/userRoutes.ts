import { Router } from "express";
import { UserController } from "../controllers/userController";
import { requireAdmin, requireUser } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/register", UserController.register);
router.post("/login", UserController.login);

// Protected routes
router.get("/profile", requireUser, UserController.getProfile);
router.put("/profile", requireUser, UserController.updateProfile);

// Admin only
router.get("/", requireAdmin, UserController.getAllUsers);
router.put("/:id", requireAdmin, UserController.updateUser);

export default router;
