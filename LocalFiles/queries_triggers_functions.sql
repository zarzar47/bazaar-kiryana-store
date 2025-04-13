DELIMITER //

CREATE TRIGGER update_inventory_after_movement
AFTER INSERT ON stock_movements
FOR EACH ROW
BEGIN
    DECLARE changeVal INT;

    IF NEW.type = 'stock_in' THEN
        SET changeVal = NEW.quantity;
    ELSEIF NEW.type = 'sale' OR NEW.type = 'manual_removal' THEN
        SET changeVal = -NEW.quantity;
    ELSE
        SET changeVal = 0;
    END IF;

    INSERT INTO inventory (storeID, product_id, quantity)
    VALUES (NEW.storeID, NEW.product_id, changeVal)
    ON DUPLICATE KEY UPDATE quantity = quantity + changeVal;
END;
//

DELIMITER ;

DELIMITER //

CREATE FUNCTION get_current_stock(store_id INT, product_id INT)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE current_qty INT;

    SELECT quantity INTO current_qty
    FROM inventory
    WHERE storeID = store_id AND product_id = product_id;

    RETURN IFNULL(current_qty, 0);
END;
//

DELIMITER ;

DELIMITER //

CREATE PROCEDURE stock_in_product(
    IN in_storeID INT,
    IN in_product_id INT,
    IN in_quantity INT
)
BEGIN
    INSERT INTO stock_movements (storeID, product_id, type, quantity, timestamp)
    VALUES (in_storeID, in_product_id, 'stock_in', in_quantity, NOW());
END;
//

DELIMITER ;

# View full movement history for a product
SELECT 
    sm.movement_id,
    sm.storeID,
    s.store_name,
    sm.product_id,
    p.itemDesc,
    sm.type,
    sm.quantity,
    sm.timestamp
FROM stock_movements sm
JOIN products p ON sm.product_id = p.product_id
JOIN stores s ON sm.storeID = s.store_id
WHERE sm.product_id = 101
ORDER BY sm.timestamp DESC;

# View total stock at each store for each product
SELECT 
    i.storeID,
    s.store_name,
    i.product_id,
    p.itemDesc,
    i.quantity AS current_stock
FROM inventory i
JOIN stores s ON i.storeID = s.store_id
JOIN products p ON i.product_id = p.product_id
ORDER BY s.store_name, p.itemDesc;

# Find low-stock products (threshold = 10)
SELECT 
    i.storeID,
    s.store_name,
    p.product_id,
    p.itemDesc,
    i.quantity
FROM inventory i
JOIN stores s ON i.storeID = s.store_id
JOIN products p ON i.product_id = p.product_id
WHERE i.quantity < 10
ORDER BY i.quantity ASC;
