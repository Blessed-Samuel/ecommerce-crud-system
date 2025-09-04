import { Router } from "express";
import { ProductController } from "../controllers/productController";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

// Public routes (anyone can view products)
router.get("/", ProductController.getAllProducts);
router.get("/:id", ProductController.getProductById);
router.get("/category/:categoryId", ProductController.getProductsByCategory);

// Protected routes (admin only for product management)
router.post("/", authenticateToken, requireAdmin, ProductController.createProduct);
router.put("/:id", authenticateToken, requireAdmin, ProductController.updateProduct);
router.delete("/:id", authenticateToken, requireAdmin, ProductController.deleteProduct);

// Hard delete route (super admin only - you might want to add a separate middleware for this)
router.delete("/:id/permanent", authenticateToken, requireAdmin, ProductController.hardDeleteProduct);

export default router;
