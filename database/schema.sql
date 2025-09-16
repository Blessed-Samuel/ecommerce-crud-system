-- My E-Commerce Database Management System
CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- 1. Categories Table
CREATE TABLE categories (
    category_id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Products Table
CREATE TABLE products (
    product_id CHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    category_id CHAR(36),
    sku VARCHAR(50) UNIQUE,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE
    SET NULL
);

-- 3. Users Table
CREATE TABLE users (
    user_id CHAR(36) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('user', 'admin') DEFAULT 'user',
    date_of_birth DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Addresses Table
CREATE TABLE addresses (
    address_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    address_type ENUM('shipping', 'billing', 'both') DEFAULT 'shipping',
    street_address VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'United States',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 5. Orders Table
CREATE TABLE orders (
    order_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    order_status ENUM(
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
    ) DEFAULT 'pending',
    total_amount DECIMAL(12, 2) NOT NULL CHECK (total_amount >= 0),
    shipping_address_id CHAR(36),
    billing_address_id CHAR(36),
    payment_method ENUM(
        'credit_card',
        'debit_card',
        'bank_transfer',
        'paypal',
        'cash_on_delivery'
    ) NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipped_date TIMESTAMP NULL,
    delivered_date TIMESTAMP NULL,
    tracking_number VARCHAR(100),
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (shipping_address_id) REFERENCES addresses(address_id) ON DELETE
    SET NULL,
        FOREIGN KEY (billing_address_id) REFERENCES addresses(address_id) ON DELETE
    SET NULL
);

-- 6. Order Items Table
CREATE TABLE order_items (
    order_item_id CHAR(36) PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT,
    UNIQUE KEY unique_order_product (order_id, product_id)
);

-- 7. Shopping Cart Table
CREATE TABLE shopping_cart (
    cart_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_cart (user_id, product_id)
);

-- 8. Product Reviews Table
CREATE TABLE product_reviews (
    review_id CHAR(36) PRIMARY KEY,
    product_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    title VARCHAR(200),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_review (user_id, product_id)
);

-- 9. User Profiles Table (One-to-One with Users)
CREATE TABLE user_profiles (
    profile_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL UNIQUE,
    avatar_url VARCHAR(500),
    bio TEXT,
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_role ON users(role);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_cart_user ON shopping_cart(user_id);
CREATE INDEX idx_reviews_product ON product_reviews(product_id);

-- Categories
INSERT INTO categories (category_id, name, description)
VALUES (
        UUID(),
        'Electronics',
        'Electronic devices and gadgets'
    ),
    (UUID(), 'Clothing', 'Fashion and apparel'),
    (UUID(), 'Books', 'Books and educational materials'),
    (
        UUID(),
        'Home & Garden',
        'Home improvement and gardening supplies'
    ),
    (UUID(), 'Sports', 'Sports and fitness equipment');

-- Products
INSERT INTO products (
        product_id,
        name,
        description,
        price,
        stock_quantity,
        category_id,
        sku
    )
SELECT UUID(),
    'iPhone 15 Pro',
    'Latest Apple smartphone with advanced camera',
    999.99,
    50,
    category_id,
    'IPHONE15PRO001'
FROM categories
WHERE name = 'Electronics';

INSERT INTO products (
        product_id,
        name,
        description,
        price,
        stock_quantity,
        category_id,
        sku
    )
SELECT UUID(),
    'Samsung 4K TV',
    '55-inch Smart TV with HDR support',
    799.99,
    25,
    category_id,
    'SAMSUNG4K55'
FROM categories
WHERE name = 'Electronics';

INSERT INTO products (
        product_id,
        name,
        description,
        price,
        stock_quantity,
        category_id,
        sku
    )
SELECT UUID(),
    'Nike Running Shoes',
    'Comfortable running shoes for daily training',
    129.99,
    100,
    category_id,
    'NIKE_RUN_001'
FROM categories
WHERE name = 'Sports';

INSERT INTO products (
        product_id,
        name,
        description,
        price,
        stock_quantity,
        category_id,
        sku
    )
SELECT UUID(),
    'Wireless Headphones',
    'Bluetooth headphones with noise cancellation',
    199.99,
    75,
    category_id,
    'HEADPHONE_WL001'
FROM categories
WHERE name = 'Electronics';

INSERT INTO products (
        product_id,
        name,
        description,
        price,
        stock_quantity,
        category_id,
        sku
    )
SELECT UUID(),
    'Programming Book',
    'Complete guide to web development',
    49.99,
    200,
    category_id,
    'BOOK_PROG_001'
FROM categories
WHERE name = 'Books';

-- Users
INSERT INTO users (
        user_id,
        first_name,
        last_name,
        email,
        password_hash,
        phone,
        role
    )
VALUES (
        UUID(),
        'John',
        'Doe',
        'john.doe@email.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        '+1-555-0101',
        'user'
    ),
    (
        UUID(),
        'Jane',
        'Smith',
        'jane.smith@email.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        '+1-555-0102',
        'user'
    ),
    (
        UUID(),
        'Mike',
        'Johnson',
        'mike.j@email.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        '+1-555-0103',
        'user'
    );

-- User Profiles
INSERT INTO user_profiles (
        profile_id,
        user_id,
        avatar_url,
        bio,
        preferences
    )
SELECT UUID(),
    user_id,
    'https://example.com/avatars/john.png',
    'Tech enthusiast and gadget lover',
    '{"theme":"dark"}'
FROM users
WHERE email = 'john.doe@email.com';

INSERT INTO user_profiles (
        profile_id,
        user_id,
        avatar_url,
        bio,
        preferences
    )
SELECT UUID(),
    user_id,
    'https://example.com/avatars/jane.png',
    'Fashionista and avid reader',
    '{"theme":"light"}'
FROM users
WHERE email = 'jane.smith@email.com';

-- Sample Orders
INSERT INTO orders (
        order_id,
        user_id,
        total_amount,
        payment_method,
        payment_status,
        order_status,
        shipping_address_id,
        billing_address_id
    )
SELECT UUID(),
    u.user_id,
    1129.98,
    'credit_card',
    'completed',
    'processing',
    a.address_id,
    a.address_id
FROM users u
    JOIN addresses a ON u.user_id = a.user_id
WHERE u.email = 'john.doe@email.com'
LIMIT 1;

-- Sample Order Items
INSERT INTO order_items (
        order_item_id,
        order_id,
        product_id,
        quantity,
        unit_price
    )
SELECT UUID(),
    o.order_id,
    p.product_id,
    1,
    p.price
FROM orders o
    JOIN products p ON p.sku = 'IPHONE15PRO001'
LIMIT 1;

INSERT INTO order_items (
        order_item_id,
        order_id,
        product_id,
        quantity,
        unit_price
    )
SELECT UUID(),
    o.order_id,
    p.product_id,
    1,
    p.price
FROM orders o
    JOIN products p ON p.sku = 'NIKE_RUN_001'
LIMIT 1;

-- Sample Reviews
INSERT INTO product_reviews (
        review_id,
        product_id,
        user_id,
        rating,
        title,
        review_text,
        is_verified_purchase
    )
SELECT UUID(),
    p.product_id,
    u.user_id,
    5,
    'Amazing Phone!',
    'The camera and performance are top-notch.',
    TRUE
FROM products p,
    users u
WHERE p.sku = 'IPHONE15PRO001'
    AND u.email = 'john.doe@email.com'
LIMIT 1;

INSERT INTO product_reviews (
        review_id,
        product_id,
        user_id,
        rating,
        title,
        review_text,
        is_verified_purchase
    )
SELECT UUID(),
    p.product_id,
    u.user_id,
    4,
    'Great shoes',
    'Comfortable for daily running, but size runs small.',
    TRUE
FROM products p,
    users u
WHERE p.sku = 'NIKE_RUN_001'
    AND u.email = 'jane.smith@email.com'
LIMIT 1;
