# kiyana-store
Bazaar Case Study
# Realtime Inventory Tracking System

## Overview

This is a real-time inventory management system designed initially for a single **kirayana store**, with the goal of scaling to support **thousands of stores**. The system tracks stock-in, sales, and manual removals with minimal latency and high availability. It is being developed with **scalability**, **resilience**, and **real-time processing** in mind.
---

## Architecture

The system is based on a modular and loosely coupled architecture. In order to implement the system in an understandable and progressive manner the development was split into 3 Stages. Each Stage expanded upon each-other in terms of completing the project goal and also adding additional complexity.

# Kiryana Store Inventory System – Phase 1

Phase 1 focuses on the base fundamental of our system ensuring a consistent and controlable inventory system for one kiryana store initially. The goal is to build a robust and extensible base capable of handling stock-ins, sales, and manual removals with full traceability, using a local storage backend.
---

##  Features

- Track **products** and **stock movements**.
- Calculate **current stock** from movement logs progressively.
- **REST API** based interaction.
- Local data persistence using a CSV file (easy to manipulate in excel).
- Modular and extensible design for future scalability.

---

## Core Key Concepts
There are 2 essential CSV files that capture two separate but important parts of the entire inventory system.
### 1. Product Catalogue file

Each product is identified by a `product_id` and has metadata for tracking and pricing.

| Field           | Type    | Description                                  |
|----------------|---------|----------------------------------------------|
| storeID        | int     | Store identifier (future multi-store support)|
| product_id     | int     | Unique product ID                            |
| ItemQuantity   | int     | Initial quantity (at time of stock-in)       |
| price_per_unit | float   | Cost per item                                |
| itemDesc       | string  | Product description                          |
| stocked_in     | date    | Date when product was added                  |
| VendorId       | int     | Identifier for supplier                      |

### 2. Stock Movement file

All inventory actions are event-based and tracked separately in `stock_movement.csv`.

| Field        | Type    | Description                                 |
|--------------|---------|---------------------------------------------|
| movement_id  | int     | Unique identifier for this movement         |
| product_id   | int     | Foreign key to the product                  |
| type         | enum    | `stock_in`, `sale`, or `manual_removal`     |
| quantity     | int     | Quantity changed                            |
| timestamp    | datetime| Time of movement                            |

---

## API Endpoints

### Product Operations

| Action                  | Method | URL                     | Description                            |
|------------------------|--------|--------------------------|----------------------------------------|
| Add Product            | PUT    | `/api/products/addProd`  | Register new product                   |
| Delete Product         | DELETE | `/api/products/removeProd`| Remove product & associated records    |
| Stock In               | POST   | `/api/products/stock-in` | Increase product quantity              |
| Sell Product           | POST   | `/api/products/sale`     | Decrease product quantity (sale)       |
| Manual Removal         | POST   | `/api/products/manual-removal`| Manual decrease (e.g., spoilage)       |
| Get Product Stock      | GET    | `/api/products/{id}` | Current stock level (computed)     |
| Get Product Movements  | GET    | `/api/products/movements/{id}` | History of stock changes        |

---

## Architectural Decisions

1. **Separation of Concerns (MVC Architecture)**  
   - `Model`: Defines product and movement schemas between the server and database.  
   - `View`: Minimal API interface.  
   - `Controller`: Handles logic between user requests and the model.

2. **Database Abstraction Layer**  
   - A singleton database class ensures centralized access to the flat-files, reducing risk of concurrency or multi-instance conflicts. It also adds the benefit of using abstracted class methods for the rest of the code-base because of which we can change implementations such as switching from flat-files to SQLite without major changes else where.

3. **Flat File Approach (CSV)**  
   - CSV-based backend.

4. **RESTful Design Principles**  
   - Stateless interaction  
   - Uniform interface  
   - Layered architecture  
   - Scalability and replaceability of components

---

## Trade-Offs Considered

| Decision                                  | Trade-Off                                                | Reasoning                                         |
|------------------------------------------|-----------------------------------------------------------|--------------------------------------------------|
| Progressive quantity computation         | no data inconsistency vs. incorrect-computation           | Since all computation is within our system we can ensure whether or not the computation can be incorrect       |
| Singleton DB manager                     | Tight coupling vs. easier transaction control            | Helps keep consistent access in local storage    |
| SQLite/local CSV                         | Limited concurrency vs. easy portability                 | Sufficient for small stores; lightweight setup   |
| Simple API instead of full dashboard     | Less user-friendly vs. faster development & test cycle           | Lays foundation before scaling to frontend       |


# Kiryana Store Inventory System – Phase 2

This phase extends the Phase 1 single-store inventory system into a scalable, multi-store model with improved relational structure and maintainability.

---

## Objectives

- Enable **multi-store support**
- Improve **data normalization**
- Prepare for **scalability and analytics**
- Maintain clean separation between data models and stock movement logic

---

## Key Components & Models
 In order to move away from the flat-file and single store approach and create a centralized database with multiple stores accessing the database at the same time, we need to utilize Database fundamentals and create a relational Database. This is because the information and data we want to store lends itself well to a SQL and relational database approach, instead of a document or noSQL style.
 In order to switch to a relational database we must first separate our data from the flat-files into independent tables which all-together will allow us to store the same and additional information in a far-more convenient and expandable form.
### 1. Store Table

Each store is now represented as an independent entity, identified by a unique `store_id`.

| Field        | Type    | Description                   |
|--------------|---------|-------------------------------|
| `store_id`   | Integer | Primary key for the store     |

---

### 2. Product Table

Products are still unique per store, but now explicitly tied to the `store_id`.

| Field           | Type    | Description                                 |
|-----------------|---------|---------------------------------------------|
| `product_id`    | Integer | Unique product identifier (per store)       |
| `store_id`      | Integer | Foreign key to `Store`                      |
| `quantity`      | Integer | Stock quantity                              |
| `price_per_unit`| Float   | Current price per unit                      |
| `itemDesc`      | Text    | Description of the item                     |
| `stocked_in`    | Date    | Initial stock-in date                       |
| `vendor_id`     | Integer | Supplier/vendor reference                   |

---

### 3. Stock Movements Table

Models all stock events (stock-ins, sales, removals), still decoupled from the product for traceability and event sourcing.

| Field         | Type    | Description                                       |
|---------------|---------|---------------------------------------------------|
| `movement_id` | Integer | Unique ID per movement                            |
| `store_id`    | Integer | Foreign key to Stores                             |
| `vendor_id`   | Integer | Foreign Key to Vendors                            |
| `product_id`  | Integer | Foreign key to Product                            |
| `type`        | Enum    | `"stock_in"`, `"sale"`, `"manual_removal"`        |
| `quantity`    | Integer | Quantity change (always positive)                 |
| `timestamp`   | DateTime| Time of movement                                  |

---

### 4. Vendors Table

Models Vendor information with the basic vendor_id as the primary key.

| Field       | Type    | Description                      |
|-------------|---------|----------------------------------|
| `vendor_id` | Integer | Unique ID for each unique vendor |


### 5. Inventory Table

| Field         | Type    | Description                                           |
|---------------|---------|-------------------------------------------------------|
| `store_id`    | Integer | Foreign key to `Stores(store_id)` – identifies store |
| `product_id`  | Integer | Foreign key to `Products(product_id)` – identifies product |
| `quantity`    | Integer | Quantity of the product currently in stock           |
| `stocked_in`  | Date    | Date when the item was initially stocked in          |


## Design Decisions

- **Multi-store normalization**: Products and stock movements are scoped to a specific store, enabling a clean separation of inventory per location.
- **Database schema** uses relational constraints to prevent duplication and improve data consistency.
- **Separation of concerns**: Movements are logged in a dedicated table to support future analytics like tracking turnover rates or vendor performance.

---

## Trade-offs Considered

| Decision | Trade-off | Justification |
|---------|-----------|---------------|
| Use of MySQL | Lighter than PostgreSQL or Oracle | Sufficient for local or small-scale multi-store deployments |
| Explicit store-product link | Slightly more complexity in queries | Essential for multi-store correctness |
| Movement log as source of truth | Requires recalculating current quantity | Enables full traceability and supports future rollbacks or audits |
---

# Kiryana Store Inventory System — Phase 3

## Overview

In this final phase we can describe the  Kiryana Store Inventory System as a monolithic application designed to manage inventory for small-scale retail stores. It ensures real-time consistency between a local and central MySQL database using event-sourced synchronization, while maintaining per-store security through JWT-based authentication.

This phase introduces:
- Full multi-store support
- Event-driven synchronization
- Strong consistency
- Central database integration

---

## Server-side scalability

Due to the large number of requests we will be receiving and handling its imperitive that we introduce some sort of mechanism by which we can reduce the strain on the server as much as possible. Here we can implement a load-balancer. A load balancer will allow us to reduce the strain on a single server by utilizing multiple servers and dividing the load in such a way that we avoid burdening a single server. A very popular choice for load-balancing we will use is nginx which is a HTTP server, load balancer, reverse proxy, etc all rolled up into one server, this is a very popular choice among web servers.
- The server we have implemented so far in express.js is stateless and ready to be horizontally scaled by running multiple instances using docker behind a load balancer.

---

## Asynchronous Updates

In order to implement asynchronous updates, we can use event systems like message queues (e.g., RabbitMQ or Kafka) to publish events whenever inventory changes occur, allowing other parts of the system—such as analytics, syncing, or notifications—to process these events independently without blocking the main flow. For my implementation to simplify matters I created a very generic event handler by emitting and handling events for synchronization.
In order to reduce the number of API calls that can hinder the servers we also reduced each client to only be allowed about 100 calls to the server per 15 minute time-window, this is acceptable since we cannot expect there to be more than 100 inventory operations from a single store.
---

## Database Design

- **Local MySQL** instance handles all store data.
- **Event log table** stores all stock movement events, each stamped with a timestamp and sync status.
- **Central MySQL** database acts as the master data sink to support central visibility and reporting.
In order to reduce the strain on a central database we divide the database into multiple sections that each contain a separate section of the original data (in this case we are dividing based on store_id), this is known as sharding. Sharding allows us to horizontally expand the data, but this creates another requirement where we need to add a separate sharding router to know which shard to pass requests too.
An important aspect of MySQL and most relational databases is that we do not need to implement Read/Write separation explicitly as it is done within the database system.

## Syncing Logic

- Events (stock-in, sales, manual removals) are logged in a local `EventLog` table.
- A scheduled job pushes unsynced events to the central server using authenticated HTTPS requests.
- Upon success, event status is marked as synced locally.

Conflict resolution is handled by:
- Applying events only if the last known quantity matches.
- Falling back to a reconciliation process if divergence is detected.
- Any other Database resolution system that MySQL utilizes.
---

### Design Decisions & Trade-offs

- **Monolithic over Microservices**: Easier to maintain under time constraints, less infrastructure complexity.
- **MySQL over PostgreSQL**: Familiarity and ease of use, despite PostgreSQL offering richer features.
- **Event-driven updates**: Emulated via Node.js EventEmitter to show asynchronous design.
- **Horizontal scaling**: Achieved via stateless server design + future deployment via load balancer.
- **Read/Write separation & caching**: Future Redis integration and replica routing is possible.
- **JWT Auth**: Ensures each store manages its own data securely.


## Key Design Decisions

### 1. **Relational DB over NoSQL**

- **Why**: The data has strong relationships (inventory per store, sales per item), and queries require joins and transactional guarantees.
- **Trade-off**: Slightly reduced flexibility and higher write latency compared to NoSQL.
- **Decision**: Chosen for **data consistency**, **relational modeling**, and **complex queries** like reporting.

---

### 2. **CLI-first Development**

- **Why**: Faster iteration, easier debugging, and fewer dependencies during early development.
- **Trade-off**: No web interface or user-facing features yet.
- **Decision**: Chosen for **developer velocity** and a **testable backend foundation** before building frontends.

---

### 3. **Decoupling with Event Sourcing**

- **Why**: To avoid bottlenecks and allow asynchronous processing (e.g., database writes, alerts, batch operations).
- **Trade-off**: Adds operational complexity and message consistency concerns.
- **Decision**: Chosen for **scalability** and **resilience**. Failure in one component doesn't halt the whole system.
---


## Deployment & Scaling Notes

- Horizontally scalable by stateless APIs and cache-first reads.
- Event sourcing and queues allow high-volume stores to operate independently.
- Modular services support breaking into microservices if needed later.

---

## Conclusion

This system prioritizes **scalability**, **real-time performance**, and **data integrity**. While the architecture introduces complexity, each decision supports long-term maintainability and scaling across multiple stores.

