const express = require('express');
const router = express.Router();
const { getShops, getShopById, createShop, updateShop, deleteShop } = require('../controllers/shopController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../utils/cloudinaryConfig');

router.route('/')
    .get(getShops)
    .post(protect, upload.single('image'), createShop);

router.route('/:id')
    .get(getShopById)
    .put(protect, upload.single('image'), updateShop)
    .delete(protect, deleteShop);

module.exports = router;
