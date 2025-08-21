local QBCore = exports['qb-core']:GetCoreObject()
local PlayerData = {}
local currentOrder = nil
local isDriver = false

-- Initialize player data
RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    PlayerData = QBCore.Functions.GetPlayerData()
end)

RegisterNetEvent('QBCore:Client:OnJobUpdate', function(JobInfo)
    PlayerData.job = JobInfo
end)

RegisterNetEvent('QBCore:Client:OnPlayerUnload', function()
    PlayerData = {}
end)

-- NUI Callbacks
RegisterNUICallback('getPlayerJob', function(data, cb)
    if PlayerData.job then
        cb(PlayerData.job.name)
    else
        cb('unemployed')
    end
end)

RegisterNUICallback('getRestaurants', function(data, cb)
    cb(Config.Restaurants)
end)

RegisterNUICallback('getPlayerOrders', function(data, cb)
    local playerId = PlayerData.citizenid
    if playerId then
        TriggerServerEvent('sergei-eats:getPlayerOrders', playerId)
        cb({}) -- Will be updated via event
    else
        cb({})
    end
end)

RegisterNUICallback('placeOrder', function(data, cb)
    local playerId = PlayerData.citizenid
    local playerName = PlayerData.charinfo and PlayerData.charinfo.firstname .. ' ' .. PlayerData.charinfo.lastname or 'Unknown'
    local playerCoords = GetEntityCoords(PlayerPedId())
    
    if playerId then
        local orderData = {
            restaurantId = data.restaurantId,
            restaurantName = data.restaurantName,
            items = data.items,
            total = data.total,
            customerId = playerId,
            customerName = playerName,
            customerLocation = {
                x = playerCoords.x,
                y = playerCoords.y,
                z = playerCoords.z
            }
        }
        
        TriggerServerEvent('sergei-eats:placeOrder', orderData)
        cb(true)
    else
        cb(false)
    end
end)

RegisterNUICallback('updateOrder', function(data, cb)
    TriggerServerEvent('sergei-eats:updateOrder', data)
    cb(true)
end)

RegisterNUICallback('acceptDelivery', function(data, cb)
    local playerId = PlayerData.citizenid
    local playerName = PlayerData.charinfo and PlayerData.charinfo.firstname .. ' ' .. PlayerData.charinfo.lastname or 'Unknown'
    
    if playerId then
        TriggerServerEvent('sergei-eats:acceptDelivery', data, playerId, playerName)
        cb(true)
    else
        cb(false)
    end
end)

RegisterNUICallback('completeDelivery', function(data, cb)
    local playerId = PlayerData.citizenid
    
    if playerId then
        TriggerServerEvent('sergei-eats:completeDelivery', data, playerId)
        cb(true)
    else
        cb(false)
    end
end)

-- Server Events
RegisterNetEvent('sergei-eats:updatePlayerOrders', function(orders)
    SendNUIMessage({
        type = 'updateOrders',
        orders = orders
    })
end)

RegisterNetEvent('sergei-eats:orderUpdate', function(order)
    SendNUIMessage({
        type = 'orderUpdate',
        order = order
    })
    
    -- Update current order if it's the active one
    if currentOrder and currentOrder.id == order.id then
        currentOrder = order
    end
end)

RegisterNetEvent('sergei-eats:newOrder', function(order)
    SendNUIMessage({
        type = 'newOrder',
        order = order
    })
end)

-- Waypoint Functions
function SetPickupWaypoint(order)
    if order and order.restaurantId then
        local restaurant = Config.Restaurants[order.restaurantId]
        if restaurant then
            SetNewWaypoint(restaurant.pickupLocation.x, restaurant.pickupLocation.y)
            QBCore.Functions.Notify('Pickup waypoint set to ' .. restaurant.name, 'success')
        end
    end
end

function SetDeliveryWaypoint(order)
    if order and order.customerLocation then
        SetNewWaypoint(order.customerLocation.x, order.customerLocation.y)
        QBCore.Functions.Notify('Delivery waypoint set to customer location', 'success')
    end
end

-- Driver Functions
function ToggleDriverMode()
    isDriver = not isDriver
    
    if isDriver then
        QBCore.Functions.Notify('Driver mode enabled', 'success')
        -- Add driver job if not already present
        if PlayerData.job.name ~= Config.DriverJob then
            TriggerServerEvent('sergei-eats:addDriverJob')
        end
    else
        QBCore.Functions.Notify('Driver mode disabled', 'info')
        -- Remove driver job
        TriggerServerEvent('sergei-eats:removeDriverJob')
    end
end

-- Order Tracking
function TrackOrder(order)
    if order then
        currentOrder = order
        
        -- Set initial waypoint to restaurant
        SetPickupWaypoint(order)
        
        -- Start tracking thread
        Citizen.CreateThread(function()
            while currentOrder and currentOrder.id == order.id do
                Citizen.Wait(1000)
                
                -- Check if player is at pickup location
                if currentOrder.status == 'ready' then
                    local playerCoords = GetEntityCoords(PlayerPedId())
                    local restaurant = Config.Restaurants[order.restaurantId]
                    
                    if restaurant then
                        local distance = #(playerCoords - vector3(restaurant.pickupLocation.x, restaurant.pickupLocation.y, restaurant.pickupLocation.z))
                        
                        if distance < Config.DeliveryRadius then
                            -- Player is at pickup location
                            TriggerServerEvent('sergei-eats:orderPickedUp', order.id)
                            SetDeliveryWaypoint(order)
                            QBCore.Functions.Notify('Order picked up! Head to delivery location', 'success')
                        end
                    end
                end
                
                -- Check if player is at delivery location
                if currentOrder.status == 'delivering' then
                    local playerCoords = GetEntityCoords(PlayerPedId())
                    local distance = #(playerCoords - vector3(order.customerLocation.x, order.customerLocation.y, order.customerLocation.z))
                    
                    if distance < Config.DeliveryRadius then
                        -- Player is at delivery location
                        QBCore.Functions.Notify('At delivery location! Complete delivery in app', 'success')
                    end
                end
            end
        end)
    end
end

-- Commands
RegisterCommand('sergei-eats', function()
    -- This will be handled by the phone app
end, false)

RegisterCommand('toggle-driver', function()
    ToggleDriverMode()
end, false)

-- Keybind for driver mode (F6)
RegisterKeyMapping('toggle-driver', 'Toggle Driver Mode', 'keyboard', 'F6')

-- Export functions for other resources
exports('SetPickupWaypoint', SetPickupWaypoint)
exports('SetDeliveryWaypoint', SetDeliveryWaypoint)
exports('TrackOrder', TrackOrder)
exports('ToggleDriverMode', ToggleDriverMode)
