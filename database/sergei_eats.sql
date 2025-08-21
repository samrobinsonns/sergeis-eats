-- =====================================================
-- Sergei Eats - Food Delivery System Database Schema
-- FiveM Production Ready Database Structure
-- =====================================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `sergei_eats` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sergei_eats`;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Restaurants table
CREATE TABLE IF NOT EXISTS `restaurants` (
    `id` VARCHAR(50) PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `job_name` VARCHAR(50) NOT NULL,
    `owner_id` VARCHAR(50),
    `phone` VARCHAR(20),
    `email` VARCHAR(100),
    `address` TEXT,
    `location_x` DECIMAL(10,6) NOT NULL,
    `location_y` DECIMAL(10,6) NOT NULL,
    `location_z` DECIMAL(10,6) NOT NULL,
    `pickup_x` DECIMAL(10,6) NOT NULL,
    `pickup_y` DECIMAL(10,6) NOT NULL,
    `pickup_z` DECIMAL(10,6) NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `delivery_radius` INT DEFAULT 5000,
    `min_order_amount` DECIMAL(10,2) DEFAULT 0.00,
    `delivery_fee` DECIMAL(10,2) DEFAULT 5.00,
    `tax_rate` DECIMAL(5,4) DEFAULT 0.0800,
    `opening_hours` JSON,
    `cuisine_type` VARCHAR(50),
    `rating` DECIMAL(3,2) DEFAULT 0.00,
    `total_orders` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_job_name` (`job_name`),
    INDEX `idx_is_active` (`is_active`),
    INDEX `idx_location` (`location_x`, `location_y`)
);

-- Menu categories table
CREATE TABLE IF NOT EXISTS `menu_categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `restaurant_id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `sort_order` INT DEFAULT 0,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE,
    INDEX `idx_restaurant_category` (`restaurant_id`, `sort_order`)
);

-- Menu items table
CREATE TABLE IF NOT EXISTS `menu_items` (
    `id` VARCHAR(50) PRIMARY KEY,
    `restaurant_id` VARCHAR(50) NOT NULL,
    `category_id` INT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `price` DECIMAL(10,2) NOT NULL,
    `original_price` DECIMAL(10,2),
    `image_url` VARCHAR(255),
    `is_available` BOOLEAN DEFAULT TRUE,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `allergens` JSON,
    `nutrition_info` JSON,
    `preparation_time` INT DEFAULT 15,
    `sort_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`category_id`) REFERENCES `menu_categories`(`id`) ON DELETE CASCADE,
    INDEX `idx_restaurant_item` (`restaurant_id`, `category_id`),
    INDEX `idx_is_available` (`is_available`),
    INDEX `idx_price` (`price`)
);

-- Item customizations table
CREATE TABLE IF NOT EXISTS `item_customizations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `item_id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `type` ENUM('checkbox', 'radio', 'number') NOT NULL,
    `price_modifier` DECIMAL(10,2) DEFAULT 0.00,
    `is_required` BOOLEAN DEFAULT FALSE,
    `max_selections` INT DEFAULT 1,
    `sort_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`item_id`) REFERENCES `menu_items`(`id`) ON DELETE CASCADE,
    INDEX `idx_item_customization` (`item_id`, `sort_order`)
);

-- Customization options table
CREATE TABLE IF NOT EXISTS `customization_options` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `customization_id` INT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `price_modifier` DECIMAL(10,2) DEFAULT 0.00,
    `is_available` BOOLEAN DEFAULT TRUE,
    `sort_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`customization_id`) REFERENCES `item_customizations`(`id`) ON DELETE CASCADE,
    INDEX `idx_customization_option` (`customization_id`, `sort_order`)
);

-- =====================================================
-- USER MANAGEMENT
-- =====================================================

-- User profiles table
CREATE TABLE IF NOT EXISTS `user_profiles` (
    `id` VARCHAR(50) PRIMARY KEY,
    `citizen_id` VARCHAR(50) NOT NULL,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(20),
    `email` VARCHAR(100),
    `default_address` TEXT,
    `preferences` JSON,
    `total_orders` INT DEFAULT 0,
    `total_spent` DECIMAL(12,2) DEFAULT 0.00,
    `loyalty_points` INT DEFAULT 0,
    `is_verified` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_citizen_id` (`citizen_id`),
    INDEX `idx_total_orders` (`total_orders`)
);

-- User addresses table
CREATE TABLE IF NOT EXISTS `user_addresses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` VARCHAR(50) NOT NULL,
    `label` VARCHAR(100) NOT NULL,
    `address` TEXT NOT NULL,
    `location_x` DECIMAL(10,6) NOT NULL,
    `location_y` DECIMAL(10,6) NOT NULL,
    `location_z` DECIMAL(10,6) NOT NULL,
    `is_default` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON DELETE CASCADE,
    INDEX `idx_user_address` (`user_id`, `is_default`)
);

-- =====================================================
-- ORDERS SYSTEM
-- =====================================================

-- Orders table
CREATE TABLE IF NOT EXISTS `orders` (
    `id` VARCHAR(50) PRIMARY KEY,
    `order_number` VARCHAR(20) UNIQUE NOT NULL,
    `user_id` VARCHAR(50) NOT NULL,
    `restaurant_id` VARCHAR(50) NOT NULL,
    `driver_id` VARCHAR(50),
    `status` ENUM('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivering', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    `order_type` ENUM('delivery', 'pickup') DEFAULT 'delivery',
    `subtotal` DECIMAL(10,2) NOT NULL,
    `delivery_fee` DECIMAL(10,2) DEFAULT 0.00,
    `tax_amount` DECIMAL(10,2) DEFAULT 0.00,
    `discount_amount` DECIMAL(10,2) DEFAULT 0.00,
    `total_amount` DECIMAL(10,2) NOT NULL,
    `payment_method` ENUM('cash', 'card', 'bank') DEFAULT 'cash',
    `payment_status` ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    `delivery_address` TEXT,
    `delivery_x` DECIMAL(10,6),
    `delivery_y` DECIMAL(10,6),
    `delivery_z` DECIMAL(10,6),
    `estimated_delivery_time` TIMESTAMP,
    `actual_delivery_time` TIMESTAMP,
    `special_instructions` TEXT,
    `cancellation_reason` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE,
    INDEX `idx_user_orders` (`user_id`, `created_at`),
    INDEX `idx_restaurant_orders` (`restaurant_id`, `created_at`),
    INDEX `idx_driver_orders` (`driver_id`, `created_at`),
    INDEX `idx_status` (`status`),
    INDEX `idx_order_number` (`order_number`)
);

-- Order items table
CREATE TABLE IF NOT EXISTS `order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` VARCHAR(50) NOT NULL,
    `item_id` VARCHAR(50) NOT NULL,
    `item_name` VARCHAR(100) NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `unit_price` DECIMAL(10,2) NOT NULL,
    `total_price` DECIMAL(10,2) NOT NULL,
    `customizations` JSON,
    `special_instructions` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`item_id`) REFERENCES `menu_items`(`id`) ON DELETE CASCADE,
    INDEX `idx_order_item` (`order_id`, `item_id`)
);

-- =====================================================
-- DRIVER SYSTEM
-- =====================================================

-- Drivers table
CREATE TABLE IF NOT EXISTS `drivers` (
    `id` VARCHAR(50) PRIMARY KEY,
    `citizen_id` VARCHAR(50) NOT NULL,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(20),
    `vehicle_model` VARCHAR(50),
    `vehicle_plate` VARCHAR(20),
    `is_available` BOOLEAN DEFAULT TRUE,
    `is_online` BOOLEAN DEFAULT FALSE,
    `current_location_x` DECIMAL(10,6),
    `current_location_y` DECIMAL(10,6),
    `current_location_z` DECIMAL(10,6),
    `rating` DECIMAL(3,2) DEFAULT 0.00,
    `total_deliveries` INT DEFAULT 0,
    `total_earnings` DECIMAL(12,2) DEFAULT 0.00,
    `last_active` TIMESTAMP,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_citizen_id` (`citizen_id`),
    INDEX `idx_is_available` (`is_available`),
    INDEX `idx_is_online` (`is_online`)
);

-- Driver earnings table
CREATE TABLE IF NOT EXISTS `driver_earnings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `driver_id` VARCHAR(50) NOT NULL,
    `order_id` VARCHAR(50) NOT NULL,
    `base_pay` DECIMAL(10,2) NOT NULL,
    `distance_bonus` DECIMAL(10,2) DEFAULT 0.00,
    `time_bonus` DECIMAL(10,2) DEFAULT 0.00,
    `tip_amount` DECIMAL(10,2) DEFAULT 0.00,
    `total_earnings` DECIMAL(10,2) NOT NULL,
    `paid_at` TIMESTAMP,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    INDEX `idx_driver_earnings` (`driver_id`, `created_at`)
);

-- =====================================================
-- DISCOUNTS & PROMOTIONS
-- =====================================================

-- Discounts table
CREATE TABLE IF NOT EXISTS `discounts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(50) UNIQUE NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `type` ENUM('percentage', 'fixed_amount', 'free_delivery') NOT NULL,
    `value` DECIMAL(10,2) NOT NULL,
    `min_order_amount` DECIMAL(10,2) DEFAULT 0.00,
    `max_discount_amount` DECIMAL(10,2),
    `usage_limit` INT,
    `used_count` INT DEFAULT 0,
    `is_active` BOOLEAN DEFAULT TRUE,
    `valid_from` TIMESTAMP,
    `valid_until` TIMESTAMP,
    `restaurant_id` VARCHAR(50),
    `user_id` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON DELETE SET NULL,
    INDEX `idx_code` (`code`),
    INDEX `idx_is_active` (`is_active`),
    INDEX `idx_valid_dates` (`valid_from`, `valid_until`)
);

-- Discount usage table
CREATE TABLE IF NOT EXISTS `discount_usage` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `discount_id` INT NOT NULL,
    `order_id` VARCHAR(50) NOT NULL,
    `user_id` VARCHAR(50) NOT NULL,
    `discount_amount` DECIMAL(10,2) NOT NULL,
    `used_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`discount_id`) REFERENCES `discounts`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON DELETE CASCADE,
    INDEX `idx_discount_usage` (`discount_id`, `user_id`),
    INDEX `idx_order_discount` (`order_id`)
);

-- =====================================================
-- RATINGS & REVIEWS
-- =====================================================

-- Restaurant reviews table
CREATE TABLE IF NOT EXISTS `restaurant_reviews` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `restaurant_id` VARCHAR(50) NOT NULL,
    `user_id` VARCHAR(50) NOT NULL,
    `order_id` VARCHAR(50) NOT NULL,
    `rating` INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    `review_text` TEXT,
    `food_rating` INT CHECK (food_rating >= 1 AND food_rating <= 5),
    `service_rating` INT CHECK (service_rating >= 1 AND service_rating <= 5),
    `delivery_rating` INT CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    `is_verified` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_order_review` (`order_id`),
    INDEX `idx_restaurant_reviews` (`restaurant_id`, `rating`),
    INDEX `idx_user_reviews` (`user_id`, `created_at`)
);

-- Driver reviews table
CREATE TABLE IF NOT EXISTS `driver_reviews` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `driver_id` VARCHAR(50) NOT NULL,
    `user_id` VARCHAR(50) NOT NULL,
    `order_id` VARCHAR(50) NOT NULL,
    `rating` INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    `review_text` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_driver_order_review` (`order_id`),
    INDEX `idx_driver_reviews` (`driver_id`, `rating`)
);

-- =====================================================
-- NOTIFICATIONS & LOGS
-- =====================================================

-- Notifications table
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` VARCHAR(50) NOT NULL,
    `type` ENUM('order_update', 'promotion', 'system', 'delivery') NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `message` TEXT NOT NULL,
    `data` JSON,
    `is_read` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON DELETE CASCADE,
    INDEX `idx_user_notifications` (`user_id`, `is_read`, `created_at`)
);

-- System logs table
CREATE TABLE IF NOT EXISTS `system_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `level` ENUM('info', 'warning', 'error', 'debug') NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `message` TEXT NOT NULL,
    `data` JSON,
    `user_id` VARCHAR(50),
    `ip_address` VARCHAR(45),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_level_category` (`level`, `category`),
    INDEX `idx_created_at` (`created_at`)
);

-- =====================================================
-- ANALYTICS & REPORTS
-- =====================================================

-- Daily statistics table
CREATE TABLE IF NOT EXISTS `daily_statistics` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `date` DATE NOT NULL,
    `restaurant_id` VARCHAR(50),
    `total_orders` INT DEFAULT 0,
    `total_revenue` DECIMAL(12,2) DEFAULT 0.00,
    `total_deliveries` INT DEFAULT 0,
    `average_order_value` DECIMAL(10,2) DEFAULT 0.00,
    `peak_hours` JSON,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_date_restaurant` (`date`, `restaurant_id`),
    INDEX `idx_date` (`date`),
    INDEX `idx_restaurant_date` (`restaurant_id`, `date`)
);

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample restaurants
INSERT INTO `restaurants` (`id`, `name`, `description`, `job_name`, `location_x`, `location_y`, `location_z`, `pickup_x`, `pickup_y`, `pickup_z`, `cuisine_type`, `delivery_fee`, `tax_rate`) VALUES
('uwu-cafe', 'Uwu Cafe', 'Cozy cafe with delicious pastries and coffee', 'uwu', 119.0, -1036.0, 29.0, 119.0, -1036.0, 29.0, 'Cafe', 3.00, 0.0800),
('burger-shot', 'Burger Shot', 'Fast food burgers and fries', 'burgershot', -1191.0, -900.0, 14.0, -1191.0, -900.0, 14.0, 'Fast Food', 5.00, 0.0800),
('pizza-this', 'Pizza This', 'Authentic Italian pizza', 'pizzathis', 537.0, 100.0, 96.0, 537.0, 100.0, 96.0, 'Italian', 4.00, 0.0800);

-- Insert sample menu categories
INSERT INTO `menu_categories` (`restaurant_id`, `name`, `description`, `sort_order`) VALUES
('uwu-cafe', 'Drinks', 'Hot and cold beverages', 1),
('uwu-cafe', 'Pastries', 'Fresh baked goods', 2),
('uwu-cafe', 'Food', 'Light meals and snacks', 3),
('burger-shot', 'Burgers', 'Classic beef burgers', 1),
('burger-shot', 'Sides', 'French fries and more', 2),
('burger-shot', 'Drinks', 'Soft drinks and shakes', 3),
('pizza-this', 'Pizza', 'Authentic Italian pizzas', 1),
('pizza-this', 'Sides', 'Garlic bread and more', 2);

-- Insert sample menu items
INSERT INTO `menu_items` (`id`, `restaurant_id`, `category_id`, `name`, `description`, `price`, `preparation_time`) VALUES
('uwu-coffee', 'uwu-cafe', 1, 'Uwu Coffee', 'Special blend coffee', 5.00, 5),
('uwu-croissant', 'uwu-cafe', 2, 'Uwu Croissant', 'Fresh baked croissant', 3.00, 3),
('uwu-sandwich', 'uwu-cafe', 3, 'Uwu Sandwich', 'Delicious sandwich', 8.00, 10),
('burger-shot-burger', 'burger-shot', 1, 'Burger Shot Burger', 'Classic beef burger', 12.00, 8),
('burger-shot-fries', 'burger-shot', 2, 'Burger Shot Fries', 'Crispy french fries', 6.00, 5),
('burger-shot-shake', 'burger-shot', 3, 'Burger Shot Shake', 'Chocolate milkshake', 4.00, 3),
('pizza-this-margherita', 'pizza-this', 1, 'Margherita Pizza', 'Classic tomato and mozzarella', 15.00, 15),
('pizza-this-pepperoni', 'pizza-this', 1, 'Pepperoni Pizza', 'Spicy pepperoni pizza', 18.00, 15),
('pizza-this-garlic-bread', 'pizza-this', 2, 'Garlic Bread', 'Fresh garlic bread', 7.00, 8);

-- Insert sample discounts
INSERT INTO `discounts` (`code`, `name`, `description`, `type`, `value`, `min_order_amount`, `usage_limit`, `valid_until`) VALUES
('WELCOME10', 'Welcome Discount', '10% off your first order', 'percentage', 10.00, 20.00, 1, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('FREEDELIVERY', 'Free Delivery', 'Free delivery on orders over $30', 'free_delivery', 5.00, 30.00, NULL, DATE_ADD(NOW(), INTERVAL 60 DAY)),
('SAVE5', 'Save $5', 'Save $5 on orders over $25', 'fixed_amount', 5.00, 25.00, NULL, DATE_ADD(NOW(), INTERVAL 90 DAY));

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Additional performance indexes
CREATE INDEX `idx_orders_status_created` ON `orders` (`status`, `created_at`);
CREATE INDEX `idx_orders_user_status` ON `orders` (`user_id`, `status`);
CREATE INDEX `idx_menu_items_restaurant_available` ON `menu_items` (`restaurant_id`, `is_available`);
CREATE INDEX `idx_discounts_code_active` ON `discounts` (`code`, `is_active`);
CREATE INDEX `idx_reviews_restaurant_rating` ON `restaurant_reviews` (`restaurant_id`, `rating`);
CREATE INDEX `idx_driver_earnings_date` ON `driver_earnings` (`driver_id`, `created_at`);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Restaurant summary view
CREATE VIEW `restaurant_summary` AS
SELECT 
    r.id,
    r.name,
    r.cuisine_type,
    r.rating,
    r.total_orders,
    COUNT(DISTINCT mi.id) as menu_items_count,
    AVG(rr.rating) as avg_review_rating,
    COUNT(rr.id) as total_reviews
FROM restaurants r
LEFT JOIN menu_items mi ON r.id = mi.restaurant_id AND mi.is_available = TRUE
LEFT JOIN restaurant_reviews rr ON r.id = rr.restaurant_id
WHERE r.is_active = TRUE
GROUP BY r.id;

-- Driver performance view
CREATE VIEW `driver_performance` AS
SELECT 
    d.id,
    d.first_name,
    d.last_name,
    d.rating,
    d.total_deliveries,
    d.total_earnings,
    AVG(de.total_earnings) as avg_earnings_per_delivery,
    COUNT(de.id) as deliveries_this_month
FROM drivers d
LEFT JOIN driver_earnings de ON d.id = de.driver_id 
    AND de.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
GROUP BY d.id;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Procedure to calculate order totals
DELIMITER //
CREATE PROCEDURE CalculateOrderTotal(IN order_id VARCHAR(50))
BEGIN
    DECLARE subtotal DECIMAL(10,2);
    DECLARE delivery_fee DECIMAL(10,2);
    DECLARE tax_rate DECIMAL(5,4);
    DECLARE tax_amount DECIMAL(10,2);
    DECLARE total_amount DECIMAL(10,2);
    
    -- Get order details
    SELECT 
        o.subtotal,
        o.delivery_fee,
        r.tax_rate
    INTO subtotal, delivery_fee, tax_rate
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    WHERE o.id = order_id;
    
    -- Calculate tax and total
    SET tax_amount = subtotal * tax_rate;
    SET total_amount = subtotal + delivery_fee + tax_amount;
    
    -- Update order
    UPDATE orders 
    SET tax_amount = tax_amount, total_amount = total_amount
    WHERE id = order_id;
    
    SELECT total_amount as new_total;
END //
DELIMITER ;

-- Procedure to process delivery completion
DELIMITER //
CREATE PROCEDURE CompleteDelivery(IN order_id VARCHAR(50), IN driver_id VARCHAR(50))
BEGIN
    DECLARE base_pay DECIMAL(10,2);
    DECLARE order_total DECIMAL(10,2);
    
    -- Get order details
    SELECT total_amount INTO order_total FROM orders WHERE id = order_id;
    
    -- Set base pay (configurable)
    SET base_pay = 25.00;
    
    -- Update order status
    UPDATE orders SET status = 'delivered' WHERE id = order_id;
    
    -- Record driver earnings
    INSERT INTO driver_earnings (driver_id, order_id, base_pay, total_earnings)
    VALUES (driver_id, order_id, base_pay, base_pay);
    
    -- Update driver stats
    UPDATE drivers 
    SET total_deliveries = total_deliveries + 1,
        total_earnings = total_earnings + base_pay
    WHERE id = driver_id;
    
    SELECT 'Delivery completed successfully' as message;
END //
DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update restaurant total orders
DELIMITER //
CREATE TRIGGER after_order_status_update
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        UPDATE restaurants 
        SET total_orders = total_orders + 1
        WHERE id = NEW.restaurant_id;
    END IF;
END //
DELIMITER ;

-- Trigger to update user total orders and spending
DELIMITER //
CREATE TRIGGER after_order_completed
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        UPDATE user_profiles 
        SET total_orders = total_orders + 1,
            total_spent = total_spent + NEW.total_amount
        WHERE id = NEW.user_id;
    END IF;
END //
DELIMITER ;

-- =====================================================
-- FINAL NOTES
-- =====================================================

/*
This database schema provides a comprehensive foundation for a FiveM food delivery system.

Key Features:
- Full restaurant and menu management
- User profiles and order history
- Driver management and earnings tracking
- Discount and promotion system
- Rating and review system
- Comprehensive analytics and reporting
- Performance optimized with proper indexing
- Stored procedures for complex operations
- Triggers for automatic updates

To use this schema:
1. Run this SQL file on your MySQL server
2. Update the config.lua to match your database credentials
3. The system will automatically create tables if they don't exist
4. Sample data is included for testing

Remember to:
- Regularly backup your database
- Monitor performance and add indexes as needed
- Adjust the sample data to match your server's needs
- Set up proper user permissions for the database
*/
