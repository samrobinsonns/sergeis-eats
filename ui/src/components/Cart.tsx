import React, { useState } from 'react'
import type { MenuItem } from '../services/mockDataService'
import { nuiService } from '../services/nuiService'
import { Config } from '../config'

interface CartItem {
    item: MenuItem
    quantity: number
}

interface CartProps {
    items: CartItem[]
    onUpdateQuantity: (itemId: string, quantity: number) => void
    onRemoveItem: (itemId: string) => void
    onClearCart: () => void
    onPlaceOrder: () => void
}

const Cart: React.FC<CartProps> = ({ 
    items, 
    onUpdateQuantity, 
    onRemoveItem, 
    onClearCart, 
    onPlaceOrder 
}) => {
    const [discountCode, setDiscountCode] = useState('')
    const [discountApplied, setDiscountApplied] = useState(false)
    const [discountAmount, setDiscountAmount] = useState(0)
    const [discountError, setDiscountError] = useState('')
    const [isApplyingDiscount, setIsApplyingDiscount] = useState(false)

    const subtotal = items.reduce((sum, item) => sum + (item.item.price * item.quantity), 0)
    const deliveryFee = subtotal >= 30 ? 0 : Config.DeliveryFee
    const taxAmount = (subtotal - discountAmount) * Config.TaxRate
    const total = subtotal - discountAmount + deliveryFee + taxAmount

    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        if (newQuantity > 0) {
            onUpdateQuantity(itemId, newQuantity)
        } else {
            onRemoveItem(itemId)
        }
    }

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) return

        setIsApplyingDiscount(true)
        setDiscountError('')

        try {
            const result = await nuiService.validateDiscountCode(discountCode.trim(), subtotal)
            
            if (result.valid && result.discount) {
                setDiscountApplied(true)
                setDiscountAmount(result.discount.value)
                nuiService.sendNotification('Discount applied successfully!', 'success')
            } else {
                setDiscountError(result.error || 'Invalid discount code')
                nuiService.sendNotification('Invalid discount code', 'error')
            }
        } catch (error) {
            setDiscountError('Failed to apply discount')
            nuiService.sendNotification('Failed to apply discount', 'error')
        } finally {
            setIsApplyingDiscount(false)
        }
    }

    const handleRemoveDiscount = () => {
        setDiscountApplied(false)
        setDiscountAmount(0)
        setDiscountCode('')
        setDiscountError('')
    }

    const canPlaceOrder = items.length > 0 && total >= Config.MinOrderAmount && total <= Config.MaxOrderValue

    if (items.length === 0) {
        return (
            <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some delicious food items to get started!</p>
                <p className="cart-tip">Browse restaurants and add items to your cart</p>
            </div>
        )
    }

    return (
        <div className="cart-container">
            <div className="cart-header">
                <h2>🛒 Your Cart</h2>
                <p className="cart-subtitle">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
            </div>

            {/* Cart Items */}
            <div className="cart-items">
                {items.map((cartItem) => (
                    <div key={cartItem.item.id} className="cart-item">
                        <div className="item-image">
                            {cartItem.item.image_url ? (
                                <img src={cartItem.item.image_url} alt={cartItem.item.name} />
                            ) : (
                                <div className="placeholder-image">
                                    <span>🍽️</span>
                                </div>
                            )}
                        </div>

                        <div className="item-details">
                            <h3 className="item-name">{cartItem.item.name}</h3>
                            <p className="item-description">{cartItem.item.description}</p>
                            
                            <div className="item-meta">
                                <span className="item-price">${cartItem.item.price.toFixed(2)}</span>
                                {cartItem.item.original_price && cartItem.item.original_price > cartItem.item.price && (
                                    <span className="original-price">${cartItem.item.original_price.toFixed(2)}</span>
                                )}
                                <span className="prep-time">⏱️ {cartItem.item.preparation_time}min</span>
                            </div>

                            {cartItem.item.allergens.length > 0 && (
                                <div className="allergens">
                                    <small>Contains: {cartItem.item.allergens.join(', ')}</small>
                                </div>
                            )}
                        </div>

                        <div className="item-quantity">
                            <button 
                                className="quantity-btn minus"
                                onClick={() => handleQuantityChange(cartItem.item.id, cartItem.quantity - 1)}
                            >
                                -
                            </button>
                            <span className="quantity-value">{cartItem.quantity}</span>
                            <button 
                                className="quantity-btn plus"
                                onClick={() => handleQuantityChange(cartItem.item.id, cartItem.quantity + 1)}
                            >
                                +
                            </button>
                        </div>

                        <div className="item-total">
                            <span className="total-amount">${(cartItem.item.price * cartItem.quantity).toFixed(2)}</span>
                        </div>

                        <button 
                            className="remove-item-btn"
                            onClick={() => onRemoveItem(cartItem.item.id)}
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>

            {/* Discount Code */}
            <div className="discount-section">
                <h3>💳 Discount Code</h3>
                <div className="discount-input">
                    <input
                        type="text"
                        placeholder="Enter discount code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        disabled={discountApplied}
                    />
                    {!discountApplied ? (
                        <button 
                            className="apply-discount-btn"
                            onClick={handleApplyDiscount}
                            disabled={isApplyingDiscount || !discountCode.trim()}
                        >
                            {isApplyingDiscount ? 'Applying...' : 'Apply'}
                        </button>
                    ) : (
                        <button 
                            className="remove-discount-btn"
                            onClick={handleRemoveDiscount}
                        >
                            Remove
                        </button>
                    )}
                </div>
                {discountError && <p className="discount-error">{discountError}</p>}
                {discountApplied && (
                    <p className="discount-success">
                        ✅ Discount applied: -${discountAmount.toFixed(2)}
                    </p>
                )}
            </div>

            {/* Order Summary */}
            <div className="order-summary">
                <h3>📋 Order Summary</h3>
                
                <div className="summary-row">
                    <span>Subtotal ({items.length} items):</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                    <div className="summary-row discount">
                        <span>Discount:</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                )}

                <div className="summary-row">
                    <span>Delivery Fee:</span>
                    <span>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
                </div>

                <div className="summary-row">
                    <span>Tax ({(Config.TaxRate * 100).toFixed(0)}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                </div>

                <div className="summary-row total">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                </div>

                {deliveryFee === 0 && (
                    <p className="free-delivery-notice">
                        🎉 Free delivery on orders over ${Config.MinOrderAmount}!
                    </p>
                )}

                {total < Config.MinOrderAmount && (
                    <p className="min-order-notice">
                        ⚠️ Minimum order amount: ${Config.MinOrderAmount}
                    </p>
                )}

                {total > Config.MaxOrderValue && (
                    <p className="max-order-notice">
                        ⚠️ Maximum order value: ${Config.MaxOrderValue}
                    </p>
                )}
            </div>

            {/* Delivery Options */}
            <div className="delivery-options">
                <h3>🚚 Delivery Options</h3>
                <div className="delivery-type-selection">
                    <label className="delivery-option">
                        <input 
                            type="radio" 
                            name="deliveryType" 
                            value="delivery" 
                            defaultChecked
                        />
                        <span className="delivery-label">
                            🚚 Delivery to Address
                        </span>
                    </label>
                    <label className="delivery-option">
                        <input 
                            type="radio" 
                            name="deliveryType" 
                            value="pickup" 
                        />
                        <span className="delivery-label">
                            🏪 Pickup from Restaurant
                        </span>
                    </label>
                </div>
            </div>

            {/* Cart Actions */}
            <div className="cart-actions">
                <button 
                    className="clear-cart-btn"
                    onClick={onClearCart}
                >
                    🗑️ Clear Cart
                </button>

                <button 
                    className="place-order-btn"
                    onClick={onPlaceOrder}
                    disabled={!canPlaceOrder}
                >
                    🚀 Place Order
                </button>
            </div>

            {!canPlaceOrder && (
                <div className="order-requirements">
                    <p>To place an order:</p>
                    <ul>
                        <li>Cart must not be empty</li>
                        <li>Total must be at least ${Config.MinOrderAmount}</li>
                        <li>Total must not exceed ${Config.MaxOrderValue}</li>
                    </ul>
                </div>
            )}
        </div>
    )
}

export default Cart
