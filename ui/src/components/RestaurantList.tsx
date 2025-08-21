import React, { useState, useEffect } from 'react'
import { nuiService } from '../services/nuiService'
import { mockDataService } from '../services/mockDataService'
import type { Restaurant, MenuItem, MenuCategory } from '../services/mockDataService'
import { Config } from '../config'

interface RestaurantListProps {
    onRestaurantClick: (restaurant: Restaurant) => void
    onAddToCart: (item: MenuItem, quantity: number) => void
    playerJob: string
}

const RestaurantList: React.FC<RestaurantListProps> = ({ onRestaurantClick, onAddToCart, playerJob }) => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([])
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [categories, setCategories] = useState<MenuCategory[]>([])
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                
                // Get restaurants (includes mock data in development mode)
                const restaurantData = await nuiService.getRestaurants()
                setRestaurants(restaurantData)

                setLoading(false)
            } catch (error) {
                console.error('Failed to load restaurants:', error)
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const handleRestaurantClick = async (restaurant: Restaurant) => {
        setSelectedRestaurant(restaurant)
        
        try {
            // Get menu items and categories
            const items = await nuiService.getMenuItems(restaurant.id)
            const cats = await nuiService.getCategoriesForRestaurant(restaurant.id)
            
            setMenuItems(items)
            setCategories(cats)
            setSelectedCategory(cats[0]?.id || null)
        } catch (error) {
            console.error('Failed to load menu:', error)
        }
    }

    const handleBackToRestaurants = () => {
        setSelectedRestaurant(null)
        setMenuItems([])
        setCategories([])
        setSelectedCategory(null)
    }

    const filteredMenuItems = selectedCategory 
        ? menuItems.filter(item => item.category_id === selectedCategory)
        : menuItems

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading restaurants...</p>
            </div>
        )
    }

    if (selectedRestaurant) {
        return (
            <div className="restaurant-menu">
                <div className="restaurant-header">
                    <button className="back-button" onClick={handleBackToRestaurants}>
                        ← Back to Restaurants
                    </button>
                    <h2>{selectedRestaurant.name}</h2>
                    <p className="restaurant-description">{selectedRestaurant.description}</p>
                    <div className="restaurant-info">
                        <span className="cuisine-type">{selectedRestaurant.cuisine_type}</span>
                        <span className="rating">⭐ {selectedRestaurant.rating}</span>
                        <span className="delivery-fee">Delivery: ${selectedRestaurant.delivery_fee}</span>
                    </div>
                </div>

                {/* Category Navigation */}
                <div className="category-nav">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category.id)}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {/* Menu Items */}
                <div className="menu-items">
                    {filteredMenuItems.map(item => (
                        <div key={item.id} className="menu-item">
                            <div className="item-image">
                                <div className="placeholder-image">
                                    <svg className="placeholder-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="item-details">
                                <h3 className="item-name">{item.name}</h3>
                                <p className="item-description">{item.description}</p>
                                <div className="item-meta">
                                    <span className="item-price">${item.price.toFixed(2)}</span>
                                    {item.original_price && item.original_price > item.price && (
                                        <span className="original-price">${item.original_price.toFixed(2)}</span>
                                    )}
                                    <span className="prep-time">⏱️ {item.preparation_time}min</span>
                                </div>
                                {item.allergens.length > 0 && (
                                    <div className="allergens">
                                        <small>Contains: {item.allergens.join(', ')}</small>
                                    </div>
                                )}
                                <div className="item-actions">
                                    <button 
                                        className="add-to-cart-btn"
                                        onClick={() => onAddToCart(item, 1)}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Staff View Button */}
                {playerJob === selectedRestaurant.job_name && (
                    <div className="staff-section">
                        <button 
                            className="staff-view-btn"
                            onClick={() => onRestaurantClick(selectedRestaurant)}
                        >
                            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Staff View - Manage Orders
                        </button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="restaurant-list">
            <h2>Available Restaurants</h2>
            <p className="subtitle">Order food from your favorite restaurants</p>

            
            <div className="restaurants-grid">
                {restaurants.map(restaurant => (
                    <div key={restaurant.id} className="restaurant-card">
                        <div className="restaurant-header">
                            <h3 className="restaurant-name">{restaurant.name}</h3>
                            {playerJob === restaurant.job_name && (
                                <span className="staff-badge">
                                    <svg className="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Staff
                                </span>
                            )}
                        </div>
                        
                        <p className="restaurant-description">{restaurant.description}</p>
                        
                        <div className="restaurant-details">
                            <div className="detail-row">
                                <span className="cuisine-type">
                                    <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18z" />
                                    </svg>
                                    {restaurant.cuisine_type}
                                </span>
                                <span className="rating">
                                    <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    {restaurant.rating}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="delivery-fee">
                                    <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    ${restaurant.delivery_fee}
                                </span>
                                <span className="min-order">
                                    <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                    Min: ${restaurant.min_order_amount}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="orders">
                                    <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    {restaurant.total_orders} orders
                                </span>
                                <span className="radius">
                                    <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {restaurant.delivery_radius}m radius
                                </span>
                            </div>
                        </div>

                        <div className="restaurant-actions">
                            {playerJob === restaurant.job_name ? (
                                <button 
                                    className="staff-btn"
                                    onClick={() => onRestaurantClick(restaurant)}
                                >
                                    Staff View
                                </button>
                            ) : (
                                <button 
                                    className="view-menu-btn"
                                    onClick={() => handleRestaurantClick(restaurant)}
                                >
                                    View Menu
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {restaurants.length === 0 && (
                <div className="no-restaurants">
                    <p>No restaurants available at the moment.</p>
                    <p>Check back later or contact support.</p>
                </div>
            )}
        </div>
    )
}

export default RestaurantList
