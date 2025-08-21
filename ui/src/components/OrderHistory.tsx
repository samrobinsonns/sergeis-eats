import React, { useState } from 'react'
import type { Order } from '../services/mockDataService'

interface OrderHistoryProps {
    orders: Order[]
    onBack: () => void
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onBack }) => {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#ff9500'
            case 'confirmed': return '#007aff'
            case 'preparing': return '#ffcc00'
            case 'ready': return '#34c759'
            case 'picked_up': return '#5856d6'
            case 'delivering': return '#007aff'
            case 'delivered': return '#34c759'
            case 'cancelled': return '#ff3b30'
            case 'refunded': return '#ff3b30'
            default: return '#8e8e93'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Pending'
            case 'confirmed': return 'Confirmed'
            case 'preparing': return 'Preparing'
            case 'ready': return 'Ready for Pickup'
            case 'picked_up': return 'Picked Up'
            case 'delivering': return 'Out for Delivery'
            case 'delivered': return 'Delivered'
            case 'cancelled': return 'Cancelled'
            case 'refunded': return 'Refunded'
            default: return status
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return '⏳'
            case 'confirmed': return '✅'
            case 'preparing': return '👨‍🍳'
            case 'ready': return '📦'
            case 'picked_up': return '🚚'
            case 'delivering': return '🚗'
            case 'delivered': return '🎉'
            case 'cancelled': return '❌'
            case 'refunded': return '💸'
            default: return '❓'
        }
    }

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString()
    }

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString()
    }

    const isActiveOrder = (order: Order) => {
        return ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivering'].includes(order.status)
    }

    const activeOrders = orders.filter(isActiveOrder)
    const recentCompletedOrders = orders
        .filter(order => !isActiveOrder(order))
        .slice(0, 3) // Only show last 3 completed orders

    if (selectedOrder) {
        return (
            <div className="order-detail-view">
                <div className="order-detail-header">
                    <button className="back-button" onClick={() => setSelectedOrder(null)}>
                        ← Back to Orders
                    </button>
                    <h2>Order #{selectedOrder.order_number}</h2>
                    <div className="order-status">
                        <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                        >
                            {getStatusIcon(selectedOrder.status)} {getStatusText(selectedOrder.status)}
                        </span>
                    </div>
                </div>

                <div className="order-detail-content">
                    <div className="info-section">
                        <h3>Order Details</h3>
                        <p><strong>Restaurant:</strong> {selectedOrder.restaurant_id}</p>
                        <p><strong>Order Type:</strong> {selectedOrder.order_type === 'delivery' ? 'Delivery' : 'Pickup'}</p>
                        <p><strong>Order Date:</strong> {formatDate(selectedOrder.created_at)} at {formatTime(selectedOrder.created_at)}</p>
                        <p><strong>Payment Status:</strong> {selectedOrder.payment_status}</p>
                    </div>

                    <div className="info-section">
                        <h3>Order Summary</h3>
                        <p><strong>Subtotal:</strong> ${(selectedOrder.subtotal || 0).toFixed(2)}</p>
                        <p><strong>Delivery Fee:</strong> ${(selectedOrder.delivery_fee || 0).toFixed(2)}</p>
                        <p><strong>Tax:</strong> ${(selectedOrder.tax_amount || 0).toFixed(2)}</p>
                        <p><strong>Total:</strong> ${(selectedOrder.total_amount || 0).toFixed(2)}</p>
                    </div>

                    {selectedOrder.delivery_address && (
                        <div className="info-section">
                            <h3>Delivery Address</h3>
                            <p>{selectedOrder.delivery_address}</p>
                        </div>
                    )}

                    {selectedOrder.estimated_delivery_time && (
                        <div className="info-section">
                            <h3>Estimated Delivery</h3>
                            <p>{formatDate(selectedOrder.estimated_delivery_time)} at {formatTime(selectedOrder.estimated_delivery_time)}</p>
                        </div>
                    )}

                    {selectedOrder.actual_delivery_time && (
                        <div className="info-section">
                            <h3>Actual Delivery</h3>
                            <p>{formatDate(selectedOrder.actual_delivery_time)} at {formatTime(selectedOrder.actual_delivery_time)}</p>
                        </div>
                    )}

                    {selectedOrder.special_instructions && (
                        <div className="info-section">
                            <h3>Special Instructions</h3>
                            <p>{selectedOrder.special_instructions}</p>
                        </div>
                    )}

                    {selectedOrder.cancellation_reason && (
                        <div className="info-section">
                            <h3>Cancellation Reason</h3>
                            <p>{selectedOrder.cancellation_reason}</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="order-history">
            <div className="order-history-header">
                <button className="back-button" onClick={onBack}>
                    ← Back to Restaurants
                </button>
                <h2>📋 My Orders</h2>
                <p className="subtitle">Track your current orders</p>
            </div>

            {/* Active Orders */}
            {activeOrders.length > 0 && (
                <div className="orders-section">
                    <h3>🚚 Active Orders</h3>
                    <div className="orders-list">
                        {activeOrders.map(order => (
                            <div key={order.id} className="order-card active" onClick={() => setSelectedOrder(order)}>
                                <div className="order-header">
                                    <div className="order-number">
                                        <h3>#{order.order_number}</h3>
                                        <span className="order-time">
                                            {formatDate(order.created_at)} at {formatTime(order.created_at)}
                                        </span>
                                    </div>
                                    <span 
                                        className="status-badge"
                                        style={{ backgroundColor: getStatusColor(order.status) }}
                                    >
                                        {getStatusIcon(order.status)} {getStatusText(order.status)}
                                    </span>
                                </div>

                                <div className="order-summary">
                                    <div className="order-amount">
                                        <span className="amount-label">Total:</span>
                                        <span className="amount-value">${(order.total_amount || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="order-type">
                                        <span className="type-badge">
                                            {order.order_type === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
                                        </span>
                                    </div>
                                </div>

                                <div className="order-meta">
                                    <span className="restaurant-id">
                                        🏪 {order.restaurant_id}
                                    </span>
                                    <span className="payment-status">
                                        {order.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                                    </span>
                                </div>

                                {order.delivery_address && (
                                    <div className="delivery-info">
                                        <p className="delivery-address">
                                            📍 {order.delivery_address}
                                        </p>
                                    </div>
                                )}

                                <div className="order-actions-preview">
                                    <button className="view-details-btn">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Completed Orders */}
            {recentCompletedOrders.length > 0 && (
                <div className="orders-section">
                    <h3>✅ Recent Orders</h3>
                    <div className="orders-list">
                        {recentCompletedOrders.map(order => (
                            <div key={order.id} className="order-card completed" onClick={() => setSelectedOrder(order)}>
                                <div className="order-header">
                                    <div className="order-number">
                                        <h3>#{order.order_number}</h3>
                                        <span className="order-time">
                                            {formatDate(order.created_at)} at {formatTime(order.created_at)}
                                        </span>
                                    </div>
                                    <span 
                                        className="status-badge"
                                        style={{ backgroundColor: getStatusColor(order.status) }}
                                    >
                                        {getStatusIcon(order.status)} {getStatusText(order.status)}
                                    </span>
                                </div>

                                <div className="order-summary">
                                    <div className="order-amount">
                                        <span className="amount-label">Total:</span>
                                        <span className="amount-value">${(order.total_amount || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="order-type">
                                        <span className="type-badge">
                                            {order.order_type === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
                                        </span>
                                    </div>
                                </div>

                                <div className="order-meta">
                                    <span className="restaurant-id">
                                        🏪 {order.restaurant_id}
                                    </span>
                                    <span className="payment-status">
                                        {order.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                                    </span>
                                </div>

                                <div className="order-actions-preview">
                                    <button className="view-details-btn">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Orders */}
            {orders.length === 0 && (
                <div className="no-orders">
                    <div className="no-orders-icon">📋</div>
                    <h3>No Orders Yet</h3>
                    <p>Start ordering food from our restaurants!</p>
                </div>
            )}
        </div>
    )
}

export default OrderHistory
