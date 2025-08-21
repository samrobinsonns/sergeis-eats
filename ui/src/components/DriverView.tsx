import React, { useState } from 'react'
import type { Order } from '../services/mockDataService'
import { nuiService } from '../services/nuiService'

interface DriverViewProps {
    orders: Order[]
    onAcceptOrder: (order: Order) => void
    activeOrder: Order | null
    onCompleteDelivery: (order: Order) => void
    onBack: () => void
}

const DriverView: React.FC<DriverViewProps> = ({ 
    orders, 
    onAcceptOrder, 
    activeOrder, 
    onCompleteDelivery, 
    onBack 
}) => {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ready': return '#34c759'
            case 'picked_up': return '#5856d6'
            case 'delivering': return '#007aff'
            case 'delivered': return '#34c759'
            default: return '#8e8e93'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'ready': return 'Ready for Pickup'
            case 'picked_up': return 'Picked Up'
            case 'delivering': return 'Out for Delivery'
            case 'delivered': return 'Delivered'
            default: return status
        }
    }

    const handleAcceptDelivery = (order: Order) => {
        // Accept the delivery - this will assign the driver and update status
        onAcceptOrder(order)
        nuiService.sendNotification('Delivery accepted! Set pickup waypoint.', 'success')
    }

    const handleSetPickupWaypoint = (order: Order) => {
        // Set waypoint to restaurant pickup location
        if (order.pickup_x && order.pickup_y) {
            nuiService.setWaypoint(order.pickup_x, order.pickup_y)
            nuiService.sendNotification('Pickup waypoint set! Head to the restaurant.', 'success')
        } else {
            nuiService.sendNotification('Pickup location not available', 'error')
        }
    }

    const handleSetDeliveryWaypoint = (order: Order) => {
        // Set waypoint to customer delivery location
        if (order.delivery_x && order.delivery_y) {
            nuiService.setWaypoint(order.delivery_x, order.delivery_y)
            nuiService.sendNotification('Delivery waypoint set! Head to the customer.', 'success')
        } else {
            nuiService.sendNotification('Delivery location not available', 'error')
        }
    }

    const handleMarkPickedUp = (order: Order) => {
        // Mark order as picked up - this changes status and enables delivery waypoint
        const updatedOrder = { ...order, status: 'picked_up' as const }
        onAcceptOrder(updatedOrder)
        nuiService.sendNotification('Order picked up! Set delivery waypoint.', 'success')
    }

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString()
    }

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString()
    }

    // Filter orders that are available for drivers (ready status and no driver assigned)
    const availableOrders = orders.filter(order => 
        order.status === 'ready' && 
        !order.driver_id && 
        order.order_type === 'delivery'
    )

    if (activeOrder) {
        return (
            <div className="driver-active-order">
                <div className="active-order-header">
                    <h2>🚚 Active Delivery</h2>
                    <p className="order-number">Order #{activeOrder.order_number}</p>
                    <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(activeOrder.status) }}
                    >
                        {getStatusText(activeOrder.status)}
                    </span>
                </div>

                <div className="active-order-info">
                    <div className="info-section">
                        <h3>Restaurant</h3>
                        <p><strong>Name:</strong> {activeOrder.restaurant_id}</p>
                        <p><strong>Pickup Location:</strong> {activeOrder.pickup_x}, {activeOrder.pickup_y}</p>
                    </div>

                    <div className="info-section">
                        <h3>Order Details</h3>
                        <p><strong>Total Amount:</strong> ${(activeOrder.total_amount || 0).toFixed(2)}</p>
                        <p><strong>Delivery Fee:</strong> ${(activeOrder.delivery_fee || 0).toFixed(2)}</p>
                        <p><strong>Order Type:</strong> {activeOrder.order_type}</p>
                    </div>

                    {activeOrder.delivery_address && (
                        <div className="info-section">
                            <h3>Delivery Address</h3>
                            <p>{activeOrder.delivery_address}</p>
                            <p><strong>Coordinates:</strong> {activeOrder.delivery_x}, {activeOrder.delivery_y}</p>
                        </div>
                    )}

                    <div className="info-section">
                        <h3>Timestamps</h3>
                        <p><strong>Created:</strong> {formatDate(activeOrder.created_at)} at {formatTime(activeOrder.created_at)}</p>
                        <p><strong>Updated:</strong> {formatDate(activeOrder.updated_at)} at {formatTime(activeOrder.updated_at)}</p>
                    </div>
                </div>

                <div className="active-order-actions">
                    <h3>Navigation & Actions</h3>
                    
                    {/* Pickup Phase */}
                    {activeOrder.status === 'ready' && (
                        <div className="action-phase">
                            <h4>📍 Pickup Phase</h4>
                            <button 
                                className="waypoint-btn pickup"
                                onClick={() => handleSetPickupWaypoint(activeOrder)}
                            >
                                Set Pickup Waypoint
                            </button>
                            <button 
                                className="action-btn pickup"
                                onClick={() => handleMarkPickedUp(activeOrder)}
                            >
                                ✅ Mark as Picked Up
                            </button>
                        </div>
                    )}

                    {/* Delivery Phase */}
                    {activeOrder.status === 'picked_up' && (
                        <div className="action-phase">
                            <h4>🏠 Delivery Phase</h4>
                            <button 
                                className="waypoint-btn delivery"
                                onClick={() => handleSetDeliveryWaypoint(activeOrder)}
                            >
                                Set Delivery Waypoint
                            </button>
                            <button 
                                className="action-btn complete"
                                onClick={() => onCompleteDelivery(activeOrder)}
                            >
                                🎉 Complete Delivery
                            </button>
                        </div>
                    )}

                    {/* Delivering Phase */}
                    {activeOrder.status === 'delivering' && (
                        <div className="action-phase">
                            <h4>🚗 En Route</h4>
                            <button 
                                className="waypoint-btn delivery"
                                onClick={() => handleSetDeliveryWaypoint(activeOrder)}
                            >
                                Set Delivery Waypoint
                            </button>
                            <button 
                                className="action-btn complete"
                                onClick={() => onCompleteDelivery(activeOrder)}
                            >
                                🎉 Complete Delivery
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    if (selectedOrder) {
        return (
            <div className="driver-order-detail">
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
                            {getStatusText(selectedOrder.status)}
                        </span>
                    </div>
                </div>

                <div className="order-info">
                    <div className="info-section">
                        <h3>Restaurant</h3>
                        <p><strong>Name:</strong> {selectedOrder.restaurant_id}</p>
                        <p><strong>Pickup Location:</strong> {selectedOrder.pickup_x}, {selectedOrder.pickup_y}</p>
                    </div>

                    <div className="info-section">
                        <h3>Order Details</h3>
                        <p><strong>Subtotal:</strong> ${(selectedOrder.subtotal || 0).toFixed(2)}</p>
                        <p><strong>Delivery Fee:</strong> ${(selectedOrder.delivery_fee || 0).toFixed(2)}</p>
                        <p><strong>Total:</strong> ${(selectedOrder.total_amount || 0).toFixed(2)}</p>
                    </div>

                    {selectedOrder.delivery_address && (
                        <div className="info-section">
                            <h3>Delivery Address</h3>
                            <p>{selectedOrder.delivery_address}</p>
                            <p><strong>Coordinates:</strong> {selectedOrder.delivery_x}, {selectedOrder.delivery_y}</p>
                        </div>
                    )}

                    <div className="info-section">
                        <h3>Timestamps</h3>
                        <p><strong>Created:</strong> {formatDate(selectedOrder.created_at)} at {formatTime(selectedOrder.created_at)}</p>
                        <p><strong>Updated:</strong> {formatDate(selectedOrder.updated_at)} at {formatTime(selectedOrder.updated_at)}</p>
                    </div>
                </div>

                <div className="order-actions">
                    <button 
                        className="accept-order-btn"
                        onClick={() => handleAcceptDelivery(selectedOrder)}
                    >
                        🚚 Accept This Delivery
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="driver-view">
            <div className="driver-header">
                <button className="back-button" onClick={onBack}>
                    ← Back to Restaurants
                </button>
                <h2>🚚 Driver View</h2>
                <p className="subtitle">Accept and manage food deliveries</p>
            </div>

            {activeOrder ? (
                <div className="active-delivery-notice">
                    <p>You have an active delivery. Complete it before accepting new ones.</p>
                </div>
            ) : (
                <>
                    {availableOrders.length === 0 ? (
                        <div className="no-orders">
                            <div className="no-orders-icon">📦</div>
                            <h3>No Orders Available</h3>
                            <p>There are no orders ready for pickup at the moment.</p>
                            <p>Check back later for new delivery opportunities.</p>
                        </div>
                    ) : (
                        <div className="available-orders">
                            <h3>Available Deliveries</h3>
                            <p className="orders-count">{availableOrders.length} order{availableOrders.length !== 1 ? 's' : ''} ready for pickup</p>
                            
                            <div className="orders-list">
                                {availableOrders.map(order => (
                                    <div key={order.id} className="order-card" onClick={() => setSelectedOrder(order)}>
                                        <div className="order-header">
                                            <div className="order-number">
                                                <h4>#{order.order_number}</h4>
                                                <span className="order-time">
                                                    {formatTime(order.created_at)}
                                                </span>
                                            </div>
                                            <span 
                                                className="status-badge"
                                                style={{ backgroundColor: getStatusColor(order.status) }}
                                            >
                                                {getStatusText(order.status)}
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
                </>
            )}
        </div>
    )
}

export default DriverView
