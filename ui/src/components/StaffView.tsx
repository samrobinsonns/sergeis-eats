import React, { useState } from 'react'
import type { Order } from '../services/mockDataService'

interface StaffViewProps {
    orders: Order[]
    onOrderUpdate: (order: Order) => void
    onBack: () => void
}

const StaffView: React.FC<StaffViewProps> = ({ orders, onOrderUpdate, onBack }) => {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#ff9500'
            case 'confirmed': return '#007aff'
            case 'preparing': return '#ffcc00'
            case 'ready': return '#34c759'
            case 'delivering': return '#5856d6'
            case 'delivered': return '#34c759'
            case 'cancelled': return '#ff3b30'
            default: return '#8e8e93'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Pending'
            case 'confirmed': return 'Confirmed'
            case 'preparing': return 'Preparing'
            case 'ready': return 'Ready for Pickup'
            case 'delivering': return 'Out for Delivery'
            case 'delivered': return 'Delivered'
            case 'cancelled': return 'Cancelled'
            default: return status
        }
    }

    const handleStatusUpdate = (order: Order, newStatus: string) => {
        const updatedOrder = { ...order, status: newStatus as any }
        onOrderUpdate(updatedOrder)
        setSelectedOrder(updatedOrder)
    }

    const canUpdateStatus = (order: Order, newStatus: string) => {
        const statusFlow = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['preparing', 'cancelled'],
            'preparing': ['ready', 'cancelled'],
            'ready': ['delivering'],
            'delivering': ['delivered'],
            'delivered': [],
            'cancelled': []
        }
        
        return statusFlow[order.status as keyof typeof statusFlow]?.includes(newStatus) || false
    }

    const getAvailableStatuses = (order: Order) => {
        const statusFlow = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['preparing', 'cancelled'],
            'preparing': ['ready', 'cancelled'],
            'ready': ['delivering'],
            'delivering': ['delivered'],
            'delivered': [],
            'cancelled': []
        }
        
        return statusFlow[order.status as keyof typeof statusFlow] || []
    }

    if (selectedOrder) {
        return (
            <div className="staff-order-detail">
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
                        <h3>Customer Information</h3>
                        <p><strong>Customer ID:</strong> {selectedOrder.user_id}</p>
                        <p><strong>Order Type:</strong> {selectedOrder.order_type}</p>
                        <p><strong>Payment Method:</strong> {selectedOrder.payment_method}</p>
                        <p><strong>Payment Status:</strong> {selectedOrder.payment_status}</p>
                    </div>

                    <div className="info-section">
                        <h3>Order Details</h3>
                        <p><strong>Subtotal:</strong> ${(selectedOrder.subtotal || 0).toFixed(2)}</p>
                        <p><strong>Delivery Fee:</strong> ${(selectedOrder.delivery_fee || 0).toFixed(2)}</p>
                        <p><strong>Tax:</strong> ${(selectedOrder.tax_amount || 0).toFixed(2)}</p>
                        <p><strong>Total:</strong> ${(selectedOrder.total_amount || 0).toFixed(2)}</p>
                    </div>

                    {selectedOrder.delivery_address && (
                        <div className="info-section">
                            <h3>Delivery Address</h3>
                            <p>{selectedOrder.delivery_address}</p>
                            <p>Coordinates: {selectedOrder.delivery_x}, {selectedOrder.delivery_y}, {selectedOrder.delivery_z}</p>
                        </div>
                    )}

                    <div className="info-section">
                        <h3>Timestamps</h3>
                        <p><strong>Created:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                        <p><strong>Updated:</strong> {new Date(selectedOrder.updated_at).toLocaleString()}</p>
                        {selectedOrder.estimated_delivery_time && (
                            <p><strong>Estimated Delivery:</strong> {new Date(selectedOrder.estimated_delivery_time).toLocaleString()}</p>
                        )}
                    </div>
                </div>

                <div className="order-actions">
                    <h3>Update Order Status</h3>
                    <div className="status-buttons">
                        {getAvailableStatuses(selectedOrder).map(status => (
                            <button
                                key={status}
                                className={`status-update-btn ${status === 'cancelled' ? 'danger' : ''}`}
                                onClick={() => handleStatusUpdate(selectedOrder, status)}
                            >
                                {getStatusText(status)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="staff-view">
            <div className="staff-header">
                <button className="back-button" onClick={onBack}>
                    ← Back to Restaurants
                </button>
                <h2>Staff View - Order Management</h2>
                <p className="subtitle">Manage incoming orders for your restaurant</p>
            </div>

            {orders.length === 0 ? (
                <div className="no-orders">
                    <div className="no-orders-icon">📋</div>
                    <h3>No Orders</h3>
                    <p>There are no orders to manage at the moment.</p>
                    <p>Orders will appear here when customers place them.</p>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.id} className="order-card" onClick={() => setSelectedOrder(order)}>
                            <div className="order-header">
                                <div className="order-number">
                                    <h3>#{order.order_number}</h3>
                                    <span className="order-time">
                                        {new Date(order.created_at).toLocaleTimeString()}
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

                            <div className="order-meta">
                                <span className="payment-method">
                                    💳 {order.payment_method}
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
            )}
        </div>
    )
}

export default StaffView
