const express = require('express');
const router = express.Router();
const { getBooks, getBookById, getBooksByShop, addBook, updateBook, deleteBook } = require('../controllers/bookController');
const { upload } = require('../utils/cloudinaryConfig');

router.route('/')
    .get(getBooks)
    .post(upload.single('image'), addBook);

router.route('/:id')
    .get(getBookById)
    .put(upload.single('image'), updateBook)
    .delete(deleteBook);
    
router.route('/shop/:shopId').get(getBooksByShop);

module.exports = router;
