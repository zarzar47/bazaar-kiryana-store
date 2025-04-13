const mysql = require('mysql2/promise');
require("dotenv").config(); // Load environment variables from .env file

class Database {
    static instance = null; // singleton instance

    constructor() {
        if (Database.instance) {
            return Database.instance;
        }

        // MySQL connection config
        this.pool = mysql.createPool({
            host: 'localhost',
            user: `${process.env.DB_USER}`,
            password: `${process.env.DB_PASS}`,
            database: `${process.env.DB_NAME}`,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        Database.instance = this;
    }

    async insertProduct(item) {
        const query = `
            INSERT INTO inventory (store_id, product_id, quantity, price_per_unit, item_desc, stocked_in, VendorId)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            item.store_id,
            item.product_id,
            item.quantity,
            item.price_per_unit,
            item.item_desc,
            item.stocked_in,
            item.VendorId
        ];
        await this.pool.query(query, values);
        return 'Product inserted';
    }

    async insertStockMovement(movement) {
        const query = `
            INSERT INTO stock_movements (product_id, store_id, type, quantity, timestamp)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [
            movement.product_id,
            movement.store_id,
            movement.type,
            movement.quantity,
            movement.timestamp
        ];
        await this.pool.query(query, values);
        return 'Movement inserted';
    }

    async getProductMovements(productId) {
        const [rows] = await this.pool.query(
            'SELECT * FROM stock_movements WHERE product_id = ? ORDER BY timestamp DESC',
            [productId]
        );
        return rows;
    }

    async updateProductStock(productId, deltaQty) {
        const query = `
            UPDATE inventory 
            SET quantity = quantity + ?
            WHERE product_id = ?
        `;
        await this.pool.query(query, [deltaQty, productId]);
        return 'Stock updated';
    }

    async readProductData(productId) {
        const [rows] = await this.pool.query(
            'SELECT * FROM inventory WHERE product_id = ?',
            [productId]
        );
        if (rows.length === 0) throw new Error('Product not found');
        return rows[0];
    }

    async getAllProducts() {
        const [rows] = await this.pool.query('SELECT * FROM inventory');
        return rows;
    }

    async deleteProduct(productId) {
        const [result] = await this.pool.query(
            'DELETE FROM inventory WHERE product_id = ?',
            [productId]
        );
        if (result.affectedRows === 0) throw new Error('Product not found');
        return 'Product deleted';
    }

    async GetUser(User_Name) {
        const [rows] = await this.pool.query(
            'SELECT * FROM users WHERE User_Name = ?',
            [User_Name]
        );
        if (rows.length === 0) throw new Error('User not found');
        return rows[0];
    }
}

module.exports = Database;
