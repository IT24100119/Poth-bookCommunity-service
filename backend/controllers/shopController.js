const Shop = require('../models/shopModel');

// @desc    Get all shops
// @route   GET /api/shops
// @access  Public
const getShops = async (req, res) => {
    try {
        const shops = await Shop.find().populate('shopOwner', 'firstName lastName email');
        res.status(200).json(shops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single shop
// @route   GET /api/shops/:id
// @access  Public
const getShopById = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id).populate('shopOwner', 'firstName lastName email');
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }
        res.status(200).json(shop);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new shop
// @route   POST /api/shops
// @access  Private
const createShop = async (req, res) => {
    try {
        const { name, description, location, contactNumber } = req.body;
        
        // Image URL from Cloudinary
        const imageUrl = req.file ? req.file.path : 'https://via.placeholder.com/150';

        const shop = await Shop.create({
            shopOwner: req.user._id,
            name,
            description,
            location,
            contactNumber,
            imageUrl
        });

        res.status(201).json(shop);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update shop details
// @route   PUT /api/shops/:id
// @access  Private
const updateShop = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);

        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        // Check for owner
        if (shop.shopOwner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedShop = await Shop.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedShop);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete shop
// @route   DELETE /api/shops/:id
// @access  Private
const deleteShop = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);

        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        // Check for owner
        if (shop.shopOwner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await shop.deleteOne();
        res.status(200).json({ id: req.params.id, message: 'Shop deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getShops,
    getShopById,
    createShop,
    updateShop,
    deleteShop
};
