# E-Commerce CRUD System

A full-featured RESTful API for an e-commerce system built with Node.js, Express, and MySQL. This project demonstrates complete database design with CRUD operations for products, orders, and users.

## 🚀 Features

- **Complete Database Schema**: Well-structured MySQL database with proper relationships
- **RESTful API**: Full CRUD operations for multiple entities
- **Data Validation**: Input validation using Joi
- **Security**: Helmet, CORS, and rate limiting
- **Environment Configuration**: Configurable via environment variables
- **Comprehensive Documentation**: API endpoints and setup instructions

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v14.0.0 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**
- **Git**

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ecommerce-crud-system.git
cd ecommerce-crud-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup

#### Create MySQL Database:
```sql
-- Login to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE ecommerce_db;
USE ecommerce_db;
exit
```

#### Locate the Database Schema:
```
Visit the folder: /src/database/schema.sql
```

#### Import Database Schema:
```bash
# Import the complete schema with sample data
mysql -u root -p ecommerce_db < database/schema.sql
```

### 4. Environment Configuration

Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_db

# Security
JWT_SECRET=your_jwt_secret_key_here
```

### 5. Run the Application

#### Development Mode:
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📊 Database Schema

The system includes the following entities with proper relationships:

- **Users**: Customer information and authentication
- **Products**: Product catalog with categories
- **Categories**: Product categorization
- **Orders**: Order management and tracking
- **Order Items**: Junction table for order-product relationships
- **Shopping Cart**: User shopping cart functionality
- **Addresses**: User shipping and billing addresses
- **Product Reviews**: Product rating and review system

### Entity Relationships:
- **One-to-One**: user_profiles
- **One-to-Many**: Users→Orders, Categories→Products, Users→Addresses
- **Many-to-Many**: Orders↔Products (via Order Items), Users↔Products (via Cart)

## 🔌 API Endpoints

### System
- `GET /api/v1` → API Info (all endpoints, version, status)
- `GET /api/v1/health` → Health check + DB connection status

### Users
- `POST /api/v1/users/register` → Register new user
- `POST /api/v1/users/login` → User login
- `GET /api/v1/users/profile` → Get user profile (requires Auth)

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create new product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

### Orders
- `GET /api/v1/orders` - Get all orders
- `GET /api/v1/orders/:id` - Get order by ID
- `GET /api/v1/orders/user/:userId` - Get orders by user
- `POST /api/v1/orders` - Create new order
- `PUT /api/v1/orders/:id` - Update order
- `DELETE /api/v1/orders/:id` - Delete order

### Users
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Categories
- `GET /api/v1/categories` - Get all categories
- `POST /api/v1/categories` - Create new category

### Shopping Cart
- `GET /api/v1/cart/:userId` - Get user's cart
- `POST /api/v1/cart` - Add item to cart
- `PUT /api/v1/cart/:cartId` - Update cart item
- `DELETE /api/v1/cart/:cartId` - Remove item from cart

## 📝 API Usage Examples

### Create a Product
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Laptop",
    "description": "High-performance gaming laptop",
    "price": 1299.99,
    "stock_quantity": 10,
    "category_id": 1,
    "sku": "LAPTOP_GAMING_001"
  }'
```

### Get All Products
```bash
curl http://localhost:3000/api/v1/products
```

### Create an Order
```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "items": [
      {
        "product_id": 1,
        "quantity": 2,
        "unit_price": 999.99
      }
    ],
    "shipping_address_id": 1,
    "payment_method": "credit_card"
  }'
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 📁 Project Structure

```
ecommerce-crud-system/
│
├── database/
│   └── schema.sql              # Your database schema from Question 1
│
├── src/
│   ├── config/
│   │   └── database.js         # Database connection configuration
│   ├── controllers/
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── userController.js
│   ├── routes/
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── users.js
│   ├── middleware/
│   │   └── validation.js       # Request validation middleware
│   └── utils/
│       └── helpers.js          # Utility functions
│
├── tests/                      # Optional: Unit tests
│   └── api.test.js
│
├── docs/                       # API documentation
│   └── api-endpoints.md
│
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore file
├── package.json                # Node.js dependencies
├── server.js                   # Main application entry point
└── README.md                   # Project documentation
```

## 🔒 Security Features

- **Input Validation**: All requests validated using Joi
- **Rate Limiting**: Prevents API abuse
- **CORS**: Configurable cross-origin requests
- **Helmet**: Security headers
- **Environment Variables**: Sensitive data protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support
If you have any questions or issues, please:
1. Check the [API documentation](docs/API.md)
2. Open an issue on GitHub
3. Contact: samuelalisigwe22@gmail.com

## 🙏 Acknowledgments
- Built as part of a Database Management System assignment
- Demonstrates real-world e-commerce database design
- Implements industry-standard REST API practices
