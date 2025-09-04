// Database Entity Interfaces

export interface User {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
    role: "user" | "admin";
    phone?: string;
    date_of_birth?: Date;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreateUserRequest {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone?: string;
    date_of_birth?: string;
    role?: string;
}

export interface Category {
    category_id: string;
    name: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateCategoryRequest {
    name: string;
    description?: string;
}

export interface Product {
    product_id: string;
    name: string;
    description?: string;
    price: number;
    stock_quantity: number;
    category_id?: string;
    sku?: string;
    image_url?: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreateProductRequest {
    name: string;
    description?: string;
    price: number;
    stock_quantity: number;
    category_id?: number;
    sku?: string;
    image_url?: string;
}

export interface UpdateProductRequest {
    name?: string;
    description?: string;
    price?: number;
    stock_quantity?: number;
    category_id?: number;
    sku?: string;
    image_url?: string;
    is_active?: boolean;
}

export interface Address {
    address_id: string;
    user_id: number;
    address_type: 'shipping' | 'billing' | 'both';
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
    created_at: Date;
}

export interface CreateAddressRequest {
    user_id: string;
    address_type: 'shipping' | 'billing' | 'both';
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    country?: string;
    is_default?: boolean;
}

export interface Order {
    order_id: string;
    user_id: string;
    order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total_amount: number;
    shipping_address_id?: string;
    billing_address_id?: string;
    payment_method: 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal' | 'cash_on_delivery';
    payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
    order_date: Date;
    shipped_date?: Date;
    delivered_date?: Date;
    tracking_number?: string;
    notes?: string;
}

export interface CreateOrderRequest {
    user_id: string;
    items: OrderItemRequest[];
    shipping_address_id?: string;
    billing_address_id?: string;
    payment_method: 'credit_card' | 'debit_card' | 'paypal' | 'cash_on_delivery';
    notes?: string;
}

export interface OrderItem {
    order_item_id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

export interface OrderItemRequest {
    product_id: string;
    quantity: number;
    unit_price: number;
}

export interface ShoppingCartItem {
    cart_id: string;
    user_id: string;
    product_id: string;
    quantity: number;
    added_at: Date;
    updated_at: Date;
}

export interface AddToCartRequest {
    user_id: string;
    product_id: string;
    quantity: number;
}

export interface ProductReview {
    review_id: string;
    product_id: string;
    user_id: string;
    rating: number;
    title?: string;
    review_text?: string;
    is_verified_purchase: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreateReviewRequest {
    product_id: string;
    user_id: string;
    rating: number;
    title?: string;
    review_text?: string;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Database Configuration Types
export interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}
