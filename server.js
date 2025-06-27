import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'bunicas1_user1',
    password: process.env.DB_PASSWORD || 'I%mH;-+ic&a&',
    database: process.env.DB_NAME || 'bunicas1_bunicashop',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
const testConnection = async () => {
    try {
        console.log('=== Testing Database Connection ===');
        console.log('Database config:', {
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'bunicas1_bunicashop',
            user: process.env.DB_USER || 'bunicas1_bunicashop'
        });

        const connection = await pool.getConnection();
        console.log('Database connection successful');
        
        // Test query to verify access
        const [tables] = await connection.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = ? 
            AND table_name IN ('products', 'users', 'orders', 'cart')
        `, [process.env.DB_NAME || 'bunicas1_bunicashop']);
        
        console.log('Available tables:', tables.map(t => t.table_name));
        
        // Check products table
        const [products] = await connection.query('SELECT COUNT(*) as count FROM products');
        console.log('Products in database:', products[0].count);
        
        connection.release();
        return true;
    } catch (error) {
        console.error('=== Database Connection Failed ===');
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('Database does not exist. Please create the database first.');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('Could not connect to MySQL. Make sure MySQL is running.');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Access denied. Please check your database credentials.');
        }
        return false;
    }
};

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'https://bunicashop.md',
        'https://www.bunicashop.md',
        'https://api.bunicashop.md',
        'http://bunicashop.md',
        'http://www.bunicashop.md',
        'http://api.bunicashop.md'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    console.log(`\n=== Incoming Request ===`);
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Query:', JSON.stringify(req.query, null, 2));
    console.log('Params:', JSON.stringify(req.params, null, 2));
    
    // Log response
    const originalSend = res.send;
    res.send = function (body) {
        const duration = Date.now() - start;
        console.log(`\n=== Response ===`);
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
        if (res.statusCode >= 400) {
            console.log('Error response:', body);
        }
        return originalSend.call(this, body);
    };
    
    next();
});

// Helper function for database queries
const query = async (sql, params) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

// Admin authentication middleware
const isAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
    }

    const token = authHeader.split(' ')[1];
    if (token === 'admin-token') {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
};

// Admin routes
app.get('/api/admin', isAdmin, async (req, res) => {
    try {
        // Get basic admin dashboard data
        const [totalProducts] = await query('SELECT COUNT(*) as count FROM products');
        const [totalOrders] = await query('SELECT COUNT(*) as count FROM orders');
        const [totalRevenue] = await query('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders');
        const [totalCustomers] = await query('SELECT COUNT(DISTINCT customer_email) as count FROM orders');
        const [recentOrders] = await query(`
            SELECT o.*, 
                   COUNT(oi.id) as item_count,
                   GROUP_CONCAT(oi.product_name) as product_names
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id
            ORDER BY o.created_at DESC
            LIMIT 5
        `);

        res.json({
            dashboard: {
                totalProducts: totalProducts.count,
                totalOrders: totalOrders.count,
                totalRevenue: totalRevenue.total,
                totalCustomers: totalCustomers.count
            },
            recentOrders: recentOrders.map(order => ({
                ...order,
                product_names: order.product_names ? order.product_names.split(',') : []
            }))
        });
    } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin login route
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Query the database for the admin user
        const [users] = await query(
            'SELECT * FROM users WHERE email = ? AND role = "admin"',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const admin = users[0];
        
        // Check password (in a real app, this should use proper password hashing)
        if (password === admin.password) {
            res.json({ 
                token: 'admin-token',
                user: {
                    id: admin.id,
                    email: admin.email,
                    username: admin.username,
                    role: admin.role
                }
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get statistics
app.get('/api/admin/statistics', isAdmin, async (req, res) => {
    try {
        const [totalProducts] = await query('SELECT COUNT(*) as count FROM products');
        const [totalOrders] = await query('SELECT COUNT(*) as count FROM orders');
        const [totalRevenue] = await query('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders');
        const [totalCustomers] = await query('SELECT COUNT(DISTINCT customer_email) as count FROM orders');

        res.json({
            totalProducts: totalProducts.count,
            totalOrders: totalOrders.count,
            totalRevenue: totalRevenue.total,
            totalCustomers: totalCustomers.count
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all orders with detailed information
app.get('/api/admin/orders', isAdmin, async (req, res) => {
    try {
        // Get orders with customer information
        const orders = await query(`
            SELECT 
                o.*,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'id', oi.id,
                        'product_id', oi.product_id,
                        'product_name', oi.product_name,
                        'quantity', oi.quantity,
                        'price', oi.price,
                        'total', oi.quantity * oi.price
                    )
                ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `);

        // Parse the items JSON string for each order
        const formattedOrders = orders.map(order => ({
            ...order,
            items: order.items ? JSON.parse(`[${order.items}]`) : []
        }));

        res.json(formattedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update order status
app.patch('/api/admin/orders/:id/status', isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        await query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, req.params.id]
        );
        res.json({ message: 'Order status updated' });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all leads
app.get('/api/admin/leads', isAdmin, async (req, res) => {
    try {
        const leads = await query('SELECT * FROM leads ORDER BY created_at DESC');
        res.json(leads);
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get new leads count
app.get('/api/admin/leads/new/count', isAdmin, async (req, res) => {
    try {
        const [result] = await query('SELECT COUNT(*) as count FROM leads WHERE status = "new"');
        res.json(result.count);
    } catch (error) {
        console.error('Error fetching new leads count:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update lead
app.put('/api/admin/leads/:id', isAdmin, async (req, res) => {
    try {
        const { status, notes } = req.body;
        await query(
            'UPDATE leads SET status = ?, notes = ? WHERE id = ?',
            [status, notes, req.params.id]
        );
        res.json({ message: 'Lead updated' });
    } catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete lead
app.delete('/api/admin/leads/:id', isAdmin, async (req, res) => {
    try {
        await query('DELETE FROM leads WHERE id = ?', [req.params.id]);
        res.json({ message: 'Lead deleted' });
    } catch (error) {
        console.error('Error deleting lead:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin Products Routes
app.get('/api/admin/products', isAdmin, async (req, res) => {
    try {
        const products = await query('SELECT * FROM products ORDER BY created_at DESC');
        res.json(products);
    } catch (error) {
        console.error('Error fetching admin products:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/products', isAdmin, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        const images = req.files;

        if (!images || images.length === 0) {
            return res.status(400).json({ error: 'At least one image is required' });
        }

        const mainImage = images[0].filename;
        const additionalImages = images.slice(1).map(img => img.filename);

        const result = await query(
            'INSERT INTO products (name, description, price, category, stock, image_url, images) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, description, price, category, stock, mainImage, JSON.stringify(additionalImages)]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            description,
            price,
            category,
            stock,
            image_url: mainImage,
            images: additionalImages
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/admin/products/:id', isAdmin, upload.array('images', 5), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, stock } = req.body;
        const images = req.files;

        // Get current product data
        const [currentProduct] = await query('SELECT image_url, images FROM products WHERE id = ?', [id]);
        if (!currentProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        let mainImage = currentProduct.image_url;
        let additionalImages = JSON.parse(currentProduct.images || '[]');

        // If new images are uploaded, update them
        if (images && images.length > 0) {
            // Delete old images
            const oldImages = [currentProduct.image_url, ...JSON.parse(currentProduct.images || '[]')];
            for (const image of oldImages) {
                const imagePath = path.join(__dirname, 'public/uploads/products', image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            mainImage = images[0].filename;
            additionalImages = images.slice(1).map(img => img.filename);
        }

        await query(
            'UPDATE products SET name = ?, description = ?, price = ?, category = ?, stock = ?, image_url = ?, images = ? WHERE id = ?',
            [name, description, price, category, stock, mainImage, JSON.stringify(additionalImages), id]
        );

        res.json({
            id,
            name,
            description,
            price,
            category,
            stock,
            image_url: mainImage,
            images: additionalImages
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/admin/products/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Get product images before deleting
        const [product] = await query(
            'SELECT image_url, images FROM products WHERE id = ?',
            [id]
        );

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Delete product from database
        await query('DELETE FROM products WHERE id = ?', [id]);

        // Delete product images
        const images = [product.image_url, ...JSON.parse(product.images || '[]')];
        for (const image of images) {
            const imagePath = path.join(__dirname, 'public/uploads/products', image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: error.message });
    }
});

// Initialize database
const initDatabase = async () => {
    try {
        // Temporarily disable foreign key checks
        await query('SET FOREIGN_KEY_CHECKS = 0');

        // Drop tables in correct order (child tables first)
        await query('DROP TABLE IF EXISTS cart_items');
        await query('DROP TABLE IF EXISTS order_items');
        await query('DROP TABLE IF EXISTS orders');
        await query('DROP TABLE IF EXISTS cart');
        await query('DROP TABLE IF EXISTS products');
        await query('DROP TABLE IF EXISTS users');

        // Re-enable foreign key checks
        await query('SET FOREIGN_KEY_CHECKS = 1');

        // Create tables in correct order (parent tables first)
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                original_price DECIMAL(10,2),
                discount INT,
                stock INT NOT NULL DEFAULT 0,
                category VARCHAR(50) NOT NULL,
                image_url VARCHAR(255),
                images JSON,
                rating DECIMAL(3,2) DEFAULT 0,
                rating_count INT DEFAULT 0,
                is_top_seller BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS cart (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS cart_items (
                id INT PRIMARY KEY AUTO_INCREMENT,
                cart_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT,
                customer_name VARCHAR(255) NOT NULL,
                customer_email VARCHAR(255) NOT NULL,
                customer_phone VARCHAR(50),
                shipping_address TEXT NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                status ENUM('new', 'pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'new',
                payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT PRIMARY KEY AUTO_INCREMENT,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                product_name VARCHAR(255) NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `);

        // Seed initial data
        await seedProducts();
        await seedUsers();

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
        // Make sure to re-enable foreign key checks even if there's an error
        await query('SET FOREIGN_KEY_CHECKS = 1').catch(console.error);
        throw error;
    }
};

// Seed some sample products
const seedProducts = async () => {
    try {
        // Check if we already have products
        const existingProducts = await query('SELECT COUNT(*) as count FROM products');
        if (existingProducts[0].count > 0) {
            console.log('Products already exist, skipping seed');
            return;
        }

        const products = [
            {
                name: 'Scaun de Grădină',
                description: 'Scaun confortabil pentru grădină, rezistent la intemperii',
                price: 199.99,
                category: 'Totul la 99 Lei',
                stock: 15,
                image_url: 'garden-chair.jpg'
            },
            {
                name: 'Set Masa Grădină',
                description: 'Set complet masă și 4 scaune pentru grădină',
                price: 899.99,
                category: 'Totul la 99 Lei',
                stock: 8,
                image_url: 'garden-table-set.jpg'
            },
            {
                name: 'Adidași Running',
                description: 'Adidași profesioniști pentru alergare',
                price: 299.99,
                category: 'Textile',
                stock: 20,
                image_url: 'running-shoes.jpg'
            },
            {
                name: 'Minge de Fotbal',
                description: 'Minge de fotbal profesională, dimensiune 5',
                price: 89.99,
                category: 'Jocuri și Jucării',
                stock: 30,
                image_url: 'football.jpg'
            },
            {
                name: 'Set Tăvi Bucătărie',
                description: 'Set de 3 tăvi pentru cuptor, inoxidabil',
                price: 149.99,
                category: 'Bucătărie și Veselă',
                stock: 25,
                image_url: 'baking-trays.jpg'
            },
            {
                name: 'Mixer Electric',
                description: 'Mixer electric cu 5 viteze și accesorii',
                price: 199.99,
                category: 'Electrocasnice',
                stock: 12,
                image_url: 'mixer.jpg'
            },
            {
                name: 'Smart TV 55"',
                description: 'Smart TV 4K cu Android TV și HDR',
                price: 2499.99,
                category: 'Electrocasnice',
                stock: 10,
                image_url: 'smart-tv.jpg'
            },
            {
                name: 'Boxe Bluetooth',
                description: 'Boxe portabile cu Bluetooth și bass puternic',
                price: 299.99,
                category: 'Boxe / Audio',
                stock: 18,
                image_url: 'bluetooth-speaker.jpg'
            },
            {
                name: 'Set Scule Auto',
                description: 'Set complet de scule pentru mașină, 45 piese',
                price: 399.99,
                category: 'Uz Casnic',
                stock: 15,
                image_url: 'tool-set.jpg'
            },
            {
                name: 'Cameră de Bord',
                description: 'Cameră de bord Full HD cu GPS și WiFi',
                price: 499.99,
                category: 'Supraveghere video',
                stock: 20,
                image_url: 'dashcam.jpg'
            }
        ];

        for (const product of products) {
            await query(
                'INSERT INTO products (name, description, price, category, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)',
                [product.name, product.description, product.price, product.category, product.stock, product.image_url]
            );
        }
        console.log('Sample products seeded successfully');
    } catch (error) {
        console.error('Failed to seed products:', error);
        throw error;
    }
};

// Seed initial users
const seedUsers = async () => {
    try {
        // Check if we already have users
        const existingUsers = await query('SELECT COUNT(*) as count FROM users');
        if (existingUsers[0].count > 0) {
            console.log('Users already exist, skipping seed');
            return;
        }

        const users = [
            {
                username: 'admin',
                email: 'bunicashop.md@gmail.com',
                password: 'admin123', // In a real app, this should be hashed
                role: 'admin'
            },
            {
                username: 'user1',
                email: 'user1@example.com',
                password: 'user123', // In a real app, this should be hashed
                role: 'user'
            }
        ];

        for (const user of users) {
            await query(
                'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                [user.username, user.email, user.password, user.role]
            );
        }
        console.log('Sample users seeded successfully');
    } catch (error) {
        console.error('Failed to seed users:', error);
        throw error;
    }
};

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/uploads/products', express.static(path.join(__dirname, 'public/uploads/products')));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route for client-side routing
app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
        return next();
    }
    
    // For admin routes, serve the admin index.html
    if (req.path.startsWith('/admin/')) {
        return res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
    }
    
    // For all other routes, serve the main index.html file
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/products')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// PRODUCT ROUTES
// Get all products
app.get('/api/products', async (req, res) => {
    try {
        let queryStr = 'SELECT * FROM products';
        const params = [];

        // Add filtering by category if provided
        if (req.query.category) {
            queryStr += ' WHERE category = ?';
            params.push(req.query.category);
        }

        // Add sorting if provided
        if (req.query.sort) {
            const validSortFields = ['name', 'price', 'created_at'];
            const [field, direction] = req.query.sort.split('_');

            if (validSortFields.includes(field)) {
                queryStr += ` ORDER BY ${field} ${direction === 'desc' ? 'DESC' : 'ASC'}`;
            }
        }

        const products = await query(queryStr, params);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get categories with products
app.get('/categories', async (req, res) => {
    try {
        const predefinedCategories = [
            'Totul la 99 Lei',
            'Electrocasnice',
            'Bucătărie și Veselă',
            'Uz Casnic',
            'Boxe / Audio',
            'Textile',
            'Supraveghere video',
            'Produse chimice',
            'Sănătate și Frumusețe',
            'Vase de Gătit',
            'Jocuri și Jucării'
        ];

        // Get categories that have products
        const categoriesWithProducts = await query(`
            SELECT DISTINCT category 
            FROM products 
            WHERE category IS NOT NULL 
            AND category != ''
            ORDER BY category
        `);

        // Filter predefined categories to only include those that have products
        const activeCategories = predefinedCategories.filter(cat => 
            categoriesWithProducts.some(c => c.category === cat)
        );

        res.json(activeCategories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    let connection;
    try {
        console.log('\n=== Product Fetch Request ===');
        console.log('Request URL:', req.url);
        console.log('Request method:', req.method);
        console.log('Request params:', req.params);
        console.log('Request query:', req.query);
        console.log('Request headers:', req.headers);
        
        const productId = parseInt(req.params.id);
        if (isNaN(productId)) {
            console.log('Invalid product ID format:', req.params.id);
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        // Get a connection from the pool
        connection = await pool.getConnection();
        console.log('Database connection acquired');

        console.log('Executing database query for product ID:', productId);
        const [products] = await connection.execute(
            'SELECT * FROM products WHERE id = ?',
            [productId]
        );
        console.log('Query result:', JSON.stringify(products, null, 2));

        if (!products || products.length === 0) {
            console.log('No product found with ID:', productId);
            return res.status(404).json({ message: 'Product not found' });
        }

        const product = products[0];
        console.log('Found product:', JSON.stringify(product, null, 2));
        
        // Check if image_url exists and is valid
        if (product.image_url) {
            const imagePath = path.join(__dirname, 'public/uploads/products', product.image_url);
            const imageExists = fs.existsSync(imagePath);
            console.log('Product image path:', imagePath);
            console.log('Image exists:', imageExists);
            
            // If image doesn't exist, set a default image
            if (!imageExists) {
                console.log('Image not found, using default image');
                product.image_url = 'default-product.jpg';
            }
        }

        // Ensure all required fields are present
        const requiredFields = ['id', 'name', 'description', 'price', 'category', 'stock'];
        const missingFields = requiredFields.filter(field => !product[field]);
        if (missingFields.length > 0) {
            console.log('Product missing required fields:', missingFields);
            // Set default values for missing fields
            missingFields.forEach(field => {
                switch(field) {
                    case 'description':
                        product[field] = 'No description available';
                        break;
                    case 'price':
                        product[field] = 0;
                        break;
                    case 'stock':
                        product[field] = 0;
                        break;
                    default:
                        product[field] = `Unknown ${field}`;
                }
            });
        }

        res.json(product);
    } catch (error) {
        console.error('\n=== Error in Product Fetch ===');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error errno:', error.errno);
        console.error('Error sqlState:', error.sqlState);
        console.error('Error sqlMessage:', error.sqlMessage);
        console.error('Error stack:', error.stack);
        
        // Check database connection
        try {
            if (connection) {
                const [result] = await connection.query('SELECT 1');
                console.log('Database connection test:', result ? 'OK' : 'Failed');
            } else {
                console.log('No active database connection to test');
            }
        } catch (dbError) {
            console.error('Database connection test failed:', dbError.message);
        }

        res.status(500).json({ 
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) {
            console.log('Releasing database connection');
            connection.release();
        }
    }
});

// Get related products by category
app.get('/products/related/:category', async (req, res) => {
    try {
        const { exclude } = req.query;
        const products = await query(
            'SELECT * FROM products WHERE category = ? AND id != ? LIMIT 4',
            [req.params.category, exclude || 0]
        );
        res.json(products);
    } catch (error) {
        console.error('Error fetching related products:', error);
        res.status(500).json({ error: error.message });
    }
});

// CART ENDPOINTS
app.post('/api/cart', async (req, res) => {
    try {
        const { product_id, quantity = 1, user_id = null } = req.body;

        // Check if product exists
        const [product] = await query('SELECT id, price FROM products WHERE id = ?', [product_id]);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Get or create cart for user
        let cart;
        if (user_id) {
            [cart] = await query('SELECT id FROM cart WHERE user_id = ?', [user_id]);
            if (!cart) {
                const result = await query('INSERT INTO cart (user_id) VALUES (?)', [user_id]);
                cart = { id: result.insertId };
            }
        } else {
            // For non-authenticated users, create a new cart
            const result = await query('INSERT INTO cart (user_id) VALUES (NULL)', []);
            cart = { id: result.insertId };
        }

        // Check if item already exists in cart
        const [existingItem] = await query(
            'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
            [cart.id, product_id]
        );

        if (existingItem) {
            // Update quantity if item exists
            await query(
                'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
                [quantity, existingItem.id]
            );
        } else {
            // Add new item to cart
            await query(
                'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
                [cart.id, product_id, quantity]
            );
        }

        res.json({ message: 'Item added to cart', cart_id: cart.id });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/cart', async (req, res) => {
    try {
        const { user_id } = req.query;
        let queryStr = `
            SELECT 
                ci.id,
                ci.quantity,
                p.id as product_id,
                p.name,
                p.price,
                p.image_url,
                (p.price * ci.quantity) as total_price
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            JOIN cart c ON ci.cart_id = c.id
        `;

        const params = [];
        if (user_id) {
            queryStr += ' WHERE c.user_id = ?';
            params.push(user_id);
        }

        const cartItems = await query(queryStr, params);
        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/cart/:id', async (req, res) => {
    try {
        await query('DELETE FROM cart_items WHERE id = ?', [req.params.id]);
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/cart', async (req, res) => {
    try {
        const { user_id } = req.query;
        let queryStr = 'DELETE FROM cart_items';
        const params = [];

        if (user_id) {
            queryStr += ' WHERE cart_id IN (SELECT id FROM cart WHERE user_id = ?)';
            params.push(user_id);
        }

        const result = await query(queryStr, params);
        res.json({ 
            success: true,
            message: 'Cart cleared successfully',
            affectedRows: result.affectedRows 
        });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// ORDER ENDPOINTS
app.post('/api/orders', async (req, res) => {
    console.log('Received order request:', JSON.stringify(req.body, null, 2));
    
    try {
        const { 
            shipping_address, 
            items, 
            total_amount, 
            user_id = null,
            customer_name,
            customer_email,
            customer_phone
        } = req.body;

        // Validate required fields
        if (!shipping_address?.trim()) {
            throw new Error('Shipping address is required');
        }
        if (!customer_name?.trim()) {
            throw new Error('Customer name is required');
        }
        if (!customer_email?.trim()) {
            throw new Error('Customer email is required');
        }
        if (!items?.length) {
            throw new Error('Order must contain at least one item');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customer_email)) {
            throw new Error('Invalid email format');
        }

        // Validate phone number format (optional)
        if (customer_phone && !/^\+?[\d\s-]{8,}$/.test(customer_phone)) {
            throw new Error('Invalid phone number format');
        }

        // Validate total amount
        const parsedTotal = parseFloat(total_amount);
        if (isNaN(parsedTotal) || parsedTotal <= 0) {
            throw new Error(`Invalid total amount: ${total_amount}`);
        }

        // Validate items
        for (const item of items) {
            if (!item.product_id || isNaN(parseInt(item.product_id))) {
                throw new Error(`Invalid product_id: ${item.product_id}`);
            }
            if (!item.quantity || isNaN(parseInt(item.quantity)) || parseInt(item.quantity) <= 0) {
                throw new Error(`Invalid quantity: ${item.quantity}`);
            }
            if (!item.product_name?.trim()) {
                throw new Error(`Missing product name for product ID ${item.product_id}`);
            }
        }

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Verify products exist and calculate server-side total
            let serverTotal = 0;
            const validatedItems = [];
            
            for (const item of items) {
                const productId = parseInt(item.product_id);
                const quantity = parseInt(item.quantity);
                const productName = item.product_name.trim();

                console.log('Checking product:', productId);
                const [products] = await connection.query(
                    'SELECT id, name, price FROM products WHERE id = ?',
                    [productId]
                );
                
                if (!products || products.length === 0) {
                    throw new Error(`Product with ID ${productId} not found`);
                }
                
                const product = products[0];
                console.log('Product found:', product);
                
                if (!product.price || isNaN(parseFloat(product.price)) || parseFloat(product.price) <= 0) {
                    throw new Error(`Invalid price for product ${productId}: ${product.price}`);
                }

                const itemTotal = parseFloat(product.price) * quantity;
                console.log('Item total:', {
                    productId,
                    productName,
                    price: product.price,
                    quantity,
                    itemTotal
                });
                
                serverTotal += itemTotal;
                
                // Store validated item with product name
                validatedItems.push({
                    product_id: productId,
                    product_name: productName,
                    quantity: quantity,
                    price: parseFloat(product.price)
                });
            }

            // Verify total amount matches (with small tolerance for floating point)
            if (Math.abs(serverTotal - parsedTotal) > 0.01) {
                throw new Error(`Total amount mismatch: client=${total_amount}, server=${serverTotal}`);
            }

            // Prepare customer data
            const customerData = {
                name: customer_name.trim(),
                email: customer_email.trim(),
                phone: customer_phone?.trim() || null,
                address: shipping_address.trim()
            };

            console.log('Creating order with customer data:', customerData);

            // Create order with explicit field names
            const [orderResult] = await connection.query(
                `INSERT INTO orders (
                    user_id,
                    customer_name,
                    customer_email,
                    customer_phone,
                    shipping_address,
                    total_amount,
                    status,
                    payment_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    user_id,
                    customerData.name,
                    customerData.email,
                    customerData.phone,
                    customerData.address,
                    parsedTotal,
                    'new',
                    'pending'
                ]
            );
            const orderId = orderResult.insertId;
            console.log('Order created with ID:', orderId);

            // Add order items with product names
            for (const item of validatedItems) {
                console.log('Adding order item:', {
                    orderId,
                    productId: item.product_id,
                    productName: item.product_name,
                    quantity: item.quantity,
                    price: item.price
                });

                await connection.query(
                    `INSERT INTO order_items (
                        order_id,
                        product_id,
                        product_name,
                        quantity,
                        price
                    ) VALUES (?, ?, ?, ?, ?)`,
                    [
                        orderId,
                        item.product_id,
                        item.product_name,
                        item.quantity,
                        item.price
                    ]
                );
            }

            // Clear cart for this user
            if (user_id) {
                await connection.query('DELETE FROM cart WHERE user_id = ?', [user_id]);
            }

            await connection.commit();
            console.log('Order transaction committed successfully');
            
            res.json({
                success: true,
                message: 'Order created successfully',
                orderId,
                total_amount: parsedTotal,
                customer: customerData
            });
        } catch (error) {
            console.error('Error in order transaction:', error);
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Create new product
app.post('/api/products', upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        const images = req.files;

        if (!images || images.length === 0) {
            return res.status(400).json({ error: 'At least one image is required' });
        }

        const mainImage = images[0].filename;
        const additionalImages = images.slice(1).map(img => img.filename);

        const result = await query(
            'INSERT INTO products (name, description, price, category, stock, image_url, images) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, description, price, category, stock, mainImage, JSON.stringify(additionalImages)]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            description,
            price,
            category,
            stock,
            image_url: mainImage,
            images: additionalImages
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update product
app.put('/api/products/:id', upload.array('images', 5), async (req, res) => {
    try {
        console.log('Update product request received:', {
            params: req.params,
            body: req.body,
            files: req.files
        });

        const productId = parseInt(req.params.id);
        const { name, description, price, category, stock } = req.body;
        const images = req.files;

        // Get current product data
        const [currentProduct] = await query(
            'SELECT image_url, images FROM products WHERE id = ?',
            [productId]
        );

        if (!currentProduct) {
            console.log('Product not found:', productId);
            return res.status(404).json({ message: 'Product not found' });
        }

        console.log('Current product data:', currentProduct);

        let mainImage = currentProduct.image_url;
        let additionalImages = JSON.parse(currentProduct.images || '[]');

        // If new images are uploaded
        if (images && images.length > 0) {
            console.log('New images uploaded:', images);
            // Delete old images
            const oldImages = [mainImage, ...additionalImages];
            for (const image of oldImages) {
                const imagePath = path.join(__dirname, 'public/uploads/products', image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            mainImage = images[0].filename;
            additionalImages = images.slice(1).map(img => img.filename);
        }

        console.log('Updating product with data:', {
            id: productId,
            name,
            description,
            price,
            category,
            stock,
            mainImage,
            additionalImages
        });

        await query(
            'UPDATE products SET name = ?, description = ?, price = ?, category = ?, stock = ?, image_url = ?, images = ? WHERE id = ?',
            [name, description, price, category, stock, mainImage, JSON.stringify(additionalImages), productId]
        );

        res.json({
            id: productId,
            name,
            description,
            price,
            category,
            stock,
            image_url: mainImage,
            images: additionalImages
        });
    } catch (error) {
        console.error('Error updating product:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: error.message });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);

        // Get product images before deleting
        const [product] = await query(
            'SELECT image_url, images FROM products WHERE id = ?',
            [productId]
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete product from database
        await query('DELETE FROM products WHERE id = ?', [productId]);

        // Delete product images
        const images = [product.image_url, ...JSON.parse(product.images || '[]')];
        for (const image of images) {
            const imagePath = path.join(__dirname, 'public/uploads/products', image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: error.message });
    }
});

// User login route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Query the database for the user
        const [users] = await query(
            'SELECT * FROM users WHERE email = ? AND role = "user"',
            [email]
        );
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const user = users[0];
        // Check password (plain text for now)
        if (password === user.password) {
            res.json({
                token: 'user-token',
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('\n=== Global Error Handler ===');
    console.error('Error occurred:', err);
    console.error('Request URL:', req.url);
    console.error('Request method:', req.method);
    console.error('Request headers:', req.headers);
    console.error('Request query:', req.query);
    console.error('Request params:', req.params);
    console.error('Error stack:', err.stack);
    
    res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Check if database tables exist
const checkDatabaseTables = async () => {
    try {
        // Check if required tables exist
        const tables = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = ? 
            AND table_name IN ('users', 'products', 'cart', 'cart_items', 'orders', 'order_items')
        `, [process.env.DB_NAME]);

        const requiredTables = ['users', 'products', 'cart', 'cart_items', 'orders', 'order_items'];
        const existingTables = tables.map(t => t.table_name);
        const missingTables = requiredTables.filter(t => !existingTables.includes(t));

        if (missingTables.length > 0) {
            console.log('Missing tables:', missingTables);
            console.log('Initializing database...');
            await initDatabase();
        } else {
            console.log('All required tables exist');
        }

        return true;
    } catch (error) {
        console.error('Error checking database tables:', error);
        return false;
    }
};

// Start server
const startServer = async () => {
    try {
        console.log('=== Starting Server ===');
        console.log('Environment:', process.env.NODE_ENV);
        console.log('Database config:', {
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'bunicas1_bunicashop',
            user: process.env.DB_USER || 'bunicas1_bunicashop'
        });

        // Check database tables first
        console.log('Checking database tables...');
        const tablesExist = await checkDatabaseTables();
        if (!tablesExist) {
            throw new Error('Failed to verify database tables');
        }

        // Test database connection
        console.log('Testing database connection...');
        const connection = await pool.getConnection();
        console.log('Database connection successful');
        
        // Verify products table has data
        const [products] = await connection.query('SELECT COUNT(*) as count FROM products');
        console.log('Products in database:', products[0].count);
        
        // List all products for debugging
        const [allProducts] = await connection.query('SELECT id, name, category FROM products');
        console.log('Available products:', JSON.stringify(allProducts, null, 2));
        
        connection.release();

        // Start listening on all network interfaces
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`=== Server Started ===`);
            console.log(`Server running on port ${PORT}`);
            console.log(`API Base URL: http://localhost:${PORT}`);
            console.log(`Try accessing: http://localhost:${PORT}/api/products`);
            console.log(`Server is accessible from all network interfaces`);
        });
    } catch (error) {
        console.error('=== Server Startup Failed ===');
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Access denied. Please check your database credentials.');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('Could not connect to MySQL. Make sure MySQL is running.');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('Database does not exist. Please create the database first.');
        }
        process.exit(1);
    }
};

startServer();