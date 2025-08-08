-- MySQL Schema Export for Manga Reader
-- Compatible with MySQL 5.7+ and MariaDB 10.2+
-- Generated from Supabase PostgreSQL schema

-- Create database (buyers should customize this)
-- CREATE DATABASE manga_reader CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE manga_reader;

-- User roles enum
CREATE TABLE IF NOT EXISTS user_roles (
    value VARCHAR(20) PRIMARY KEY
);
INSERT IGNORE INTO user_roles (value) VALUES 
('admin'), ('editor'), ('author'), ('member'), ('user');

-- Manga status enum
CREATE TABLE IF NOT EXISTS manga_statuses (
    value VARCHAR(20) PRIMARY KEY
);
INSERT IGNORE INTO manga_statuses (value) VALUES 
('ongoing'), ('completed'), ('hiatus'), ('cancelled');

-- License types enum
CREATE TABLE IF NOT EXISTS license_types (
    value VARCHAR(20) PRIMARY KEY
);
INSERT IGNORE INTO license_types (value) VALUES 
('single'), ('extended'), ('developer');

-- Purchase status enum
CREATE TABLE IF NOT EXISTS purchase_statuses (
    value VARCHAR(20) PRIMARY KEY
);
INSERT IGNORE INTO purchase_statuses (value) VALUES 
('pending'), ('completed'), ('failed'), ('refunded');

-- Users table (replaces auth.users)
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    raw_user_meta_data JSON,
    INDEX idx_users_email (email)
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    role ENUM('admin', 'editor', 'author', 'member', 'user') DEFAULT 'member',
    is_banned BOOLEAN DEFAULT FALSE,
    activity_score INT DEFAULT 0,
    login_count INT DEFAULT 0,
    last_login_at TIMESTAMP NULL,
    chapter_layout_preference INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_email (user_id, email),
    INDEX idx_profiles_user_id (user_id),
    INDEX idx_profiles_email (email)
);

-- Manga metadata table
CREATE TABLE IF NOT EXISTS manga_meta (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    author VARCHAR(255),
    artist VARCHAR(255),
    cover_image_url TEXT,
    thumbnail_url TEXT,
    status ENUM('ongoing', 'completed', 'hiatus', 'cancelled') DEFAULT 'ongoing',
    publication_date DATE,
    language VARCHAR(10) DEFAULT 'en',
    age_rating VARCHAR(10) DEFAULT 'T',
    genres JSON,
    tags JSON,
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    noindex BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_manga_title (title),
    INDEX idx_manga_status (status)
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255),
    chapter_number INT NOT NULL,
    pages JSON NOT NULL DEFAULT ('[]'),
    page_count INT DEFAULT 0,
    sort_order INT NOT NULL,
    thumbnail_url TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    download_count INT DEFAULT 0,
    seo_title VARCHAR(255),
    seo_description TEXT,
    release_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_chapters_number (chapter_number),
    INDEX idx_chapters_sort (sort_order),
    INDEX idx_chapters_release (release_date)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    chapter_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_comments_chapter (chapter_id),
    INDEX idx_comments_user (user_id),
    INDEX idx_comments_created (created_at)
);

-- Reading progress table
CREATE TABLE IF NOT EXISTS reading_progress (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    chapter_id CHAR(36) NOT NULL,
    current_page INT DEFAULT 1,
    total_pages INT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_chapter (user_id, chapter_id),
    INDEX idx_reading_user (user_id),
    INDEX idx_reading_chapter (chapter_id)
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    chapter_id CHAR(36) NOT NULL,
    page_number INT NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    INDEX idx_bookmarks_user (user_id),
    INDEX idx_bookmarks_chapter (chapter_id)
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    site_title VARCHAR(255) DEFAULT 'Manga Reader',
    logo_url TEXT,
    hero_bg_url TEXT,
    hero_height VARCHAR(50) DEFAULT '70vh',
    theme_color VARCHAR(7) DEFAULT '#dc2626',
    secondary_color VARCHAR(7) DEFAULT '#f59e0b',
    layout_mode VARCHAR(20) DEFAULT 'spacious',
    typography_style VARCHAR(20) DEFAULT 'modern',
    button_style VARCHAR(20) DEFAULT 'rounded',
    font_size VARCHAR(20) DEFAULT 'medium',
    enable_animations BOOLEAN DEFAULT TRUE,
    cursor_type VARCHAR(20) DEFAULT 'default',
    cursor_size INT DEFAULT 16,
    cursor_trail BOOLEAN DEFAULT FALSE,
    cursor_glow BOOLEAN DEFAULT FALSE,
    custom_cursor_url TEXT,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    maintenance_message TEXT,
    analytics_code TEXT,
    custom_css TEXT,
    custom_js TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default site settings
INSERT IGNORE INTO site_settings (id, site_title) VALUES (UUID(), 'Manga Reader');

-- Customers table (for license management)
CREATE TABLE IF NOT EXISTS customers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    phone VARCHAR(50),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customers_email (email)
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    customer_id CHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_intent_id VARCHAR(255),
    invoice_number VARCHAR(100),
    license_id CHAR(36),
    metadata JSON DEFAULT ('{}'),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_purchases_customer (customer_id),
    INDEX idx_purchases_status (status)
);

-- Licenses table
CREATE TABLE IF NOT EXISTS licenses (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    license_key VARCHAR(50) NOT NULL UNIQUE,
    license_type ENUM('single', 'extended', 'developer') DEFAULT 'single',
    customer_id CHAR(36) NOT NULL,
    purchase_id CHAR(36),
    product_name VARCHAR(255) DEFAULT 'Manga Reader Theme',
    product_version VARCHAR(20) DEFAULT '1.0.0',
    domains_allowed INT DEFAULT 1,
    domains_used JSON DEFAULT ('[]'),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE SET NULL,
    INDEX idx_licenses_key (license_key),
    INDEX idx_licenses_customer (customer_id)
);

-- Global notifications table
CREATE TABLE IF NOT EXISTS global_notifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info',
    is_active BOOLEAN DEFAULT TRUE,
    show_on_all_pages BOOLEAN DEFAULT FALSE,
    expire_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_notifications_active (is_active),
    INDEX idx_notifications_expire (expire_at)
);

-- Feature toggles table
CREATE TABLE IF NOT EXISTS feature_toggles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    feature_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_enabled BOOLEAN DEFAULT FALSE,
    config_data JSON DEFAULT ('{}'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_features_name (feature_name),
    INDEX idx_features_enabled (is_enabled)
);

-- SEO settings table
CREATE TABLE IF NOT EXISTS seo_settings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    page_type VARCHAR(50) NOT NULL,
    target_id CHAR(36),
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    og_title VARCHAR(255),
    og_description TEXT,
    og_image_url TEXT,
    canonical_url TEXT,
    robots_directives VARCHAR(100) DEFAULT 'index, follow',
    structured_data JSON DEFAULT ('{}'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_seo_page_type (page_type),
    INDEX idx_seo_target (target_id)
);

-- User activity logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    chapter_id CHAR(36),
    page_url TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(100),
    metadata JSON DEFAULT ('{}'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_activity_user (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_activity_created (created_at)
);

-- Analytics config table
CREATE TABLE IF NOT EXISTS analytics_config (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    provider VARCHAR(50) NOT NULL,
    tracking_id VARCHAR(255),
    config_data JSON DEFAULT ('{}'),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_analytics_provider (provider),
    INDEX idx_analytics_active (is_active)
);

-- Ad zones table
CREATE TABLE IF NOT EXISTS ad_zones (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    zone_name VARCHAR(100) NOT NULL,
    position VARCHAR(50) NOT NULL,
    size_specs VARCHAR(100),
    ad_code TEXT,
    priority INT DEFAULT 0,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ads_position (position),
    INDEX idx_ads_active (is_active)
);

-- Admin actions table
CREATE TABLE IF NOT EXISTS admin_actions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    admin_user_id CHAR(36) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    target_type VARCHAR(50),
    target_id CHAR(36),
    metadata JSON DEFAULT ('{}'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_admin_actions_user (admin_user_id),
    INDEX idx_admin_actions_type (action_type),
    INDEX idx_admin_actions_created (created_at)
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    message TEXT,
    paypal_order_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_donations_email (email),
    INDEX idx_donations_status (status),
    INDEX idx_donations_transaction (transaction_id)
);

-- License verifications table
CREATE TABLE IF NOT EXISTS license_verifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    license_key VARCHAR(50) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    verification_result BOOLEAN NOT NULL,
    error_message TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_verifications_key (license_key),
    INDEX idx_verifications_domain (domain),
    INDEX idx_verifications_created (created_at)
);

-- Download logs table
CREATE TABLE IF NOT EXISTS download_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    customer_id CHAR(36) NOT NULL,
    license_id CHAR(36) NOT NULL,
    download_url TEXT,
    file_size BIGINT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE,
    INDEX idx_downloads_customer (customer_id),
    INDEX idx_downloads_license (license_id),
    INDEX idx_downloads_created (created_at)
);

-- Create triggers for automatic license generation
DELIMITER //

CREATE TRIGGER create_license_for_purchase
AFTER UPDATE ON purchases
FOR EACH ROW
BEGIN
    DECLARE new_license_key VARCHAR(50);
    DECLARE domains_allowed INT DEFAULT 1;
    
    -- Only create license for completed purchases
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Determine domains allowed based on amount
        IF NEW.amount >= 299 THEN
            SET domains_allowed = 999; -- Developer license
        ELSEIF NEW.amount >= 149 THEN
            SET domains_allowed = 10; -- Extended license
        ELSE
            SET domains_allowed = 1; -- Single license
        END IF;
        
        -- Generate unique license key
        SET new_license_key = CONCAT(
            SUBSTRING(MD5(RAND()), 1, 4), '-',
            SUBSTRING(MD5(RAND()), 1, 4), '-',
            SUBSTRING(MD5(RAND()), 1, 4), '-',
            SUBSTRING(MD5(RAND()), 1, 4)
        );
        
        -- Ensure uniqueness
        WHILE EXISTS(SELECT 1 FROM licenses WHERE license_key = new_license_key) DO
            SET new_license_key = CONCAT(
                SUBSTRING(MD5(RAND()), 1, 4), '-',
                SUBSTRING(MD5(RAND()), 1, 4), '-',
                SUBSTRING(MD5(RAND()), 1, 4), '-',
                SUBSTRING(MD5(RAND()), 1, 4)
            );
        END WHILE;
        
        -- Create the license
        INSERT INTO licenses (
            license_key,
            license_type,
            customer_id,
            purchase_id,
            domains_allowed
        ) VALUES (
            new_license_key,
            CASE 
                WHEN domains_allowed = 999 THEN 'developer'
                WHEN domains_allowed = 10 THEN 'extended'
                ELSE 'single'
            END,
            NEW.customer_id,
            NEW.id,
            domains_allowed
        );
        
        -- Update purchase with license_id
        UPDATE purchases SET license_id = LAST_INSERT_ID() WHERE id = NEW.id;
    END IF;
END//

-- Trigger for updating timestamps
CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER update_chapters_timestamp
BEFORE UPDATE ON chapters
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER update_comments_timestamp
BEFORE UPDATE ON comments
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER update_reading_progress_timestamp
BEFORE UPDATE ON reading_progress
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

DELIMITER ;

-- Create default admin user (buyers should change this)
INSERT IGNORE INTO users (id, email, password_hash, email_verified) VALUES 
(UUID(), 'admin@manga.com', '$2b$10$example_hash_change_this', TRUE);

INSERT IGNORE INTO profiles (user_id, email, username, role) VALUES 
((SELECT id FROM users WHERE email = 'admin@manga.com'), 'admin@manga.com', 'admin', 'admin');

-- Sample data for demo
INSERT IGNORE INTO manga_meta (id, title, description, author, status) VALUES
(UUID(), 'Sample Manga', 'A sample manga for demonstration', 'Demo Author', 'ongoing');

INSERT IGNORE INTO chapters (id, title, chapter_number, sort_order, pages) VALUES
(UUID(), 'Chapter 1: Beginning', 1, 1, '[]');