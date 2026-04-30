const Order = require('../models/orderModel');
const Book = require('../models/bookModel');

// @desc    Add a new order
// @route   POST /api/orders
// @access  Public
const addOrder = async (req, res) => {
    try {
        const { reader, shop, book, quantity, totalPrice, deliveryDetails } = req.body;

        // Check stock first
        const targetBook = await Book.findById(book);
        if (!targetBook) {
            return res.status(404).json({ message: 'Book not found' });
        }
        if (targetBook.stockCount < quantity) {
            return res.status(400).json({ message: 'Not enough stock available' });
        }

        const order = await Order.create({
            reader,
            shop,
            book,
            quantity,
            totalPrice,
            deliveryDetails
        });

        // Deduct from stock
        targetBook.stockCount -= quantity;
        await targetBook.save();

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get orders for a specific reader
// @route   GET /api/orders/reader/:readerId
// @access  Public
const getReaderOrders = async (req, res) => {
    try {
        const orders = await Order.find({ reader: req.params.readerId })
            .populate('book', 'title author imageUrl price')
            .populate('shop', 'name location');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get orders for a specific shop
// @route   GET /api/orders/shop/:shopId
// @access  Public
const getShopOrders = async (req, res) => {
    try {
        const orders = await Order.find({ shop: req.params.shopId })
            .populate('book', 'title author imageUrl price')
            .populate('reader', 'firstName lastName email phoneNumber');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Public
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        const updatedOrder = await order.save();

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order delivery details
// @route   PUT /api/orders/:id/delivery
// @access  Public
const updateOrderDelivery = async (req, res) => {
    try {
        const { deliveryDetails } = req.body;
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Only allow update if order is pending
        if (order.status !== 'Pending') {
            return res.status(400).json({ message: 'Cannot update delivery details after confirmation' });
        }

        order.deliveryDetails = deliveryDetails;
        const updatedOrder = await order.save();

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete/Cancel order
// @route   DELETE /api/orders/:id
// @access  Public
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Return stock if cancelled
        if (order.status !== 'Delivered') {
            await Book.findByIdAndUpdate(order.book, { $inc: { stockCount: order.quantity } });
        }

        await Order.deleteOne({ _id: req.params.id });
        
        res.status(200).json({ id: req.params.id, message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addOrder,
    getReaderOrders,
    getShopOrders,
    updateOrderStatus,
    updateOrderDelivery,
    deleteOrder
};
