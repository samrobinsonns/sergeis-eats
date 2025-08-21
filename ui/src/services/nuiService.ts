import { mockDataService, type Restaurant, type MenuItem, type Order, type Discount } from './mockDataService'
import { Config } from '../config'

// FiveM NUI Service - Handles both real and mock data
export class NUIService {
    private static instance: NUIService
    private isFiveM: boolean
    private mockMode: boolean

    private constructor() {
        this.isFiveM = typeof window !== 'undefined' && 'invokeNative' in window
        this.mockMode = Config.MockData.enabled && !this.isFiveM
        
        if (this.mockMode) {
            console.log('[Sergei Eats] Running in mock mode for development')
        } else if (this.isFiveM) {
            console.log('[Sergei Eats] Running in FiveM mode')
        }
    }

    public static getInstance(): NUIService {
        if (!NUIService.instance) {
            NUIService.instance = new NUIService()
        }
        return NUIService.instance
    }

    // Generic NUI callback handler
    private async fetchNUI<T>(eventName: string, data: any = {}): Promise<T> {
        if (this.mockMode) {
            return await mockDataService.simulateNUICallback(eventName, data)
        }

        if (this.isFiveM) {
            return new Promise((resolve, reject) => {
                try {
                    // Use FiveM's fetch API
                    fetch(`https://${GetParentResourceName()}/${eventName}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    })
                    .then(response => response.json())
                    .then(resolve)
                    .catch(reject)
                } catch (error) {
                    console.error(`[Sergei Eats] NUI fetch error:`, error)
                    reject(error)
                }
            })
        }

        throw new Error('Neither FiveM nor mock mode available')
    }

    // Generic NUI event listener
    private onNUIEvent<T>(eventName: string, callback: (data: T) => void): void {
        if (this.mockMode) {
            // In mock mode, we'll simulate events
            return
        }

        if (this.isFiveM) {
            // Listen for FiveM events
            window.addEventListener('message', (event) => {
                if (event.data.type === eventName) {
                    callback(event.data.data)
                }
            })
        }
    }

    // Player job management
    public async getPlayerJob(): Promise<string> {
        if (this.mockMode) {
            return mockDataService.getMockPlayerJob()
        }
        return await this.fetchNUI<string>('getPlayerJob')
    }

    // Restaurant management
    public async getRestaurants(): Promise<Restaurant[]> {
        if (this.mockMode) {
            return mockDataService.getMockRestaurants()
        }
        
        return await this.fetchNUI<Restaurant[]>('getRestaurants')
    }

    public async getRestaurantById(id: string): Promise<Restaurant | null> {
        const restaurants = await this.getRestaurants()
        return restaurants.find(r => r.id === id) || null
    }

    // Menu management
    public async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
        if (this.mockMode) {
            return mockDataService.getMenuItemsForRestaurant(restaurantId)
        }
        
        return await this.fetchNUI<MenuItem[]>('getMenuItems', { restaurantId })
    }

    public async getCategoriesForRestaurant(restaurantId: string): Promise<any[]> {
        if (this.mockMode) {
            return mockDataService.getCategoriesForRestaurant(restaurantId)
        }
        
        return await this.fetchNUI<any[]>('getMenuCategories', { restaurantId })
    }

    // Order management
    public async getPlayerOrders(): Promise<Order[]> {
        if (this.mockMode) {
            return mockDataService.getMockPlayerOrders()
        }
        return await this.fetchNUI<Order[]>('getPlayerOrders')
    }

    public async placeOrder(orderData: any): Promise<boolean> {
        return await this.fetchNUI<boolean>('placeOrder', orderData)
    }

    public async updateOrder(orderData: any): Promise<boolean> {
        return await this.fetchNUI<boolean>('updateOrder', orderData)
    }

    public async cancelOrder(orderId: string, reason?: string): Promise<boolean> {
        return await this.fetchNUI<boolean>('cancelOrder', { orderId, reason })
    }

    // Driver management
    public async acceptDelivery(orderId: string): Promise<boolean> {
        return await this.fetchNUI<boolean>('acceptDelivery', orderId)
    }

    public async completeDelivery(orderId: string): Promise<boolean> {
        return await this.fetchNUI<boolean>('completeDelivery', orderId)
    }

    public async toggleDriverMode(): Promise<boolean> {
        return await this.fetchNUI<boolean>('toggleDriverMode')
    }

    // Discount management
    public async getAvailableDiscounts(): Promise<Discount[]> {
        if (this.mockMode) {
            return mockDataService.getAvailableDiscounts()
        }
        
        return await this.fetchNUI<Discount[]>('getAvailableDiscounts')
    }

    public async validateDiscountCode(code: string, orderAmount: number): Promise<{
        valid: boolean
        discount?: Discount
        error?: string
    }> {
        if (this.mockMode) {
            const discounts = mockDataService.getAvailableDiscounts()
            const discount = discounts.find(d => d.code === code)
            
            if (!discount) {
                return { valid: false, error: 'Invalid discount code' }
            }
            
            if (orderAmount < discount.min_order_amount) {
                return { 
                    valid: false, 
                    error: `Minimum order amount: $${discount.min_order_amount}` 
                }
            }
            
            return { valid: true, discount }
        }
        
        return await this.fetchNUI<{
            valid: boolean
            discount?: Discount
            error?: string
        }>('validateDiscountCode', { code, orderAmount })
    }

    // Real-time updates
    public onOrderUpdate(callback: (order: Order) => void): void {
        this.onNUIEvent<Order>('orderUpdate', callback)
        
        if (this.mockMode) {
            // Start mock real-time updates
            mockDataService.startRealTimeUpdates((event, data) => {
                if (event === 'orderUpdate') {
                    callback(data)
                }
            })
        }
    }

    public onNewOrder(callback: (order: Order) => void): void {
        this.onNUIEvent<Order>('newOrder', callback)
    }

    public onOrdersUpdate(callback: (orders: Order[]) => void): void {
        this.onNUIEvent<Order[]>('updateOrders', callback)
    }

    // Utility functions
    public calculateOrderTotal(
        items: Array<{ price: number; quantity: number }>,
        deliveryFee: number,
        discountCode?: string
    ): {
        subtotal: number
        delivery_fee: number
        discount_amount: number
        tax_amount: number
        total_amount: number
    } {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        
        if (this.mockMode) {
            return mockDataService.calculateOrderTotal(subtotal, deliveryFee, discountCode)
        }
        
        // In FiveM mode, this would be calculated server-side
        const taxAmount = subtotal * Config.TaxRate
        const totalAmount = subtotal + deliveryFee + taxAmount
        
        return {
            subtotal,
            delivery_fee: deliveryFee,
            discount_amount: 0,
            tax_amount: taxAmount,
            total_amount: totalAmount
        }
    }

    // FiveM specific functions
    public sendNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
        if (this.isFiveM) {
            this.fetchNUI('notification', { message, type })
        } else if (this.mockMode) {
            console.log(`[${type.toUpperCase()}] ${message}`)
        }
    }

    public setWaypoint(x: number, y: number): void {
        if (this.isFiveM) {
            this.fetchNUI('setWaypoint', { x, y })
        } else if (this.mockMode) {
            console.log(`[WAYPOINT] Set to coordinates: ${x}, ${y}`)
        }
    }

    public getPlayerLocation(): Promise<{ x: number; y: number; z: number }> {
        if (this.isFiveM) {
            return this.fetchNUI<{ x: number; y: number; z: number }>('getPlayerLocation')
        } else if (this.mockMode) {
            // Return mock location
            return Promise.resolve({ x: 125.0, y: -1040.0, z: 29.0 })
        }
        
        return Promise.reject(new Error('Location not available'))
    }

    // Development helpers
    public isDevelopmentMode(): boolean {
        return this.mockMode
    }

    public isFiveMMode(): boolean {
        return this.isFiveM
    }

    // Mock data access (only available in mock mode)
    public getMockData() {
        if (this.mockMode) {
            return {
                restaurants: mockDataService.getMockRestaurants(),
                menuItems: (restaurantId: string) => mockDataService.getMenuItemsForRestaurant(restaurantId),
                categories: (restaurantId: string) => mockDataService.getCategoriesForRestaurant(restaurantId),
                discounts: mockDataService.getAvailableDiscounts(),
                orders: mockDataService.getMockPlayerOrders()
            }
        }
        
        throw new Error('Mock data only available in development mode')
    }
}

// Export singleton instance
export const nuiService = NUIService.getInstance()

// FiveM utility functions
export const isFiveM = (): boolean => {
    return typeof window !== 'undefined' && 'invokeNative' in window
}

export const getResourceName = (): string => {
    if (isFiveM()) {
        try {
            return (window as any).GetParentResourceName?.() || 'sergei-eats'
        } catch {
            return 'sergei-eats'
        }
    }
    return 'sergei-eats'
}

// Development mode detection
export const isDevelopmentMode = (): boolean => {
    return !isFiveM() || process.env.NODE_ENV === 'development'
}
