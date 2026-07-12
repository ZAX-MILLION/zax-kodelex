# MySQL Migration Guide

## Overview

This Manga Reader application comes with full MySQL compatibility for traditional hosting environments. While the demo runs on Supabase (PostgreSQL), you can easily migrate to MySQL for production deployment.

## Features

- ✅ Complete MySQL schema with all tables and relationships
- ✅ Data export tools for migrating from Supabase to MySQL
- ✅ Database configuration management
- ✅ Automatic triggers and constraints
- ✅ UTF8MB4 character set for full Unicode support
- ✅ Compatible with MySQL 5.7+ and MariaDB 10.2+

## Quick Start

### 1. Database Preparation

1. Create a new MySQL database:
```sql
CREATE DATABASE manga_reader CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE manga_reader;
```

2. Import the schema file:
```bash
mysql -u your_username -p manga_reader < mysql-schema.sql
```

### 2. Data Migration

1. Access the admin panel: `/admin/export`
2. Click "Export Data to MySQL"
3. Download the generated SQL file
4. Import the data:
```bash
mysql -u your_username -p manga_reader < mysql-data-export.sql
```

### 3. Configuration

1. Go to `/admin/database`
2. Enable "Use MySQL Database"
3. Enter your database credentials
4. Test the connection
5. Save configuration

## Database Schema

### Core Tables

- **users** - User authentication and basic info
- **profiles** - Extended user profiles and preferences
- **manga_meta** - Manga series information
- **chapters** - Chapter data and pages
- **comments** - User comments system
- **reading_progress** - Track user reading progress
- **bookmarks** - User bookmarks

### Admin Tables

- **site_settings** - Site configuration
- **seo_settings** - SEO metadata
- **global_notifications** - Site-wide announcements
- **feature_toggles** - Feature flags
- **analytics_config** - Analytics configuration
- **ad_zones** - Advertisement management

### E-commerce Tables

- **customers** - Customer information
- **purchases** - Purchase records
- **licenses** - License management
- **donations** - Donation tracking

### System Tables

- **admin_actions** - Admin activity log
- **user_activity_logs** - User activity tracking
- **license_verifications** - License validation logs
- **download_logs** - Download tracking

## Authentication

The MySQL version includes a complete authentication system:

- Password hashing with bcrypt
- Email verification
- Session management
- Role-based access control
- User registration and login

## File Storage

For file storage with MySQL deployment:

1. **Local Storage**: Store files in `/uploads` directory
2. **CDN**: Use services like Cloudinary or AWS S3
3. **Server Storage**: Configure Apache/Nginx for file serving

## Installation for Buyers

### Requirements

- PHP 7.4+ or Node.js 14+
- MySQL 5.7+ or MariaDB 10.2+
- Apache/Nginx web server
- SSL certificate (recommended)

### Installation Steps

1. Upload files to web server
2. Create MySQL database
3. Import schema and sample data
4. Configure database connection
5. Set up file upload directory permissions
6. Configure web server virtual host
7. Update admin credentials

### Configuration Files

- `config/database.php` - Database connection
- `config/app.php` - Application settings
- `.htaccess` - Apache rewrite rules

## Security Considerations

### Before Going Live

1. **Change default admin password**
2. **Update database credentials**
3. **Configure SSL certificate**
4. **Set proper file permissions**
5. **Enable security headers**
6. **Configure backup system**

### Recommended Security Settings

```apache
# .htaccess example
RewriteEngine On
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
```

## Performance Optimization

### Database Optimization

1. **Enable query caching**
2. **Configure proper indexes**
3. **Optimize MySQL settings**
4. **Regular database maintenance**

### Application Optimization

1. **Enable PHP OpCache**
2. **Use compression (gzip)**
3. **Optimize images**
4. **Configure caching headers**

### Recommended MySQL Settings

```ini
[mysqld]
innodb_buffer_pool_size = 1G
query_cache_type = 1
query_cache_size = 64M
max_connections = 100
tmp_table_size = 64M
max_heap_table_size = 64M
```

## Backup and Maintenance

### Automated Backups

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u username -p manga_reader > backup_$DATE.sql
```

### Regular Maintenance

1. **Daily database backups**
2. **Weekly file system backups**
3. **Monthly security updates**
4. **Quarterly performance reviews**

## Troubleshooting

### Common Issues

1. **Connection errors**: Check database credentials
2. **Upload errors**: Verify file permissions
3. **Slow queries**: Review database indexes
4. **Memory errors**: Increase PHP memory limit

### Debug Mode

Enable debug mode in development:
```php
define('APP_DEBUG', true);
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## Support

For technical support:
1. Check the documentation
2. Review error logs
3. Search community forums
4. Contact support team

## License

This application includes:
- Single Site License: 1 domain
- Extended License: 10 domains  
- Developer License: Unlimited domains

Each license includes:
- Full source code
- Documentation
- 6 months support
- Free updates

---

*Last updated: January 2025*