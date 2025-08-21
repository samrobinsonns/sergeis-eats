Config = {}

Config.LBPhone = true
Config.LBTablet = true

Config.Identifier = "sergei-eats"
Config.DefaultApp = true

Config.Name = "Sergei Eats"
Config.Description = "Food delivery app - Order food from your favorite restaurants"
Config.Developer = "Sergei"

Config.Screenshots = {
    Phone = {
        "screenshots/phone/screenshot-dark.webp",
        "screenshots/phone/screenshot-light.webp"
    },
    Tablet = {
        "screenshots/tablet/screenshot-dark.webp",
        "screenshots/tablet/screenshot-light.webp"
    }
}

-- Restaurant and Job Configuration
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
            },
            {
                id = "uwu-croissant",
                name = "Uwu Croissant",
                description = "Fresh baked croissant",
                price = 3.0,
                category = "Pastries"
            },
            {
                id = "uwu-sandwich",
                name = "Uwu Sandwich",
                description = "Delicious sandwich",
                price = 8.0,
                category = "Food"
            }
        }
    },
    ["burger-shot"] = {
        name = "Burger Shot",
        job = "burgershot",
        description = "Fast food burgers and fries",
        location = vector3(-1191.0, -900.0, 14.0),
        pickupLocation = vector3(-1191.0, -900.0, 14.0),
        menu = {
            {
                id = "burger-shot-burger",
                name = "Burger Shot Burger",
                description = "Classic beef burger",
                price = 12.0,
                category = "Food"
            },
            {
                id = "burger-shot-fries",
                name = "Burger Shot Fries",
                description = "Crispy french fries",
                price = 6.0,
                category = "Sides"
            },
            {
                id = "burger-shot-shake",
                name = "Burger Shot Shake",
                description = "Chocolate milkshake",
                price = 4.0,
                category = "Drinks"
            }
        }
    },
    ["pizza-this"] = {
        name = "Pizza This",
        job = "pizzathis",
        description = "Authentic Italian pizza",
        location = vector3(537.0, 100.0, 96.0),
        pickupLocation = vector3(537.0, 100.0, 96.0),
        menu = {
            {
                id = "pizza-this-margherita",
                name = "Margherita Pizza",
                description = "Classic tomato and mozzarella",
                price = 15.0,
                category = "Pizza"
            },
            {
                id = "pizza-this-pepperoni",
                name = "Pepperoni Pizza",
                description = "Spicy pepperoni pizza",
                price = 18.0,
                category = "Pizza"
            },
            {
                id = "pizza-this-garlic-bread",
                name = "Garlic Bread",
                description = "Fresh garlic bread",
                price = 7.0,
                category = "Sides"
            }
        }
    }
}

-- Driver Configuration
Config.DriverJob = "delivery"
Config.DriverPay = 25.0 -- Base pay per delivery
Config.DeliveryRadius = 50.0 -- Distance to consider delivery complete

-- Order Configuration
Config.MaxOrderValue = 1000.0
Config.DeliveryFee = 5.0
Config.TaxRate = 0.08 -- 8% tax
