import { Request, Response } from "express";
import pool from "../config/database";
import {
    Product,
    CreateProductRequest,
    UpdateProductRequest,
    ApiResponse
} from "../types/entities";

// Response type interfaces
interface ProductResponse {
    product: Product;
}

interface ProductsListResponse {
    products: Product[];
}

interface ProductCreatedResponse {
    product_id: number;
    name: string;
    price: number;
    category_id?: number;
}

interface ProductUpdatedResponse {
    product_id: number;
    name: string;
    price: number;
    category_id?: number;
}

export class ProductController {
    // Get all products
    static async getAllProducts(req: Request, res: Response<ApiResponse<ProductsListResponse>>) {
        try {
            const [rows] = await pool.query("SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC");
            const products = rows as Product[];

            res.json({
                success: true,
                message: "Products retrieved successfully",
                data: { products }
            });
        } catch (error) {
            console.error('Get products error:', error);
            res.status(500).json({
                success: false,
                message: "Error fetching products",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    // Get product by ID
    static async getProductById(req: Request<{ id: string }>, res: Response<ApiResponse<ProductResponse>>) {
        try {
            const { id } = req.params;

            // Validate ID
            const productId = parseInt(id);
            if (isNaN(productId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID"
                });
            }

            const [rows] = await pool.query("SELECT * FROM products WHERE product_id = ? AND is_active = 1", [productId]);
            const products = rows as Product[];

            if (products.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            res.json({
                success: true,
                message: "Product retrieved successfully",
                data: { product: products[0] }
            });
        } catch (error) {
            console.error('Get product error:', error);
            res.status(500).json({
                success: false,
                message: "Error fetching product",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    // Get products by category
    static async getProductsByCategory(req: Request<{ categoryId: string }>, res: Response<ApiResponse<ProductsListResponse>>) {
        try {
            const { categoryId } = req.params;

            // Validate category ID
            const catId = parseInt(categoryId);
            if (isNaN(catId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID"
                });
            }

            const [rows] = await pool.query(
                "SELECT * FROM products WHERE category_id = ? AND is_active = 1 ORDER BY created_at DESC",
                [catId]
            );
            const products = rows as Product[];

            res.json({
                success: true,
                message: `Products in category ${catId} retrieved successfully`,
                data: { products }
            });
        } catch (error) {
            console.error('Get products by category error:', error);
            res.status(500).json({
                success: false,
                message: "Error fetching products by category",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    // Create product
    static async createProduct(
        req: Request<{}, ApiResponse<ProductCreatedResponse>, CreateProductRequest>,
        res: Response<ApiResponse<ProductCreatedResponse>>
    ) {
        try {
            const { name, description, price, stock_quantity, category_id, sku, image_url } = req.body;

            // Validation
            if (!name || price === undefined || stock_quantity === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Name, price, and stock quantity are required"
                });
            }

            if (price < 0 || stock_quantity < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Price and stock quantity must be non-negative"
                });
            }

            // Check if SKU already exists (if provided)
            if (sku) {
                const [existingProducts] = await pool.query(
                    "SELECT product_id FROM products WHERE sku = ?",
                    [sku]
                );
                const existing = existingProducts as Product[];

                if (existing.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Product with this SKU already exists"
                    });
                }
            }

            // Insert product
            const [result]: any = await pool.query(
                `INSERT INTO products (name, description, price, stock_quantity, category_id, sku, image_url, is_active, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [name, description, price, stock_quantity, category_id || null, sku || null, image_url || null, true]
            );

            const responseData: ProductCreatedResponse = {
                product_id: result.insertId,
                name,
                price,
                category_id
            };

            res.status(201).json({
                success: true,
                message: "Product created successfully",
                data: responseData
            });
        } catch (error) {
            console.error('Create product error:', error);
            res.status(500).json({
                success: false,
                message: "Error creating product",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    // Update product
    static async updateProduct(
        req: Request<{ id: string }, ApiResponse<ProductUpdatedResponse>, UpdateProductRequest>,
        res: Response<ApiResponse<ProductUpdatedResponse>>
    ) {
        try {
            const { id } = req.params;
            const { name, description, price, stock_quantity, category_id, sku, image_url, is_active } = req.body;

            // Validate ID
            const productId = parseInt(id);
            if (isNaN(productId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID"
                });
            }

            // Validation for numeric fields
            if (price !== undefined && price < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Price must be non-negative"
                });
            }

            if (stock_quantity !== undefined && stock_quantity < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Stock quantity must be non-negative"
                });
            }

            // Check if SKU already exists for other products (if provided)
            if (sku) {
                const [existingProducts] = await pool.query(
                    "SELECT product_id FROM products WHERE sku = ? AND product_id != ?",
                    [sku, productId]
                );
                const existing = existingProducts as Product[];

                if (existing.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Another product with this SKU already exists"
                    });
                }
            }

            // Update product
            const [result]: any = await pool.query(
                `UPDATE products 
                 SET name = ?, description = ?, price = ?, stock_quantity = ?, category_id = ?, sku = ?, image_url = ?, is_active = ?, updated_at = NOW()
                 WHERE product_id = ?`,
                [
                    name,
                    description,
                    price,
                    stock_quantity,
                    category_id || null,
                    sku || null,
                    image_url || null,
                    is_active !== undefined ? is_active : true,
                    productId
                ]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            const responseData: ProductUpdatedResponse = {
                product_id: productId,
                name: name || "Updated",
                price: price || 0,
                category_id
            };

            res.json({
                success: true,
                message: "Product updated successfully",
                data: responseData
            });
        } catch (error) {
            console.error('Update product error:', error);
            res.status(500).json({
                success: false,
                message: "Error updating product",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    // Delete product (soft delete)
    static async deleteProduct(
        req: Request<{ id: string }>,
        res: Response<ApiResponse<{ message: string }>>
    ) {
        try {
            const { id } = req.params;

            // Validate ID
            const productId = parseInt(id);
            if (isNaN(productId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID"
                });
            }

            // Soft delete by setting is_active to false
            const [result]: any = await pool.query(
                "UPDATE products SET is_active = ?, updated_at = NOW() WHERE product_id = ?",
                [false, productId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            res.json({
                success: true,
                message: "Product deleted successfully",
                data: { message: "Product deleted successfully" }
            });
        } catch (error) {
            console.error('Delete product error:', error);
            res.status(500).json({
                success: false,
                message: "Error deleting product",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    // Hard delete product (permanent deletion)
    static async hardDeleteProduct(
        req: Request<{ id: string }>,
        res: Response<ApiResponse<{ message: string }>>
    ) {
        try {
            const { id } = req.params;

            // Validate ID
            const productId = parseInt(id);
            if (isNaN(productId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID"
                });
            }

            // Permanent delete
            const [result]: any = await pool.query("DELETE FROM products WHERE product_id = ?", [productId]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            res.json({
                success: true,
                message: "Product permanently deleted",
                data: { message: "Product permanently deleted" }
            });
        } catch (error) {
            console.error('Hard delete product error:', error);
            res.status(500).json({
                success: false,
                message: "Error permanently deleting product",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }
}
