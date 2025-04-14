CREATE TABLE Stores (
store_id INT PRIMARY KEY
);

CREATE TABLE Vendors (
vendor_id INT PRIMARY KEY
);

CREATE TABLE Products (
product_id INT PRIMARY KEY,
item_desc VARCHAR(255),
price_per_unit FLOAT,
vendor_id INT,
FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id)
);

CREATE TABLE Inventory (
store_id INT,
product_id INT,
quantity INT,
stocked_in DATE,
PRIMARY KEY (store_id, product_id),
FOREIGN KEY (store_id) REFERENCES Stores(store_id),
FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

CREATE TABLE StockMovements (
movement_id INT PRIMARY KEY AUTO_INCREMENT,
store_id INT,
vendor_id INT,
product_id INT,
type ENUM('stock_in', 'sale', 'manual_removal'),
quantity INT,
timestamp DATETIME,
FOREIGN KEY (store_id) REFERENCES Stores(store_id),
FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id),
FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

CREATE TABLE Users (
user_Name varchar(255) PRIMARY KEY,
user_Pass varchar(255)
);