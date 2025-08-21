---@param source number
---@param device Device
---@return string?
local function GetEquippedDeviceId(source, device)
    if device == "tablet" then
        return exports["lb-tablet"]:GetEquippedTablet(source)
    elseif device == "phone" then
        return exports["lb-phone"]:GetEquippedPhoneNumber(source)
    end
end

---@param device Device
---@param message string
RegisterNetEvent("lb-combined-reactts:notification", function(device, message)
    local src = source
    local deviceId = GetEquippedDeviceId(src, device)

    if not deviceId then
        return
    end

    if device == "tablet" then
        exports["lb-tablet"]:SendNotification({
            tabletId = deviceId,
            app = Config.Identifier,
            title = Config.Name,
            content = message,
        })
    elseif device == "phone" then
        exports["lb-phone"]:SendNotification(deviceId, {
            app = Config.Identifier,
            title = Config.Name,
            content = message,
        })
    end
end)

local QBCore = exports['qb-core']:GetCoreObject()

-- Database table creation (run once)
local function InitializeDatabase()
    local success = MySQL.query.await([[
        CREATE TABLE IF NOT EXISTS sergei_eats_orders (
            id VARCHAR(50) PRIMARY KEY,
            restaurant_id VARCHAR(50) NOT NULL,
            restaurant_name VARCHAR(100) NOT NULL,
            items JSON NOT NULL,
            total DECIMAL(10,2) NOT NULL,
            status ENUM('pending', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled') DEFAULT 'pending',
            customer_id VARCHAR(50) NOT NULL,
            customer_name VARCHAR(100) NOT NULL,
            customer_location JSON NOT NULL,
            driver_id VARCHAR(50) NULL,
            driver_name VARCHAR(100) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ]])
    
    if success then
        print('^2[Sergei Eats] Database initialized successfully^0')
    else
        print('^1[Sergei Eats] Database initialization failed^0')
    end
end

-- Initialize database on resource start
AddEventHandler('onResourceStart', function(resourceName)
    if resourceName == GetCurrentResourceName() then
        InitializeDatabase()
    end
end)

-- Place a new order
RegisterNetEvent('sergei-eats:placeOrder', function(orderData)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if not Player then return end
    
    -- Generate unique order ID
    local orderId = 'SE' .. os.time() .. math.random(1000, 9999)
    
    -- Insert order into database
    local success = MySQL.insert.await('INSERT INTO sergei_eats_orders (id, restaurant_id, restaurant_name, items, total, customer_id, customer_name, customer_location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', {
        orderId,
        orderData.restaurantId,
        orderData.restaurantName,
        json.encode(orderData.items),
        orderData.total,
        orderData.customerId,
        orderData.customerName,
        json.encode(orderData.customerLocation)
    })
    
    if success then
        -- Notify restaurant staff
        local restaurantJob = Config.Restaurants[orderData.restaurantId] and Config.Restaurants[orderData.restaurantId].job
        if restaurantJob then
            local staffPlayers = QBCore.Functions.GetPlayersByJob(restaurantJob)
            for _, staffPlayer in pairs(staffPlayers) do
                TriggerClientEvent('sergei-eats:newOrder', staffPlayer, {
                    id = orderId,
                    restaurantId = orderData.restaurantId,
                    restaurantName = orderData.restaurantName,
                    items = orderData.items,
                    total = orderData.total,
                    status = 'pending',
                    customerId = orderData.customerId,
                    customerName = orderData.customerName,
                    customerLocation = orderData.customerLocation,
                    createdAt = os.time() * 1000
                })
            end
        end
        
        -- Update customer's orders
        TriggerClientEvent('sergei-eats:updatePlayerOrders', src, GetPlayerOrders(orderData.customerId))
        
        TriggerClientEvent('QBCore:Notify', src, 'Order placed successfully!', 'success')
    else
        TriggerClientEvent('QBCore:Notify', src, 'Failed to place order', 'error')
    end
end)

-- Update order status
RegisterNetEvent('sergei-eats:updateOrder', function(orderData)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if not Player then return end
    
    -- Verify player has permission to update this order
    local restaurantJob = Config.Restaurants[orderData.restaurantId] and Config.Restaurants[orderData.restaurantId].job
    if not restaurantJob or Player.PlayerData.job.name ~= restaurantJob then
        return
    end
    
    -- Update order in database
    local success = MySQL.update.await('UPDATE sergei_eats_orders SET status = ? WHERE id = ?', {
        orderData.status,
        orderData.id
    })
    
    if success then
        -- Notify all relevant parties
        local updatedOrder = GetOrderById(orderData.id)
        if updatedOrder then
            -- Notify customer
            TriggerClientEvent('sergei-eats:orderUpdate', updatedOrder.customerId, updatedOrder)
            
            -- Notify restaurant staff
            local staffPlayers = QBCore.Functions.GetPlayersByJob(restaurantJob)
            for _, staffPlayer in pairs(staffPlayers) do
                TriggerClientEvent('sergei-eats:orderUpdate', staffPlayer, updatedOrder)
            end
            
            -- Notify available drivers if order is ready
            if updatedOrder.status == 'ready' then
                local driverPlayers = QBCore.Functions.GetPlayersByJob(Config.DriverJob)
                for _, driverPlayer in pairs(driverPlayers) do
                    TriggerClientEvent('sergei-eats:orderUpdate', driverPlayer, updatedOrder)
                end
            end
        end
    end
end)

-- Accept delivery
RegisterNetEvent('sergei-eats:acceptDelivery', function(orderId, driverId, driverName)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if not Player then return end
    
    -- Verify player is a driver
    if Player.PlayerData.job.name ~= Config.DriverJob then
        return
    end
    
    -- Update order with driver info
    local success = MySQL.update.await('UPDATE sergei_eats_orders SET status = ?, driver_id = ?, driver_name = ? WHERE id = ? AND status = ?', {
        'delivering',
        driverId,
        driverName,
        orderId,
        'ready'
    })
    
    if success then
        local updatedOrder = GetOrderById(orderId)
        if updatedOrder then
            -- Notify all relevant parties
            TriggerClientEvent('sergei-eats:orderUpdate', updatedOrder.customerId, updatedOrder)
            
            -- Notify restaurant staff
            local restaurantJob = Config.Restaurants[updatedOrder.restaurantId] and Config.Restaurants[updatedOrder.restaurantId].job
            if restaurantJob then
                local staffPlayers = QBCore.Functions.GetPlayersByJob(restaurantJob)
                for _, staffPlayer in pairs(staffPlayers) do
                    TriggerClientEvent('sergei-eats:orderUpdate', staffPlayer, updatedOrder)
                end
            end
            
            -- Notify driver
            TriggerClientEvent('sergei-eats:orderUpdate', src, updatedOrder)
            
            TriggerClientEvent('QBCore:Notify', src, 'Delivery accepted! Head to the restaurant to pick up the order.', 'success')
        end
    end
end)

-- Complete delivery
RegisterNetEvent('sergei-eats:completeDelivery', function(orderId, driverId)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if not Player then return end
    
    -- Verify player is the assigned driver
    local order = GetOrderById(orderId)
    if not order or order.driverId ~= driverId then
        return
    end
    
    -- Update order status
    local success = MySQL.update.await('UPDATE sergei_eats_orders SET status = ? WHERE id = ?', {
        'delivered',
        orderId
    })
    
    if success then
        -- Pay the driver
        Player.Functions.AddMoney('cash', Config.DriverPay, 'food-delivery-completed')
        
        -- Notify all relevant parties
        local updatedOrder = GetOrderById(orderId)
        if updatedOrder then
            TriggerClientEvent('sergei-eats:orderUpdate', updatedOrder.customerId, updatedOrder)
            
            -- Notify restaurant staff
            local restaurantJob = Config.Restaurants[updatedOrder.restaurantId] and Config.Restaurants[updatedOrder.restaurantId].job
            if restaurantJob then
                local staffPlayers = QBCore.Functions.GetPlayersByJob(restaurantJob)
                for _, staffPlayer in pairs(staffPlayers) do
                    TriggerClientEvent('sergei-eats:orderUpdate', staffPlayer, updatedOrder)
                end
            end
            
            -- Notify driver
            TriggerClientEvent('sergei-eats:orderUpdate', src, updatedOrder)
            
            TriggerClientEvent('QBCore:Notify', src, 'Delivery completed! You earned $' .. Config.DriverPay, 'success')
        end
    end
end)

-- Order picked up (automatic when driver is at pickup location)
RegisterNetEvent('sergei-eats:orderPickedUp', function(orderId)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if not Player then return end
    
    -- Update order status to delivering
    local success = MySQL.update.await('UPDATE sergei_eats_orders SET status = ? WHERE id = ? AND driver_id = ?', {
        'delivering',
        orderId,
        Player.PlayerData.citizenid
    })
    
    if success then
        local updatedOrder = GetOrderById(orderId)
        if updatedOrder then
            -- Notify all relevant parties
            TriggerClientEvent('sergei-eats:orderUpdate', updatedOrder.customerId, updatedOrder)
            
            -- Notify restaurant staff
            local restaurantJob = Config.Restaurants[updatedOrder.restaurantId] and Config.Restaurants[updatedOrder.restaurantId].job
            if restaurantJob then
                local staffPlayers = QBCore.Functions.GetPlayersByJob(restaurantJob)
                for _, staffPlayer in pairs(staffPlayers) do
                    TriggerClientEvent('sergei-eats:orderUpdate', staffPlayer, updatedOrder)
                end
            end
            
            -- Notify driver
            TriggerClientEvent('sergei-eats:orderUpdate', src, updatedOrder)
        end
    end
end)

-- Get player orders
RegisterNetEvent('sergei-eats:getPlayerOrders', function(playerId)
    local src = source
    local orders = GetPlayerOrders(playerId)
    TriggerClientEvent('sergei-eats:updatePlayerOrders', src, orders)
end)

-- Add driver job temporarily
RegisterNetEvent('sergei-eats:addDriverJob', function()
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if not Player then return end
    
    -- Store original job
    local originalJob = Player.PlayerData.job
    
    -- Set temporary driver job
    Player.Functions.SetJob(Config.DriverJob, 0)
    
    -- Store original job for restoration
    Player.PlayerData.metadata = Player.PlayerData.metadata or {}
    Player.PlayerData.metadata.originalJob = originalJob
    
    TriggerClientEvent('QBCore:Notify', src, 'Driver job activated', 'success')
end)

-- Remove driver job and restore original
RegisterNetEvent('sergei-eats:removeDriverJob', function()
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if not Player then return end
    
    -- Restore original job if available
    if Player.PlayerData.metadata and Player.PlayerData.metadata.originalJob then
        Player.Functions.SetJob(Player.PlayerData.metadata.originalJob.name, Player.PlayerData.metadata.originalJob.grade.level)
        Player.PlayerData.metadata.originalJob = nil
        TriggerClientEvent('QBCore:Notify', src, 'Original job restored', 'info')
    else
        -- Set to unemployed if no original job
        Player.Functions.SetJob('unemployed', 0)
        TriggerClientEvent('QBCore:Notify', src, 'Driver job deactivated', 'info')
    end
end)

-- Helper Functions
function GetPlayerOrders(playerId)
    local result = MySQL.query.await('SELECT * FROM sergei_eats_orders WHERE customer_id = ? ORDER BY created_at DESC', {playerId})
    
    if result then
        for i, order in ipairs(result) do
            order.items = json.decode(order.items)
            order.customerLocation = json.decode(order.customerLocation)
            order.createdAt = order.created_at
        end
        return result
    end
    
    return {}
end

function GetOrderById(orderId)
    local result = MySQL.single.await('SELECT * FROM sergei_eats_orders WHERE id = ?', {orderId})
    
    if result then
        result.items = json.decode(result.items)
        result.customerLocation = json.decode(result.customerLocation)
        result.createdAt = result.created_at
        return result
    end
    
    return nil
end

-- Get all orders for a specific restaurant (for staff view)
function GetRestaurantOrders(restaurantId)
    local result = MySQL.query.await('SELECT * FROM sergei_eats_orders WHERE restaurant_id = ? ORDER BY created_at DESC', {restaurantId})
    
    if result then
        for i, order in ipairs(result) do
            order.items = json.decode(order.items)
            order.customerLocation = json.decode(order.customerLocation)
            order.createdAt = order.created_at
        end
        return result
    end
    
    return {}
end

-- Get all ready orders (for driver view)
function GetReadyOrders()
    local result = MySQL.query.await('SELECT * FROM sergei_eats_orders WHERE status = ? ORDER BY created_at ASC', {'ready'})
    
    if result then
        for i, order in ipairs(result) do
            order.items = json.decode(order.items)
            order.customerLocation = json.decode(order.customerLocation)
            order.createdAt = order.created_at
        end
        return result
    end
    
    return {}
end

-- Export functions for other resources
exports('GetPlayerOrders', GetPlayerOrders)
exports('GetOrderById', GetOrderById)
exports('GetRestaurantOrders', GetRestaurantOrders)
exports('GetReadyOrders', GetReadyOrders)
