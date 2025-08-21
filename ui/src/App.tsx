import React, { useEffect, useState, useRef, ReactNode } from 'react'
import TabletFrame from '@/components/TabletFrame'
import PhoneFrame from '@/components/PhoneFrame'
import RestaurantList from '@/components/RestaurantList'
import StaffView from '@/components/StaffView'
import DriverView from '@/components/DriverView'
import Cart from '@/components/Cart'
import OrderHistory from '@/components/OrderHistory'
import { nuiService } from './services/nuiService'
import { mockDataService } from './services/mockDataService'
import { Config } from './config'
import type { Restaurant, MenuItem, Order as DatabaseOrder, UserProfile } from './services/mockDataService'

// Type mapping for component compatibility
interface ComponentOrder {
    id: string
    restaurantId: string
    restaurantName: string
    items: CartItem[]
    total: number
    status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled'
    customerId: string
    customerName: string
    customerLocation: { x: number; y: number; z: number }
    driverId?: string
    driverName?: string
    createdAt: number
}

import './App.css'

const DEV_MODE = !window?.['invokeNative']

interface CartItem {
    item: MenuItem
    quantity: number
}

const App = () => {
    const [currentView, setCurrentView] = useState<'restaurants' | 'staff' | 'driver' | 'cart' | 'orders'>('restaurants')
    const [playerJob, setPlayerJob] = useState<string>('')
    const [restaurants, setRestaurants] = useState<Restaurant[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [orders, setOrders] = useState<ComponentOrder[]>([])
    const [isDriver, setIsDriver] = useState(false)
    const [activeOrder, setActiveOrder] = useState<ComponentOrder | null>(null)

    useEffect(() => {
        if (DEV_MODE) {
            document.documentElement.style.visibility = 'visible'
            document.body.style.visibility = 'visible'
        } else {
            if (!globalThis.GetParentResourceName) {
                document.body.style.visibility = 'visible'
            }
        }

        // Initialize data using NUI service
        const initializeData = async () => {
            try {
                // Get player job
                const job = await nuiService.getPlayerJob()
                setPlayerJob(job)

                // Get restaurants data
                const restaurantData = await nuiService.getRestaurants()
                setRestaurants(restaurantData)

                // Get player orders and transform to component format
                const orderData = await nuiService.getPlayerOrders()
                const transformedOrders = orderData.map(dbOrder => ({
                    id: dbOrder.id,
                    restaurantId: dbOrder.restaurant_id,
                    restaurantName: restaurants.find(r => r.id === dbOrder.restaurant_id)?.name || '',
                    items: [], // Will be populated from order_items table
                    total: dbOrder.total_amount,
                    status: dbOrder.status as ComponentOrder['status'],
                    customerId: dbOrder.user_id,
                    customerName: 'Customer', // Will be populated from user_profiles table
                    customerLocation: {
                        x: dbOrder.delivery_x || 0,
                        y: dbOrder.delivery_y || 0,
                        z: dbOrder.delivery_z || 0
                    },
                    driverId: dbOrder.driver_id || undefined,
                    driverName: 'Driver', // Will be populated from drivers table
                    createdAt: new Date(dbOrder.created_at).getTime()
                }))
                setOrders(transformedOrders)
            } catch (error) {
                console.error('Failed to initialize data:', error)
            }
        }

        initializeData()

        // Listen for order updates
        nuiService.onOrderUpdate((dbOrder) => {
            const transformedOrder: ComponentOrder = {
                id: dbOrder.id,
                restaurantId: dbOrder.restaurant_id,
                restaurantName: restaurants.find(r => r.id === dbOrder.restaurant_id)?.name || '',
                items: [], // Will be populated from order_items table
                total: dbOrder.total_amount,
                status: dbOrder.status as ComponentOrder['status'],
                customerId: dbOrder.user_id,
                customerName: 'Customer', // Will be populated from user_profiles table
                customerLocation: {
                    x: dbOrder.delivery_x || 0,
                    y: dbOrder.delivery_y || 0,
                    z: dbOrder.delivery_z || 0
                },
                driverId: dbOrder.driver_id || undefined,
                driverName: 'Driver', // Will be populated from drivers table
                createdAt: new Date(dbOrder.created_at).getTime()
            }
            
            setOrders(prev => prev.map(o => o.id === transformedOrder.id ? transformedOrder : o))
            if (activeOrder?.id === transformedOrder.id) {
                setActiveOrder(transformedOrder)
            }
        })

        // Listen for new orders (for staff)
        nuiService.onNewOrder((dbOrder) => {
            const transformedOrder: ComponentOrder = {
                id: dbOrder.id,
                restaurantId: dbOrder.restaurant_id,
                restaurantName: restaurants.find(r => r.id === dbOrder.restaurant_id)?.name || '',
                items: [], // Will be populated from order_items table
                total: dbOrder.total_amount,
                status: dbOrder.status as ComponentOrder['status'],
                customerId: dbOrder.user_id,
                customerName: 'Customer', // Will be populated from user_profiles table
                customerLocation: {
                    x: dbOrder.delivery_x || 0,
                    y: dbOrder.delivery_y || 0,
                    z: dbOrder.delivery_z || 0
                },
                driverId: dbOrder.driver_id || undefined,
                driverName: 'Driver', // Will be populated from drivers table
                createdAt: new Date(dbOrder.created_at).getTime()
            }
            
            setOrders(prev => [transformedOrder, ...prev])
        })
    }, [])

    const addToCart = (item: MenuItem, quantity: number = 1) => {
        setCart(prev => {
            const existing = prev.find(cartItem => cartItem.item.id === item.id)
            if (existing) {
                return prev.map(cartItem => 
                    cartItem.item.id === item.id 
                        ? { ...cartItem, quantity: cartItem.quantity + quantity }
                        : cartItem
                )
            } else {
                return [...prev, { item, quantity }]
            }
        })
    }

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(cartItem => cartItem.item.id !== itemId))
    }

    const updateCartQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId)
        } else {
        setCart(prev => prev.map(cartItem => 
            cartItem.item.id === itemId 
                ? { ...cartItem, quantity }
                : cartItem
        ))
    }
    }

    const clearCart = () => {
                setCart([])
    }

    const placeOrder = async () => {
        if (cart.length === 0) return

        try {
            const subtotal = cart.reduce((sum, item) => sum + (item.item.price * item.quantity), 0)
            const restaurantId = cart[0].item.restaurant_id
            
            // Calculate order total using NUI service
            const orderTotal = nuiService.calculateOrderTotal(
                cart.map(item => ({ price: item.item.price, quantity: item.quantity })),
                Config.DeliveryFee
            )

            const orderData = {
                restaurant_id: restaurantId,
                items: cart.map(item => ({
                    item_id: item.item.id,
                    item_name: item.item.name,
                    quantity: item.quantity,
                    unit_price: item.item.price,
                    total_price: item.item.price * item.quantity
                })),
                subtotal: orderTotal.subtotal,
                delivery_fee: orderTotal.delivery_fee,
                tax_amount: orderTotal.tax_amount,
                total_amount: orderTotal.total_amount
            }

            const success = await nuiService.placeOrder(orderData)
            if (success) {
                clearCart()
                setCurrentView('orders')
                nuiService.sendNotification('Order placed successfully!', 'success')
            }
        } catch (error) {
            console.error('Failed to place order:', error)
            nuiService.sendNotification('Failed to place order', 'error')
        }
    }

    const toggleDriverMode = () => {
        setIsDriver(!isDriver)
        if (!isDriver) {
            setCurrentView('driver')
        } else {
            setCurrentView('restaurants')
        }
    }

    const renderContent = () => {
        switch (currentView) {
            case 'restaurants':
                return (
                    <RestaurantList 
                        restaurants={restaurants}
                        onRestaurantClick={(restaurant) => {
                            if (playerJob === restaurant.job_name) {
                                setCurrentView('staff')
                            } else {
                                // Show menu for ordering
                                setCurrentView('restaurants')
                            }
                        }}
                        onAddToCart={addToCart}
                        playerJob={playerJob}
                    />
                )
            case 'staff':
                return (
                    <StaffView 
                        orders={orders.filter(order => 
                            restaurants.find(r => r.job_name === playerJob)?.id === order.restaurantId
                        )}
                        onOrderUpdate={async (order) => {
                            try {
                                await nuiService.updateOrder(order)
                                nuiService.sendNotification('Order updated successfully!', 'success')
                            } catch (error) {
                                console.error('Failed to update order:', error)
                                nuiService.sendNotification('Failed to update order', 'error')
                            }
                        }}
                        onBack={() => setCurrentView('restaurants')}
                    />
                )
            case 'driver':
                return (
                    <DriverView 
                        orders={orders.filter(order => order.status === 'ready')}
                        onAcceptOrder={async (order) => {
                            try {
                                if (order.status === 'ready') {
                                    // First time accepting the delivery
                                    const success = await nuiService.acceptDelivery(order.id)
                                    if (success) {
                                        setActiveOrder(order)
                                        nuiService.sendNotification('Delivery accepted! Set pickup waypoint.', 'success')
                                    }
                                } else if (order.status === 'picked_up') {
                                    // Order was picked up, update to delivering status
                                    const updatedOrder = { ...order, status: 'delivering' }
                                    const success = await nuiService.updateOrder(updatedOrder)
                                    if (success) {
                                        setActiveOrder(updatedOrder)
                                        nuiService.sendNotification('Order status updated! Set delivery waypoint.', 'success')
                                    }
                                }
                            } catch (error) {
                                console.error('Failed to update order:', error)
                                nuiService.sendNotification('Failed to update order', 'error')
                            }
                        }}
                        activeOrder={activeOrder}
                        onCompleteDelivery={async (order) => {
                            try {
                                const success = await nuiService.completeDelivery(order.id)
                                if (success) {
                                    setActiveOrder(null)
                                    nuiService.sendNotification('Delivery completed!', 'success')
            }
        } catch (error) {
            console.error('Failed to complete delivery:', error)
                                nuiService.sendNotification('Failed to complete delivery', 'error')
                            }
                        }}
                        onBack={() => setCurrentView('restaurants')}
                    />
                )
            case 'cart':
                return (
                    <Cart 
                        items={cart}
                        onUpdateQuantity={updateCartQuantity}
                        onRemove={removeFromCart}
                        onPlaceOrder={placeOrder}
                        onBack={() => setCurrentView('restaurants')}
                        deliveryFee={Config.DeliveryFee}
                        taxRate={Config.TaxRate}
                    />
                )
            case 'orders':
                return (
                    <OrderHistory 
                        orders={orders}
                        onBack={() => setCurrentView('restaurants')}
                    />
                )
            default:
                return null
        }
    }

    const renderNavigation = () => (
        <div className="app-navigation">
            <button 
                className={`nav-button ${currentView === 'restaurants' ? 'active' : ''}`}
                onClick={() => setCurrentView('restaurants')}
            >
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Restaurants
            </button>
            <button 
                className={`nav-button ${currentView === 'orders' ? 'active' : ''}`}
                onClick={() => setCurrentView('orders')}
            >
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                My Orders
            </button>
            <button 
                className={`nav-button ${currentView === 'driver' ? 'active' : ''}`}
                onClick={toggleDriverMode}
            >
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                {isDriver ? 'Driver Mode' : 'Be Driver'}
            </button>
        </div>
    )

    return (
        <AppProvider>
            {(device) => (
                <div className='app'>
                    <div
                        className='app-wrapper'
                        style={{
                            height: DEV_MODE ? '100%' : '100vh'
                        }}
                    >
                        <div className='header'>
                            <div className='header-left'>
                                <div className='title'>Sergei Eats</div>
                            <div className='subtitle'>Food Delivery App</div>
                        </div>
                            <div className='header-right'>
                                <button 
                                    className="header-cart-btn"
                                    onClick={() => setCurrentView('cart')}
                                >
                                    <svg className="cart-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    {cart.length > 0 && (
                                        <span className="cart-count">{cart.length}</span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {currentView !== 'staff' && renderNavigation()}
                        
                        <div className='app-content'>
                            {renderContent()}
                        </div>
                    </div>
                </div>
            )}
        </AppProvider>
    )
}

const AppProvider = ({ children }: { children: (device: 'phone' | 'tablet') => ReactNode }) => {
    if (DEV_MODE) {
        const tabletFrameRef = useRef<HTMLDivElement>(null)
        const phoneFrameRef = useRef<HTMLDivElement>(null)

        const handleResize = () => {
            const { innerWidth, innerHeight } = window

            const aspectRatio = innerWidth / innerHeight

            if (aspectRatio < 14 / 9) {
                if (phoneFrameRef.current) {
                    phoneFrameRef.current.style.fontSize = '0.9vw'
                }

                if (tabletFrameRef.current) {
                    tabletFrameRef.current.style.fontSize = '1.16vw'
                }
            } else {
                if (phoneFrameRef.current) {
                    phoneFrameRef.current.style.fontSize = '1.37vh'
                }

                if (tabletFrameRef.current) {
                    tabletFrameRef.current.style.fontSize = '1.78vh'
                }
            }
        }

        useEffect(() => {
            handleResize()

            window.addEventListener('resize', handleResize)

            return () => {
                window.removeEventListener('resize', handleResize)
            }
        }, [])

        handleResize()

        return (
            <div className='dev-wrapper'>
                <TabletFrame ref={tabletFrameRef}>{children('tablet')}</TabletFrame>
                <PhoneFrame ref={phoneFrameRef}>{children('phone')}</PhoneFrame>
            </div>
        )
    } else {
        return <>{children(document.body.getAttribute('data-device') as 'phone' | 'tablet')}</>
    }
}

export default App
