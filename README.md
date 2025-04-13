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

The Kiryana Store Inventory System is a monolithic application designed to manage inventory for small-scale retail stores. It ensures real-time consistency between a local and central MySQL database using event-sourced synchronization, while maintaining per-store security through JWT-based authentication.

This phase introduces:
- Full multi-store support
- Secure access control
- Event-driven synchronization
- Strong consistency
- Central database integration

---

## Architecture Summary (Monolithic)

The system follows a **monolithic architecture** where all core functionalities — inventory management, user authentication, event syncing, and reporting — are implemented as modules within a single deployable unit.

### Components:
| Module | Role |
|--------|------|
| **Inventory Module** | Handles product additions, updates, stock movements (stock-in, sale, manual removal). |
| **Event Module** | Tracks all changes and queues them for syncing with the central DB. |
| **Auth Module** | Issues and validates JWT tokens, with role-based access tied to individual stores. |
| **Sync Module** | Periodically pushes local events to the central database and handles conflict resolution. |
| **Reporting Module** | Provides product-level and store-level summaries and analytics. |

---

## API Design Principles

The API follows RESTful design principles:

- **Stateless**: Each request is independent and must include a valid JWT.
- **Uniform Interface**: Clear endpoints for each resource and action.
- **Layered System**: Modules are logically separated but reside in the same process space.
- **Cacheable**: Response headers indicate whether a response is cacheable (where appropriate).

---

## Authentication and Authorization

- **JWT Tokens** are issued per store during login.
- Each token includes claims like `store_id` and `role` (e.g., manager, viewer).
- Sensitive operations (e.g., stock updates) are protected by middleware checking token validity and role-based access.

---

## Database Design

- **Local MySQL** instance handles all store data.
- **Event log table** stores all stock movement events, each stamped with a timestamp and sync status.
- **Central MySQL** database acts as the master data sink to support central visibility and reporting.

Tables include:

- `Products`
- `Inventory`
- `StockMovements`
- `Users`
- `EventLog`

---

## Syncing Logic

- Events (stock-in, sales, manual removals) are logged in a local `EventLog` table.
- A scheduled job pushes unsynced events to the central server using authenticated HTTPS requests.
- Upon success, event status is marked as synced locally.

Conflict resolution is handled by:
- Applying events only if the last known quantity matches.
- Falling back to a reconciliation process if divergence is detected.

---

## Deployment Recommendations

### Local (per store):
- Single instance (e.g., Python Flask / FastAPI or Node.js Express)
- MySQL community edition
- Simple cron-based job or background thread for syncing

### Central (cloud):
- Secure MySQL instance
- Reverse proxy (e.g., Nginx) for exposing sync endpoint
- HTTPS enforced with token verification middleware

**Environment Variables:**
- `SECRET_KEY` for JWT
- `MYSQL_LOCAL_URI`
- `MYSQL_CENTRAL_URI`
- `SYNC_INTERVAL_SECONDS`

---

## Future Considerations

- **Microservice Transition**: As usage scales, modules (like Auth, Sync) can be extracted into microservices.
- **Offline Mode**: Support for continued operation during network outages.
- **Admin Portal**: Web-based dashboard for managing stores and inventory centrally.
- **Advanced Conflict Resolution**: Implement vector clocks or version-based conflict tracking.
- **Analytics Integration**: Add support for tools like Metabase or Superset.

---

## Example API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/products/add` | Add a new product to inventory |
| `POST` | `/api/stock/sale` | Register a sale |
| `POST` | `/api/stock/manual-removal` | Manual quantity adjustment |
| `GET`  | `/api/products/:id/quantity` | Get current quantity |
| `POST` | `/api/auth/login` | Authenticate and receive JWT token |

---


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

### 3. **Decoupling with Message Queues**

- **Why**: To avoid bottlenecks and allow asynchronous processing (e.g., database writes, alerts, batch operations).
- **Trade-off**: Adds operational complexity and message consistency concerns.
- **Decision**: Chosen for **scalability** and **resilience**. Failure in one component doesn't halt the whole system.

---

### 4. **Caching with Redis**

- **Why**: Reads (e.g., checking current stock) should be fast and frequent.
- **Trade-off**: Risk of stale data if invalidation isn’t handled properly.
- **Decision**: Used for **read performance**. Writes always go to the DB, but the cache is updated or invalidated as needed.

---

### 5. **Write-Only DB from Services**

- **Why**: Prevent read-write race conditions and enforce cache use.
- **Trade-off**: Slightly increased logic complexity.
- **Decision**: Ensures **cache is always authoritative** for reads, helping with **horizontal scaling** in future.

---

## Deployment & Scaling Notes

- Horizontally scalable by stateless APIs and cache-first reads.
- Background workers and queues allow high-volume stores to operate independently.
- Modular services support breaking into microservices if needed later.

---

## Conclusion

This system prioritizes **scalability**, **real-time performance**, and **data integrity**. While the architecture introduces complexity, each decision supports long-term maintainability and scaling across multiple stores.

