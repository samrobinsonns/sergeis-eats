-- =====================================================
-- Sergei Eats Database Configuration Example
-- =====================================================

-- Database Configuration
Config.Database = {
    -- MySQL Connection Settings
    host = "localhost",
    port = 3306,
    username = "your_username",
    password = "your_password",
    database = "sergei_eats",
    
    -- Connection Pool Settings
    connectionLimit = 10,
    acquireTimeout = 60000,
    timeout = 60000,
    reconnect = true,
    
    -- SSL Settings (if using SSL)
    ssl = false,
    -- ssl_ca = "/path/to/ca.pem",
    -- ssl_cert = "/path/to/cert.pem",
    -- ssl_key = "/path/to/key.pem",
    
    -- Character Set
    charset = "utf8mb4",
    collation = "utf8mb4_unicode_ci"
}

-- Database Table Prefix (optional)
Config.DatabasePrefix = "se_"

-- Database Backup Settings
Config.DatabaseBackup = {
    enabled = true,
    backupInterval = 24, -- hours
    maxBackups = 7, -- keep last 7 backups
    backupPath = "./backups/",
    compressBackups = true
}

-- Database Logging
Config.DatabaseLogging = {
    enabled = true,
    logLevel = "info", -- debug, info, warning, error
    logQueries = false, -- log all SQL queries (use only for debugging)
    logSlowQueries = true, -- log queries taking longer than threshold
    slowQueryThreshold = 1000 -- milliseconds
}

-- Database Performance Settings
Config.DatabasePerformance = {
    -- Connection pooling
    maxConnections = 20,
    minConnections = 5,
    
    -- Query timeout
    queryTimeout = 30000, -- milliseconds
    
    -- Cache settings
    enableQueryCache = true,
    queryCacheSize = 1000,
    
    -- Index optimization
    autoOptimizeIndexes = true,
    optimizeInterval = 168 -- hours (weekly)
}

-- Database Migration Settings
Config.DatabaseMigration = {
    enabled = true,
    autoMigrate = true, -- automatically run migrations on startup
    migrationTable = "database_migrations",
    backupBeforeMigration = true
}

-- Example usage in your server.lua:
--[[
local function InitializeDatabase()
    -- Check if MySQL resource is available
    if GetResourceState('mysql-async') == 'started' then
        exports['mysql-async']:mysql_ready(function()
            print('^2[Sergei Eats] MySQL connection established^0')
            CreateTables()
        end)
    elseif GetResourceState('oxmysql') == 'started' then
        exports.oxmysql:ready(function()
            print('^2[Sergei Eats] oxmysql connection established^0')
            CreateTables()
        end)
    else
        print('^1[Sergei Eats] No MySQL resource found. Please install mysql-async or oxmysql^0')
        return
    end
end

local function CreateTables()
    -- Create tables if they don't exist
    local tables = {
        'restaurants',
        'menu_categories', 
        'menu_items',
        'user_profiles',
        'orders',
        'order_items',
        'drivers',
        'discounts',
        'restaurant_reviews',
        'driver_reviews'
    }
    
    for _, tableName in pairs(tables) do
        local success = MySQL.query.await([[
            CREATE TABLE IF NOT EXISTS ]] .. Config.DatabasePrefix .. tableName .. [[ (
                -- Table structure will be created based on the SQL file
            )
        ]])
        
        if success then
            print('^2[Sergei Eats] Table ' .. tableName .. ' created/verified^0')
        else
            print('^1[Sergei Eats] Failed to create table ' .. tableName .. '^0')
        end
    end
end
--]]

-- =====================================================
-- Installation Instructions
-- =====================================================

--[[
1. Copy this file to config/database.lua
2. Update the database connection details
3. Run the sergei_eats.sql file on your MySQL server
4. Ensure your MySQL resource (mysql-async or oxmysql) is started
5. Restart the sergei-eats resource

Required MySQL Resources:
- mysql-async: https://github.com/brouznouf/fivem-mysql-async
- oxmysql: https://github.com/overextended/oxmysql

Database Requirements:
- MySQL 5.7+ or MariaDB 10.2+
- UTF8MB4 character set support
- JSON data type support
- InnoDB storage engine
- At least 100MB free space

Performance Recommendations:
- Use SSD storage for better I/O performance
- Configure MySQL buffer pool size appropriately
- Enable query cache for frequently accessed data
- Regular database maintenance and optimization
--]]
