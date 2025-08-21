# Sergei Eats - Food Delivery App

A comprehensive food delivery application for FiveM servers using the LB Phone Template and QB Core Framework.

## Features

### 🏪 Customer Features
- Browse restaurants and view menus
- Add items to cart with quantity controls
- Place orders with delivery to your location
- Track order status in real-time
- View order history

### 👨‍🍳 Staff Features
- View incoming orders for your restaurant
- Update order status (pending → preparing → ready)
- Cancel orders if needed
- Real-time order notifications

### 🚗 Driver Features
- Accept delivery orders
- Automatic waypoint setting for pickup and delivery
- Real-time order tracking
- Automatic payment upon delivery completion
- Toggle driver mode on/off

## Installation

### Prerequisites
- FiveM Server
- LB Phone Template
- QB Core Framework
- MySQL Database

### Setup
1. Place the resource in your server's resources folder
2. Add `ensure sergei-eats` to your server.cfg
3. Configure restaurants and jobs in `config.lua`
4. Restart your server

### Database
The app automatically creates the required database table on first run. Make sure your MySQL connection is properly configured in your server.

## Configuration

### Restaurants
Configure restaurants in `config.lua`:

```lua
Config.Restaurants = {
    ["uwu-cafe"] = {
        name = "Uwu Cafe",
        job = "uwu",
        description = "Cozy cafe with delicious pastries and coffee",
        location = vector3(119.0, -1036.0, 29.0),
        pickupLocation = vector3(119.0, -1036.0, 29.0),
        menu = {
            {
                id = "uwu-coffee",
                name = "Uwu Coffee",
                description = "Special blend coffee",
                price = 5.0,
                category = "Drinks"
            }
        }
    }
}
```

### Jobs
- **Restaurant Staff**: Players with restaurant jobs (e.g., "uwu", "burgershot") see the staff view
- **Drivers**: Players can toggle driver mode to accept deliveries
- **Customers**: All players can browse restaurants and place orders

### Settings
- `Config.DriverPay`: Base payment for drivers per delivery
- `Config.DeliveryFee`: Fixed delivery fee added to orders
- `Config.TaxRate`: Tax percentage applied to orders
- `Config.DeliveryRadius`: Distance to consider delivery/pickup complete

## Usage

### For Customers
1. Open the Sergei Eats app in your phone
2. Browse available restaurants
3. Select items and add to cart
4. Review cart and place order
5. Track your order status

### For Restaurant Staff
1. Open the app while having a restaurant job
2. View incoming orders in the staff dashboard
3. Update order status as you prepare food
4. Mark orders as ready for pickup

### For Drivers
1. Toggle driver mode in the app (or use F6 key)
2. View available delivery orders
3. Accept orders and follow waypoints
4. Pick up orders from restaurants
5. Deliver to customer locations
6. Complete delivery for payment

## Commands

- `/toggle-driver` - Toggle driver mode on/off
- `F6` - Keybind for driver mode toggle

## API Exports

### Client Exports
```lua
-- Set waypoint to restaurant pickup location
exports['sergei-eats']:SetPickupWaypoint(order)

-- Set waypoint to customer delivery location
exports['sergei-eats']:SetDeliveryWaypoint(order)

-- Track an order (sets waypoints and monitors progress)
exports['sergei-eats']:TrackOrder(order)

-- Toggle driver mode
exports['sergei-eats']:ToggleDriverMode()
```

### Server Exports
```lua
-- Get player's order history
exports['sergei-eats']:GetPlayerOrders(playerId)

-- Get specific order details
exports['sergei-eats']:GetOrderById(orderId)

-- Get all orders for a restaurant
exports['sergei-eats']:GetRestaurantOrders(restaurantId)

-- Get all ready orders for drivers
exports['sergei-eats']:GetReadyOrders()
```

## File Structure

```
sergei-eats/
├── config.lua              # Configuration file
├── fxmanifest.lua          # Resource manifest
├── client/
│   ├── client.lua          # Client-side logic and QB Core integration
│   ├── add-app.lua         # LB Phone app registration
│   └── functions.lua       # Utility functions
├── server/
│   └── server.lua          # Server-side logic and database operations
├── ui/
│   ├── src/
│   │   ├── App.tsx         # Main app component
│   │   ├── components/     # React components
│   │   └── config.ts       # Frontend configuration
│   └── dist/               # Built React app
└── README.md               # This file
```

## Troubleshooting

### Common Issues
1. **App not showing in phone**: Check if LB Phone is started and the app is properly registered
2. **Orders not updating**: Verify QB Core is running and player data is loaded
3. **Waypoints not working**: Ensure the player has proper coordinates and waypoint permissions

### Debug Mode
The app includes development mode for testing. Set `ui_page "http://localhost:3000"` in `fxmanifest.lua` and run `npm run dev` in the `ui` folder.

## Support

For support and questions, please refer to the FiveM community forums or create an issue in the repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

- Built for LB Phone Template
- Integrated with QB Core Framework
- React TypeScript frontend
- FiveM Lua backend
