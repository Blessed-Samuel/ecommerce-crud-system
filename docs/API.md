# Ecommerce CRUD System API Documentation

Base URL: `http://localhost:3000/api/v1`

---

## Users

### Register a new user

**Endpoint:** `POST /v1/users/register`

**Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john12@example.com",
  "password": "12345678",
  "phone": "1234567890",
  "role": "user",
  "date_of_birth": "1990-05-21"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "user_id": 6,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "JWT_TOKEN_HERE"
}
```

---

### User login

**Endpoint:** `POST /v1/users/login`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "12345678"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "user": {
    "user_id": 5,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "role": "user"
  }
    "token": "JWT_TOKEN_HERE",
}
```

**Note:** Use the token in `Authorization` header for protected routes:

```
Authorization: Bearer JWT_TOKEN_HERE
```

---

### Get user profile (protected)

**Endpoint:** `GET /v1/users/profile`

**Headers:**

```
Authorization: Bearer JWT_TOKEN_HERE
```

**Response:**

```json
{
  "user": {
    "user_id": 5,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "user",
    "created_at": "2025-09-02T20:47:10.000Z"
  }
}
```

---

### Update user profile (protected)

**Endpoint:** `PUT /v1/users/profile`

**Headers:**

```
Authorization: Bearer JWT_TOKEN_HERE
```

**Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "0987654321"
}
```

**Response:**

```json
{
  "message": "Profile updated successfully"
}
```

---

### Admin: Get all users

**Endpoint:** `GET /v1/users/`

**Headers:**

```
Authorization: Bearer JWT_TOKEN_HERE
```

**Response:**

```json
{
  "users": [
    {
      "user_id": 5,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "user",
      "is_active": true,
      "created_at": "2025-09-02T20:47:10.000Z"
    }
  ]
}
```

---

### Admin: Update user role/status

**Endpoint:** `PUT /v1/users/:id`

**Headers:**

```
Authorization: Bearer JWT_TOKEN_HERE
```

**Request Body:**

```json
{
  "role": "admin",
  "is_active": true
}
```

**Response:**

```json
{
  "message": "User updated successfully"
}
```

---

## Products

### Get all products

**Endpoint:** `GET /v1/products`

**Response:**

```json
[
  {
    "product_id": 1,
    "name": "iPhone 15 Pro",
    "description": "Latest Apple smartphone with advanced camera",
    "price": "999.99",
    "stock_quantity": 50,
    "category_id": 1,
    "sku": "IPHONE15PRO001",
    "image_url": null,
    "is_active": 1,
    "created_at": "2025-09-02T20:47:10.000Z",
    "updated_at": "2025-09-02T20:47:10.000Z"
  }
]
```

---

### Get product by ID

**Endpoint:** `GET /v1/products/:id`

**Response:**

```json
{
  "product_id": 1,
  "name": "iPhone 15 Pro",
  "description": "Latest Apple smartphone with advanced camera",
  "price": "999.99",
  "stock_quantity": 50,
  "category_id": 1,
  "sku": "IPHONE15PRO001",
  "image_url": null,
  "is_active": 1,
  "created_at": "2025-09-02T20:47:10.000Z",
  "updated_at": "2025-09-02T20:47:10.000Z"
}
```

---

### Create product (Admin)

**Endpoint:** `POST /v1/products`

**Headers:**

```
Authorization: Bearer JWT_TOKEN_HERE
```

**Request Body:**

```json
{
  "name": "Samsung 4K TV",
  "description": "55-inch Smart TV with HDR support",
  "price": 799.99,
  "stock_quantity": 25,
  "category_id": 1,
  "sku": "SAMSUNG4K55",
  "image_url": null
}
```

**Response:**

```json
{
  "product_id": 2,
  "name": "Samsung 4K TV",
  "price": 799.99,
  "category_id": 1
}
```

---

### Update product (Admin)

**Endpoint:** `PUT /v1/products/:id`

**Headers:**

```
Authorization: Bearer JWT_TOKEN_HERE
```

**Request Body:**

```json
{
  "name": "Samsung 4K TV Ultra",
  "price": 899.99,
  "stock_quantity": 20
}
```

**Response:**

```json
{
  "product_id": 2,
  "name": "Samsung 4K TV Ultra",
  "price": 899.99,
  "category_id": 1
}
```

---

### Delete product (Admin)

**Endpoint:** `DELETE /v1/products/:id`

**Headers:**

```
Authorization: Bearer JWT_TOKEN_HERE
```

**Response:**

```json
{
  "message": "Product deleted successfully"
}
```

---

### Get products by category

**Endpoint:** `GET /v1/products/category/:categoryId`

**Response:**

```json
[
  {
    "product_id": 1,
    "name": "iPhone 15 Pro",
    "category_id": 1,
    "price": "999.99"
  }
]
```

---

## Authentication & Roles

- **JWT tokens** for protected routes.
- Roles:
  - `user`: view products, access own profile
  - `admin`: full CRUD on products, manage users

Include token in `Authorization` header:

```
Authorization: Bearer JWT_TOKEN_HERE
```
