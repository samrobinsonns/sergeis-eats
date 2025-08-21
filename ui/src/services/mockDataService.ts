import { Config } from '../config'

/*
 * MOCK DATA TESTING GUIDE:
 * 
 * To test different views, change the job in getMockPlayerJob():
 * 
 * - 'uwu' - Staff view for Uwu Cafe (see all uwu-cafe orders)
 * - 'burgershot' - Staff view for Burger Shot (see all burger-shot orders)  
 * - 'pizzathis' - Staff view for Pizza This (see all pizzathis orders)
 * - 'delivery' - Driver view (see all 'ready' orders)
 * - 'unemployed' - Customer view (see only your own orders)
 * 
 * Current setting: 'uwu' (Uwu Cafe Staff View)
 */

// Types matching the database schema
export interface Restaurant {
    id: string
    name: string
    description: string
    job_name: string
    owner_id: string
    phone: string
    email: string
    address: string
    location_x: number
    location_y: number
    location_z: number
    pickup_x: number
    pickup_y: number
    pickup_z: number
    is_active: boolean
    delivery_radius: number
    min_order_amount: number
    delivery_fee: number
    tax_rate: number
    opening_hours: Record<string, { open: string; close: string }>
    cuisine_type: string
    rating: number
    total_orders: number
    created_at: string
    updated_at: string
}

export interface MenuCategory {
    id: number
    restaurant_id: string
    name: string
    description: string
    sort_order: number
    is_active: boolean
}

export interface MenuItem {
    id: string
    restaurant_id: string
    category_id: number
    name: string
    description: string
    price: number
    original_price: number | null
    image_url: string | null
    is_available: boolean
    is_featured: boolean
    allergens: string[]
    nutrition_info: {
        calories: number
        protein: number
        carbs: number
        fat: number
    }
    preparation_time: number
    sort_order: number
}

export interface Discount {
    id: number
    code: string
    name: string
    description: string
    type: 'percentage' | 'fixed_amount' | 'free_delivery'
    value: number
    min_order_amount: number
    max_discount_amount: number | null
    usage_limit: number | null
    used_count: number
    is_active: boolean
    valid_from: string
    valid_until: string
}

export interface UserProfile {
    id: string
    citizen_id: string
    first_name: string
    last_name: string
    phone: string | null
    email: string | null
    default_address: string | null
    preferences: Record<string, any>
    total_orders: number
    total_spent: number
    loyalty_points: number
    is_verified: boolean
    created_at: string
    updated_at: string
}

export interface Order {
    id: string
    order_number: string
    user_id: string
    restaurant_id: string
    driver_id: string | null
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivering' | 'delivered' | 'cancelled' | 'refunded'
    order_type: 'delivery' | 'pickup'
    subtotal: number
    delivery_fee: number
    tax_amount: number
    discount_amount: number
    total_amount: number
    payment_method: 'cash' | 'card' | 'bank'
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
    delivery_address: string | null
    delivery_x: number | null
    delivery_y: number | null
    delivery_z: number | null
    pickup_x: number | null
    pickup_y: number | null
    pickup_z: number | null
    estimated_delivery_time: string | null
    actual_delivery_time: string | null
    special_instructions: string | null
    cancellation_reason: string | null
    created_at: string
    updated_at: string
}

export interface OrderItem {
    id: number
    order_id: string
    item_id: string
    item_name: string
    quantity: number
    unit_price: number
    total_price: number
    customizations: Record<string, any> | null
    special_instructions: string | null
}

export interface Driver {
    id: string
    citizen_id: string
    first_name: string
    last_name: string
    phone: string | null
    vehicle_model: string | null
    vehicle_plate: string | null
    is_available: boolean
    is_online: boolean
    current_location_x: number | null
    current_location_y: number | null
    current_location_z: number | null
    rating: number
    total_deliveries: number
    total_earnings: number
    last_active: string | null
    created_at: string
    updated_at: string
}

// Mock data service class
export class MockDataService {
    private static instance: MockDataService
    private mockOrders: Order[] = []
    private mockUserProfile: UserProfile | null = null
    private mockDrivers: Driver[] = []
    private orderCounter = 1

    private constructor() {
        this.initializeMockData()
    }

    public static getInstance(): MockDataService {
        if (!MockDataService.instance) {
            MockDataService.instance = new MockDataService()
        }
        return MockDataService.instance
    }

    private initializeMockData() {
        // Create mock user profile
        this.mockUserProfile = {
            id: "USER001",
            citizen_id: "CITIZEN001",
            first_name: "John",
            last_name: "Doe",
            phone: "+1-555-0123",
            email: "john.doe@email.com",
            default_address: "123 Main Street, Los Santos",
            preferences: { notifications: true, dark_mode: false },
            total_orders: 15,
            total_spent: 245.50,
            loyalty_points: 125,
            is_verified: true,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z"
        }

        // Create mock drivers
        this.mockDrivers = [
            {
                id: "DRIVER001",
                citizen_id: "CITIZEN002",
                first_name: "Mike",
                last_name: "Johnson",
                phone: "+1-555-0456",
                vehicle_model: "Faggio",
                vehicle_plate: "DELIVERY",
                is_available: true,
                is_online: true,
                current_location_x: 100.0,
                current_location_y: -1000.0,
                current_location_z: 30.0,
                rating: 4.8,
                total_deliveries: 156,
                total_earnings: 3890.00,
                last_active: new Date().toISOString(),
                created_at: "2024-01-01T00:00:00Z",
                updated_at: "2024-01-01T00:00:00Z"
            },
            {
                id: "DRIVER002",
                citizen_id: "CITIZEN003",
                first_name: "Sarah",
                last_name: "Wilson",
                phone: "+1-555-0789",
                vehicle_model: "Sanchez",
                vehicle_plate: "FAST",
                is_available: true,
                is_online: false,
                current_location_x: 200.0,
                current_location_y: -1100.0,
                current_location_z: 30.0,
                rating: 4.6,
                total_deliveries: 89,
                total_earnings: 2225.00,
                last_active: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                created_at: "2024-01-01T00:00:00Z",
                updated_at: "2024-01-01T00:00:00Z"
            }
        ]

        // Create some mock orders
        this.createMockOrders()
    }

    private createMockOrders() {
        const mockOrderItems: OrderItem[] = [
            {
                id: 1,
                order_id: "ORDER001",
                item_id: "uwu-coffee",
                item_name: "Uwu Coffee",
                quantity: 2,
                unit_price: 5.00,
                total_price: 10.00,
                customizations: null,
                special_instructions: "Extra hot please"
            },
            {
                id: 2,
                order_id: "ORDER001",
                item_id: "uwu-croissant",
                item_name: "Uwu Croissant",
                quantity: 1,
                unit_price: 3.00,
                total_price: 3.00,
                customizations: null,
                special_instructions: null
            }
        ]

        this.mockOrders = [
            {
                id: "ORDER001",
                order_number: "SE-2024-001",
                user_id: "USER001",
                restaurant_id: "uwu-cafe",
                driver_id: "DRIVER001",
                status: "delivered",
                order_type: "delivery",
                subtotal: 13.00,
                delivery_fee: 3.00,
                tax_amount: 1.04,
                discount_amount: 0.00,
                total_amount: 17.04,
                payment_method: "cash",
                payment_status: "paid",
                delivery_address: "123 Main Street, Los Santos",
                delivery_x: 125.0,
                delivery_y: -1040.0,
                delivery_z: 29.0,
                pickup_x: 300.0,
                pickup_y: -1200.0,
                pickup_z: 29.0,
                estimated_delivery_time: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
                actual_delivery_time: new Date(Date.now() - 1700000).toISOString(), // 28 min ago
                special_instructions: "Please ring doorbell twice",
                cancellation_reason: null,
                created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                updated_at: new Date(Date.now() - 1700000).toISOString()
            },
            {
                id: "ORDER002",
                order_number: "SE-2024-002",
                user_id: "USER002",
                restaurant_id: "uwu-cafe",
                driver_id: null,
                status: "pending",
                order_type: "delivery",
                subtotal: 22.00,
                delivery_fee: 3.00,
                tax_amount: 1.76,
                discount_amount: 0.00,
                total_amount: 26.76,
                payment_method: "card",
                payment_status: "paid",
                delivery_address: "456 Oak Avenue, Los Santos",
                delivery_x: 150.0,
                delivery_y: -1050.0,
                delivery_z: 29.0,
                pickup_x: 300.0,
                pickup_y: -1200.0,
                pickup_z: 29.0,
                estimated_delivery_time: new Date(Date.now() + 1800000).toISOString(), // 30 min from now
                actual_delivery_time: null,
                special_instructions: "Extra hot coffee please",
                cancellation_reason: null,
                created_at: new Date(Date.now() - 300000).toISOString(), // 5 min ago
                updated_at: new Date(Date.now() - 300000).toISOString()
            },
            {
                id: "ORDER003",
                order_number: "SE-2024-003",
                user_id: "USER003",
                restaurant_id: "uwu-cafe",
                driver_id: null,
                status: "preparing",
                order_type: "delivery",
                subtotal: 16.00,
                delivery_fee: 3.00,
                tax_amount: 1.28,
                discount_amount: 0.00,
                total_amount: 20.28,
                payment_method: "cash",
                payment_status: "paid",
                delivery_address: "789 Pine Street, Los Santos",
                delivery_x: 180.0,
                delivery_y: -1060.0,
                delivery_z: 29.0,
                pickup_x: 300.0,
                pickup_y: -1200.0,
                pickup_z: 29.0,
                estimated_delivery_time: new Date(Date.now() + 1200000).toISOString(), // 20 min from now
                actual_delivery_time: null,
                special_instructions: "No onions on sandwich",
                cancellation_reason: null,
                created_at: new Date(Date.now() - 600000).toISOString(), // 10 min ago
                updated_at: new Date(Date.now() - 120000).toISOString() // 2 min ago
            },
            {
                id: "ORDER004",
                order_number: "SE-2024-004",
                user_id: "USER004",
                restaurant_id: "uwu-cafe",
                driver_id: null,
                status: "ready",
                order_type: "delivery",
                subtotal: 28.00,
                delivery_fee: 3.00,
                tax_amount: 2.24,
                discount_amount: 0.00,
                total_amount: 33.24,
                payment_method: "card",
                payment_status: "paid",
                delivery_address: "321 Elm Road, Los Santos",
                delivery_x: 200.0,
                delivery_y: -1070.0,
                delivery_z: 29.0,
                estimated_delivery_time: new Date(Date.now() + 900000).toISOString(), // 15 min from now
                actual_delivery_time: null,
                special_instructions: null,
                cancellation_reason: null,
                created_at: new Date(Date.now() - 900000).toISOString(), // 15 min ago
                updated_at: new Date(Date.now() - 60000).toISOString() // 1 min ago
            },
            {
                id: "ORDER005",
                order_number: "SE-2024-005",
                user_id: "USER005",
                restaurant_id: "burger-shot",
                driver_id: null,
                status: "ready",
                order_type: "delivery",
                subtotal: 18.00,
                delivery_fee: 5.00,
                tax_amount: 1.44,
                discount_amount: 0.00,
                total_amount: 24.44,
                payment_method: "card",
                payment_status: "paid",
                delivery_address: "123 Main Street, Los Santos",
                delivery_x: 125.0,
                delivery_y: -1040.0,
                delivery_z: 29.0,
                estimated_delivery_time: new Date(Date.now() + 1800000).toISOString(), // 30 min from now
                actual_delivery_time: null,
                special_instructions: null,
                cancellation_reason: null,
                created_at: new Date(Date.now() - 900000).toISOString(), // 15 min ago
                updated_at: new Date(Date.now() - 300000).toISOString() // 5 min ago
            },
            {
                id: "ORDER006",
                order_number: "SE-2024-006",
                user_id: "USER006",
                restaurant_id: "uwu-cafe",
                driver_id: null,
                status: "pending",
                order_type: "delivery",
                subtotal: 35.00,
                delivery_fee: 3.00,
                tax_amount: 2.80,
                discount_amount: 5.00,
                total_amount: 35.80,
                payment_method: "cash",
                payment_status: "paid",
                delivery_address: "555 Sunset Boulevard, Los Santos",
                delivery_x: 300.0,
                delivery_y: -1200.0,
                delivery_z: 29.0,
                estimated_delivery_time: new Date(Date.now() + 2400000).toISOString(), // 40 min from now
                actual_delivery_time: null,
                special_instructions: "Please call when arriving - apartment building with buzzer",
                cancellation_reason: null,
                created_at: new Date(Date.now() - 180000).toISOString(), // 3 min ago
                updated_at: new Date(Date.now() - 180000).toISOString() // 3 min ago
            }
        ]
    }

    // Simulate NUI callbacks
    public async simulateNUICallback(eventName: string, data: any): Promise<any> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))

        switch (eventName) {
            case 'getPlayerJob':
                return this.getMockPlayerJob()
            
            case 'getRestaurants':
                return this.getMockRestaurants()
            
            case 'getPlayerOrders':
                return this.getMockPlayerOrders()
            
            case 'placeOrder':
                return this.simulatePlaceOrder(data)
            
            case 'updateOrder':
                return this.simulateUpdateOrder(data)
            
            case 'acceptDelivery':
                return this.simulateAcceptDelivery(data)
            
            case 'completeDelivery':
                return this.simulateCompleteDelivery(data)
            
            default:
                console.warn(`Unknown NUI event: ${eventName}`)
                return null
        }
    }

    public getMockPlayerJob(): string {
        // For testing staff view, always return 'uwu' job
        // Change this to test different restaurant staff views
        return 'uwu' // Options: 'uwu', 'burgershot', 'pizzathis', 'delivery', 'unemployed'
    }

    public getMockRestaurants(): Restaurant[] {
        return Config.MockData.restaurants.filter(r => r.is_active)
    }

    public getMockPlayerOrders(): Order[] {
        return this.mockOrders.filter(order => order.user_id === "USER001")
    }

    private simulatePlaceOrder(orderData: any): boolean {
        const newOrder: Order = {
            id: `ORDER${String(this.orderCounter++).padStart(3, '0')}`,
            order_number: `SE-2024-${String(this.orderCounter).padStart(3, '0')}`,
            user_id: "USER001",
            restaurant_id: orderData.restaurantId,
            driver_id: null,
            status: "pending",
            order_type: "delivery",
            subtotal: orderData.subtotal || 0,
            delivery_fee: orderData.delivery_fee || 0,
            tax_amount: orderData.tax_amount || 0,
            discount_amount: 0,
            total_amount: orderData.total || 0,
            payment_method: "cash",
            payment_status: "pending",
            delivery_address: "123 Main Street, Los Santos",
            delivery_x: 125.0,
            delivery_y: -1040.0,
            delivery_z: 29.0,
            estimated_delivery_time: new Date(Date.now() + 1800000).toISOString(),
            actual_delivery_time: null,
            special_instructions: null,
            cancellation_reason: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        this.mockOrders.unshift(newOrder)
        return true
    }

    private simulateUpdateOrder(orderData: any): boolean {
        const orderIndex = this.mockOrders.findIndex(o => o.id === orderData.id)
        if (orderIndex !== -1) {
            this.mockOrders[orderIndex] = { ...this.mockOrders[orderIndex], ...orderData }
            return true
        }
        return false
    }

    private simulateAcceptDelivery(orderId: string): boolean {
        const orderIndex = this.mockOrders.findIndex(o => o.id === orderId)
        if (orderIndex !== -1) {
            this.mockOrders[orderIndex].driver_id = "DRIVER001"
            this.mockOrders[orderIndex].status = "delivering"
            this.mockOrders[orderIndex].updated_at = new Date().toISOString()
            return true
        }
        return false
    }

    private simulateCompleteDelivery(orderId: string): boolean {
        const orderIndex = this.mockOrders.findIndex(o => o.id === orderId)
        if (orderIndex !== -1) {
            this.mockOrders[orderIndex].status = "delivered"
            this.mockOrders[orderIndex].actual_delivery_time = new Date().toISOString()
            this.mockOrders[orderIndex].updated_at = new Date().toISOString()
            return true
        }
        return false
    }

    // Get menu items for a restaurant
    public getMenuItemsForRestaurant(restaurantId: string): MenuItem[] {
        return Config.MockData.menu_items.filter(item => 
            item.restaurant_id === restaurantId && item.is_available
        )
    }

    // Get categories for a restaurant
    public getCategoriesForRestaurant(restaurantId: string): MenuCategory[] {
        return Config.MockData.menu_categories.filter(category => 
            category.restaurant_id === restaurantId && category.is_active
        )
    }

    // Get available discounts
    public getAvailableDiscounts(): Discount[] {
        const now = new Date()
        return Config.MockData.discounts.filter(discount => 
            discount.is_active &&
            new Date(discount.valid_from) <= now &&
            new Date(discount.valid_until) >= now
        )
    }

    // Calculate order total with discounts
    public calculateOrderTotal(subtotal: number, deliveryFee: number, discountCode?: string): {
        subtotal: number
        delivery_fee: number
        discount_amount: number
        tax_amount: number
        total_amount: number
    } {
        let discountAmount = 0
        let finalDeliveryFee = deliveryFee

        if (discountCode) {
            const discount = Config.MockData.discounts.find(d => 
                d.code === discountCode && d.is_active
            )

            if (discount && subtotal >= discount.min_order_amount) {
                switch (discount.type) {
                    case 'percentage':
                        discountAmount = Math.min(
                            subtotal * (discount.value / 100),
                            discount.max_discount_amount || Infinity
                        )
                        break
                    case 'fixed_amount':
                        discountAmount = Math.min(
                            discount.value,
                            discount.max_discount_amount || discount.value
                        )
                        break
                    case 'free_delivery':
                        finalDeliveryFee = 0
                        break
                }
            }
        }

        const taxAmount = (subtotal - discountAmount) * Config.TaxRate
        const totalAmount = subtotal - discountAmount + finalDeliveryFee + taxAmount

        return {
            subtotal,
            delivery_fee: finalDeliveryFee,
            discount_amount: discountAmount,
            tax_amount: taxAmount,
            total_amount: totalAmount
        }
    }

    // Simulate real-time updates
    public startRealTimeUpdates(callback: (event: string, data: any) => void): () => void {
        const interval = setInterval(() => {
            // Simulate order status updates
            const pendingOrders = this.mockOrders.filter(o => 
                ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
            )

            if (pendingOrders.length > 0) {
                const randomOrder = pendingOrders[Math.floor(Math.random() * pendingOrders.length)]
                const statuses = ['confirmed', 'preparing', 'ready']
                const newStatus = statuses[Math.floor(Math.random() * statuses.length)]
                
                if (newStatus !== randomOrder.status) {
                    randomOrder.status = newStatus as any
                    randomOrder.updated_at = new Date().toISOString()
                    
                    callback('orderUpdate', randomOrder)
                }
            }
        }, 10000) // Update every 10 seconds

        return () => clearInterval(interval)
    }
}

// Export singleton instance
export const mockDataService = MockDataService.getInstance()
