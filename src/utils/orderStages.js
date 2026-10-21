// The one place a guest's most recent order code is kept, so Checkout,
// TableScan, TrackOrder, and the dine-in prompt modal all read/write the
// exact same key.
export const LAST_ORDER_CODE_KEY = 'kcl_last_order_code'

// Mirrors backend/utils/orderStages.js - dine-in and pickup share one stage
// list (coffee/food is always prepared in-shop either way); a coffee-machine
// purchase ships like e-commerce (delivery) and has its own stage list.
export const ORDER_TYPE_LABELS = { dine_in: 'Dine-in', pickup: 'Pickup order', delivery: 'Delivery' }

export const STAGES = {
  dine_in: ['Order Placed', 'Preparing', 'Ready for Pickup', 'Served'],
  pickup: ['Order Placed', 'Preparing', 'Ready for Pickup', 'Served'],
  delivery: ['Order Placed', 'Pending', 'Confirmed', 'Dispatched', 'Delivered'],
}

// Final states for any order type - once here, it's done and no longer
// worth nudging the customer about.
export const TERMINAL_STATUSES = ['Served', 'Delivered', 'Cancelled']

export const isOrderActive = (order) => !!order && !TERMINAL_STATUSES.includes(order.orderStatus)

export const stagesFor = (orderType) => STAGES[orderType] || STAGES.dine_in
