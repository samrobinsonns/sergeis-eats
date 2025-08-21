# Sergei Eats - Food Delivery App Installation Guide

## 🚀 Overview

Sergei Eats is a comprehensive food delivery application for FiveM that integrates with the LB Phone Template and QB Core Framework. It provides a complete Uber Eats-style experience with customer ordering, restaurant staff management, and driver delivery systems.

## 📋 Prerequisites

### Required Resources
- **FiveM Server** (Latest version)
- **QB Core Framework** (Latest version)
- **LB Phone** (Latest version)
- **LB Tablet** (Latest version)
- **MySQL Database** (5.7+ or 8.0+)
- **oxmysql** or **mysql-async** (Database resource)

### Required Dependencies
```lua
-- These must be started BEFORE sergei-eats
ensure qb-core
ensure lb-phone
ensure lb-tablet
ensure oxmysql  -- or mysql-async
```

## 📁 File Structure

```
sergei-eats/
├── client/
│   ├── client.lua          # Client-side logic
│   └── add-app.lua         # LB Phone/Tablet app registration
├── server/
│   └── server.lua          # Server-side logic and database
├── ui/
│   ├── src/                # React application source
│   ├── dist/               # Built React application
│   └── package.json        # Frontend dependencies
├── database/
│   └── sergei_eats.sql     # Database schema and sample data
├── config/
│   └── database.lua        # Database configuration template
├── config.lua               # Main configuration file
├── fxmanifest.lua           # Resource manifest
└── README.md                # Application documentation
```

## 🗄️ Database Setup

### 1. Create Database
```sql
CREATE DATABASE `sergei_eats` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Import Schema
```bash
# Option 1: Command line
mysql -u username -p sergei_eats < database/sergei_eats.sql

# Option 2: phpMyAdmin
# Import the database/sergei_eats.sql file through phpMyAdmin interface
```

### 3. Configure Database Connection
Edit `config/database.lua` with your database credentials:
```lua
Config.Database = {
    host = "localhost",
    port = 3306,
    username = "your_username",
    password = "your_password",
    database = "sergei_eats",
    connectionPool = 10,
    ssl = false,
    charset = "utf8mb4"
}
```

## ⚙️ Configuration

### 1. Main Configuration (`config.lua`)
The main configuration file contains:
- Restaurant definitions with job associations
- Menu items and pricing
- Driver payment rates
- Delivery settings

### 2. Restaurant Setup
Each restaurant needs:
- **Job Name**: Must match a QB Core job
- **Location**: Vector3 coordinates in the game world
- **Pickup Location**: Where drivers collect orders
- **Menu Items**: Food items with prices and categories

### 3. Job Configuration
Ensure these jobs exist in your QB Core:
```lua
-- Example jobs that should exist
["uwu"] = {
    label = "Uwu Cafe Staff",
    defaultGrade = 0,
    grades = {
        ['0'] = {
            name = "Employee",
            payment = 50
        }
    }
},
["delivery"] = {
    label = "Delivery Driver",
    defaultGrade = 0,
    grades = {
        ['0'] = {
            name = "Driver",
            payment = 25
        }
    }
}
```

## 🚀 Installation Steps

### Step 1: Resource Installation
1. Copy the `sergei-eats` folder to your server's `resources` directory
2. Add `ensure sergei-eats` to your `server.cfg`
3. Ensure the resource loads after dependencies

### Step 2: Database Setup
1. Create the database using the provided SQL file
2. Update database credentials in `config/database.lua`
3. Test database connection

### Step 3: Frontend Build
```bash
cd ui
npm install
npm run build
```

### Step 4: Configuration
1. Edit `config.lua` with your restaurant locations
2. Update job names to match your server
3. Adjust delivery fees and payment rates

### Step 5: Test Installation
1. Start your server
2. Check console for database initialization messages
3. Test the app in-game

## 🎮 In-Game Usage

### For Customers
1. **Open LB Phone/Tablet**
2. **Navigate to Sergei Eats app**
3. **Browse restaurants and menus**
4. **Add items to cart**
5. **Place order with delivery/pickup option**

### For Restaurant Staff
1. **Have the required job** (e.g., "uwu" for Uwu Cafe)
2. **Open Sergei Eats app**
3. **View incoming orders**
4. **Update order status** (pending → confirmed → preparing → ready)

### For Drivers
1. **Go to Driver Mode** in the app
2. **Accept available deliveries**
3. **Set pickup waypoint** to restaurant
4. **Mark order as picked up**
5. **Set delivery waypoint** to customer
6. **Complete delivery** for payment

## 🔧 Troubleshooting

### Common Issues

#### App Not Appearing
- Check if LB Phone/Tablet is properly installed
- Verify `add-app.lua` is loading correctly
- Check console for error messages

#### Database Connection Failed
- Verify database credentials in `config/database.lua`
- Ensure MySQL service is running
- Check firewall settings

#### Orders Not Saving
- Verify database table creation
- Check server console for SQL errors
- Ensure oxmysql is properly configured

#### Waypoints Not Working
- Verify coordinates in restaurant config
- Check if waypoint functions are properly exported
- Test with simple coordinates first

### Debug Mode
Enable debug mode in `ui/src/config.ts`:
```typescript
MockData: {
    enabled: true, // Set to false in production
    // ... other settings
}
```

## 📊 Features

### ✅ Implemented Features
- **Customer Ordering System**
- **Restaurant Staff Management**
- **Driver Delivery System**
- **Real-time Order Updates**
- **Waypoint Integration**
- **Payment Processing**
- **Order History**
- **Job-based Access Control**
- **Delivery/Pickup Options**
- **Cart Management**
- **Discount System**

### 🔄 Order Flow
1. **Customer places order** → Status: `pending`
2. **Staff confirms order** → Status: `confirmed`
3. **Staff prepares order** → Status: `preparing`
4. **Staff marks ready** → Status: `ready`
5. **Driver accepts delivery** → Status: `ready` (assigned to driver)
6. **Driver picks up** → Status: `picked_up`
7. **Driver delivers** → Status: `delivered`

## 🎯 Customization

### Adding New Restaurants
1. Add restaurant to `Config.Restaurants` in `config.lua`
2. Create corresponding job in QB Core
3. Add menu items and pricing
4. Set pickup and delivery coordinates

### Modifying Menu Items
Edit the menu arrays in `config.lua`:
```lua
menu = {
    {
        id = "unique-item-id",
        name = "Item Name",
        description = "Item Description",
        price = 10.0,
        category = "Category"
    }
}
```

### Adjusting Delivery Settings
Modify these values in `config.lua`:
```lua
Config.DeliveryFee = 5.0
Config.MaxOrderValue = 1000.0
Config.MinOrderAmount = 10.0
Config.TaxRate = 0.08
```

## 📞 Support

### Getting Help
- Check the console for error messages
- Verify all dependencies are properly installed
- Ensure database schema is correctly imported
- Test with default configuration first

### Reporting Issues
When reporting issues, include:
- Server console logs
- Client console logs
- Database error messages
- Steps to reproduce the issue
- Server configuration details

## 🔒 Security Notes

### Production Considerations
- Disable mock data mode in production
- Use strong database passwords
- Regularly backup order data
- Monitor for suspicious activity
- Implement rate limiting if needed

### Data Privacy
- Customer data is stored locally
- Driver information is protected
- Order history is maintained for business purposes
- Consider implementing data retention policies

## 📈 Performance Optimization

### Database Optimization
- Ensure proper indexing on frequently queried fields
- Regular database maintenance
- Monitor query performance
- Consider connection pooling

### Server Performance
- Monitor resource usage
- Optimize database queries
- Implement caching where appropriate
- Regular server maintenance

---

**Sergei Eats** - Bringing food delivery to FiveM! 🍕🚚
