import { Request, Response } from "express";
import pool from "../config/database";

export class ProductController {
    static async getAllProducts(req: Request, res: Response) {
        try {
            const [rows] = await pool.query("SELECT * FROM products");
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error fetching products" });
        }
    }

    static async getProductById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const [rows]: any = await pool.query("SELECT * FROM products WHERE product_id = ?", [id]);
            if (rows.length === 0) return res.status(404).json({ message: "Product not found" });
            res.json(rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error fetching product" });
        }
    }

    static async getProductsByCategory(req: Request, res: Response) {
        try {
            const { categoryId } = req.params;
            const [rows] = await pool.query("SELECT * FROM products WHERE category_id = ?", [categoryId]);
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error fetching products by category" });
        }
    }

    static async createProduct(req: Request, res: Response) {
        try {
            const { name, description, price, stock_quantity, category_id, sku, image_url } = req.body;
            const [result]: any = await pool.query(
                `INSERT INTO products (name, description, price, stock_quantity, category_id, sku, image_url)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [name, description, price, stock_quantity, category_id, sku, image_url]
            );
            res.status(201).json({ product_id: result.insertId, name, price, category_id });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error creating product" });
        }
    }

    static async updateProduct(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name, description, price, stock_quantity, category_id, sku, image_url, is_active } = req.body;
            const [result]: any = await pool.query(
                `UPDATE products 
                 SET name = ?, description = ?, price = ?, stock_quantity = ?, category_id = ?, sku = ?, image_url = ?, is_active = ? 
                 WHERE product_id = ?`,
                [name, description, price, stock_quantity, category_id, sku, image_url, is_active, id]
            );
            if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
            res.json({ product_id: id, name, price, category_id });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error updating product" });
        }
    }

    static async deleteProduct(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const [result]: any = await pool.query("DELETE FROM products WHERE product_id = ?", [id]);
            if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
            res.json({ message: "Product deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error deleting product" });
        }
    }
}
