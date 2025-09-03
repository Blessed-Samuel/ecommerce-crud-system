import { Router } from "express";
import { ProductController } from "../controllers/productController";

const router = Router();

// GET all products
router.get("/", ProductController.getAllProducts);

// GET product by ID
router.get("/:id", ProductController.getProductById);

// GET products by category
router.get("/category/:categoryId", ProductController.getProductsByCategory);

// CREATE product
router.post("/", ProductController.createProduct);

// UPDATE product
router.put("/:id", ProductController.updateProduct);

// DELETE product
router.delete("/:id", ProductController.deleteProduct);

export default router;
