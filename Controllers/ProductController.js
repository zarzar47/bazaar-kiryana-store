const db = require("../Model/Database");

const Database = new db(); // Create a new instance of the Database class

 async function Stock_in(req, res) {
    const { store_id, product_id, quantity } = req.body;
  
    if (!store_id || !product_id || !state || !quantity) {
      return res.status(400).send({ error: 'All fields are required' });
    }
    const state = 'stock-in'; // Set the state to 'Stock in' for stock-in movements
    try {
      // Add the stock-in movement
      const movement = {
        store_id,
        product_id,
        type : state,  // 'Stock in'
        quantity,
        timestamp: new Date().toISOString().split('T')[0], // Get the current date in YYYY-MM-DD format
      };
  
      await Database.insertStockMovement(movement);

      // increase quantity
      await Database.updateProductStock(product_id, quantity);
  
      res.status(200).send({ message: 'Stock-in successful', movement });
    } catch (error) {
      res.status(500).send({ error: 'An error occurred', details: error.message });
    }
  };

async function Sale(req, res) {
    const { store_id, product_id, quantity } = req.body;
  
    if (!store_id || !product_id || !quantity) {
      return res.status(400).send({ error: 'All fields are required' });
    }
    const state = 'sale'; // Set the state to 'Sale' for sale movements
    try {
      // Add the sale movement (negative quantity for sale)
      const movement = {
        movement_id : 0, // This will be auto-generated in the database
        product_id,
        type : state,  // 'Sale'
        quantity: quantity,
        timestamp: new Date().toISOString().split('T')[0], // Get the current date in YYYY-MM-DD format
      };
  
      // Save the movement in the database
      await Database.insertStockMovement(movement);
  
      // Update the product's stock (decrease quantity)
      await Database.updateProductStock(product_id, -quantity);
      // event emitting for synchronous handling (for demonstration purposes only)
      const inventoryEmitter = require('../eventEmitter'); // Import the event emitter
      inventoryEmitter.emit('sale_event', {
        product_id: req.body.product_id,
        quantity: req.body.quantity,
        timestamp: new Date()
      });
      res.status(200).send({ message: 'Sale successful', movement });
    } catch (error) {
      res.status(500).send({ error: 'An error occurred', details: error.message });
    } 
}

async function Immediate_remove(req, res) {
  const { store_id, product_id, quantity } = req.body;

  if (!store_id || !product_id || !quantity) {
    return res.status(400).send({ error: 'All fields are required' });
  }
  const state = 'Imm'; // Set the state to 'Imm' for immediate removal movements
  try {
    // Add the manual removal movement (negative quantity for removal)
    const movement = {
      store_id,
      product_id,
      type: state,  // 'Imm' (for manual removal)
      quantity: quantity,
      timestamp: new Date().toISOString().split('T')[0], // Get the current date in YYYY-MM-DD format
    };

    // Save the movement in the database
    await Database.insertStockMovement(movement);

    // Update the product's stock (decrease quantity)
    await Database.updateProductStock(product_id, -quantity);

    res.status(200).send({ message: 'Manual stock removal successful', movement });
  } catch (error) {
    res.status(500).send({ error: 'An error occurred', details: error.message });
  }
}

async function Get_Product_Movements(req, res) {
  const productId = req.params.id;

  try {
    // Fetch all movements for the product
    const movements = await Database.getProductMovements(productId);

    res.status(200).send({ product_id: productId, movements });
  } catch (error) {
    res.status(500).send({ error: 'An error occurred', details: error.message });
  }
}

async function Add_New_Product(req, res) {
  const { storeID, product_id, ItemQuantity, price_per_unit, itemDesc, VendorId } = req.body;

  if (!product_id || !ItemQuantity || !price_per_unit || !itemDesc || !VendorId) {
    return res.status(400).send({ error: 'All fields are required' });
  }

  try {
    // Add the new product
    const stocked_in = new Date().toISOString().split('T')[0]; // Get the current date in YYYY-MM-DD format
    const product = { storeID, product_id, ItemQuantity, price_per_unit, itemDesc, stocked_in, VendorId };
    await Database.insertProduct(product);

    res.status(200).send({ message: 'Product added successfully', product });
  } catch (error) {
    res.status(500).send({ error: 'An error occurred', details: error.message });
  }
}

async function Remove_Products(req, res) {
  const productId = req.body.product_id;

  try {
    // Delete the product
    await Database.DeleteProduct(productId);
    
    // Delete all stock movements related to the product
    // await Database.deleteProductMovements(productId); (not necessary to remove product movements maybe)

    res.status(200).send({ message: 'Product and associated movements deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: 'An error occurred', details: error.message });
  }
}

async function Get_Products(req, res){
  try {

    const products = await Database.getAllProducts();
    return res.status(200).send({ products });
  } catch (error) {
    res.status(500).send({ error: 'Oops An error occurred', details: error.message });
  }
}

module.exports = {
    Stock_in,
    Sale,
    Immediate_remove,
    Get_Product_Movements,
    Add_New_Product,
    Get_Products,
    Remove_Products
  };