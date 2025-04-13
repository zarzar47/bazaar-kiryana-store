const fs = require('fs');
const path = require('path');
const fastcsv = require('fast-csv'); // Assuming you're using fast-csv
const csvParser = require('csv-parser');
const { writeToPath } = require('@fast-csv/format');

class Database {
    static instance = null;

    // Private constructor to prevent multiple instances
    constructor() {
        if (Database.instance) {
            return Database.instance;
        }

        this.dbType = 'csv'; // You can set this to 'csv', 'mysql', 'postgres' etc.
        this.inventory = path.join(__dirname, '../LocalFiles/inventory_data.csv'); // Path to your CSV
        this.stockmovement = path.join(__dirname, '../LocalFiles/stock_movement.csv'); // Path to your CSV
        Database.instance = this; // this is for implementing singleton pattern
    }

    // Private method to read CSV file and return data
    _readCSV(filePath) {
        return new Promise((resolve, reject) => {
            const results = [];
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (data) => results.push(data)) // pushes the current line into results
                .on('end', () => resolve(results)) // resolves the promise with the results
                .on('error', reject); // rejects the promise if there's an error
        });
    }

    // Insert a new product or item into the CSV (or other database)
    async insertProduct(item) {
        const data = await this._readCSV(this.inventory);
        data.push(item);
        return this._writeCSV(data, this.inventory);
    }

    async insertStockMovement(movement) {
        const data = await this._readCSV(this.stockmovement);
        movement.movement_id = data.length + 1; // Add movement_id as the current data length + 1
        console.log(movement);
        data.push(movement);
        return this._writeCSV(data, this.stockmovement);
    }

    async getProductMovements(itemId) {
        const data = await this._readCSV(this.stockmovement);
        const itemIndex = data.findIndex(item => item.product_id === itemId);
        if (itemIndex !== -1) {
            return data[itemIndex];
        }
        return null;
    }

    // Update a product's stock in the CSV
    async updateProductStock(itemId, newQuantity) {
        itemId = itemId.toString(); // Ensure itemId is a string
        const data = await this._readCSV(this.inventory);
        const itemIndex = data.findIndex(item => item.product_id === itemId);

        if (itemIndex !== -1) {
            const ItemQuantity = data[itemIndex].ItemQuantity;
            data[itemIndex].ItemQuantity = parseInt(ItemQuantity) + parseInt(newQuantity); // Update the quantity
            return this._writeCSV(data, this.inventory);
        } else {
            throw new Error('Item not found');
        }
    }

    async ReadProductData(itemId){
        const data = await this._readCSV(this.inventory);
        const itemIndex = data.findIndex(item => item.product_id === itemId);

        if (itemIndex !== -1) {
            return data[itemIndex];
        } else {
            throw new Error('Item not found');
        }
    }

    async getAllProducts() {
        const data = await this._readCSV(this.inventory);
        return data;
    }

    async DeleteProduct(itemId) {
        itemId = itemId.toString(); // Ensure itemId is a string
        const data = await this._readCSV(this.inventory);
        const itemIndex = data.findIndex(item =>
            item.product_id === itemId
        );
        if (itemIndex !== -1) {
            data.splice(itemIndex, 1);
            this._writeCSV(data, this.inventory);
        } else {
            throw new Error('Item not found');
        }
    }

    // Write data to the CSV file (or other database)
    _writeCSV(data, filePath) {
        return new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(filePath);
            fastcsv
                .write(data, { headers: true })
                .pipe(writeStream)
                .on('finish', () => resolve('Write completed'))
                .on('error', reject);
        });
    }
}

module.exports = Database;