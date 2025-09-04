import { Router } from "express";
import { UserController } from "../controllers/userController";
import { authenticateToken, requireAdmin, requireUser } from "../middleware/auth";

const router = Router();

// Public routes
router.route("/register")
    .post(UserController.register);

router.route("/login")
    .post(UserController.login);

// User profile routes (protected: authenticate → requireUser)
router.route("/profile")
    .get(authenticateToken, requireUser, UserController.getProfile)
    .put(authenticateToken, requireUser, UserController.updateProfile);

// Admin routes (protected: authenticate → requireAdmin)
router.route("/")
    .get(authenticateToken, requireAdmin, UserController.getAllUsers);

router.route("/:id")
    .put(authenticateToken, requireAdmin, UserController.updateUser);

export default router;
