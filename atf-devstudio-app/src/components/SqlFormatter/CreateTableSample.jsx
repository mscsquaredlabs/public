// src/components/SqlFormatter/CreateTableSample.jsx
// -----------------------------------------------------------------------------
//  - Sample CREATE TABLE statements for the SQL Table Visualizer
//  - Used in SqlFormatterConfig.jsx to provide example tables
// -----------------------------------------------------------------------------

// Basic user table with common fields
export const USER_TABLE_SAMPLE = `CREATE TABLE IF NOT EXISTS public.users
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    username character varying(50) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    hashed_password character varying(255) COLLATE pg_catalog."default",
    role character varying(50) COLLATE pg_catalog."default" NOT NULL,
    profile_picture character varying(500) COLLATE pg_catalog."default",
    bio text COLLATE pg_catalog."default",
    reputation_score integer DEFAULT 0,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_deleted boolean NOT NULL DEFAULT false,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_username_key UNIQUE (username)
)`;

// Product table with foreign keys
export const PRODUCT_TABLE_SAMPLE = `CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  category_id INT,
  supplier_id INT,
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (category_id) REFERENCES categories(category_id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

// Orders table with complex relationships
export const ORDERS_TABLE_SAMPLE = `CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
  order_date TIMESTAMP NOT NULL DEFAULT NOW(),
  shipping_address_id INTEGER REFERENCES addresses(address_id),
  billing_address_id INTEGER REFERENCES addresses(address_id),
  payment_method VARCHAR(50) CHECK (payment_method IN ('credit_card', 'paypal', 'bank_transfer', 'cash')),
  shipping_method VARCHAR(50) NOT NULL,
  order_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  subtotal NUMERIC(10,2) NOT NULL,
  tax_amount NUMERIC(10,2) NOT NULL,
  shipping_cost NUMERIC(10,2) NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  promo_code VARCHAR(20),
  notes TEXT,
  created_by INTEGER REFERENCES users(user_id),
  updated_at TIMESTAMP,
  CONSTRAINT chk_order_status CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  CONSTRAINT chk_total_amount CHECK (total_amount = subtotal + tax_amount + shipping_cost)
);`;

// Get all samples as an array for easier usage
export const ALL_SAMPLES = [
  { 
    name: 'User Table', 
    value: USER_TABLE_SAMPLE, 
    description: 'PostgreSQL user table with UUID primary key'
  },
  { 
    name: 'Product Table', 
    value: PRODUCT_TABLE_SAMPLE, 
    description: 'MySQL product table with foreign keys'
  },
  { 
    name: 'Orders Table', 
    value: ORDERS_TABLE_SAMPLE, 
    description: 'PostgreSQL orders table with checks and references'
  }
];

export default ALL_SAMPLES;