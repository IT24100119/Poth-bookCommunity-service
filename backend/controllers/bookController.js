const Book = require('../models/bookModel');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
    try {
        const books = await Book.find().populate('shop', 'name location');
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('shop', 'name location');
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get books by shop
// @route   GET /api/shops/:shopId/books
// @access  Public
const getBooksByShop = async (req, res) => {
    try {
        const books = await Book.find({ shop: req.params.shopId });
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new book
// @route   POST /api/books
// @access  Private
const addBook = async (req, res) => {
    try {
        const { title, author, description, price, shop, category, stockCount } = req.body;
        
        // Image URL from Cloudinary (multer-storage-cloudinary provides req.file.path as the URL)
        const imageUrl = req.file ? req.file.path : 'https://via.placeholder.com/150';

        const book = await Book.create({
            title,
            author,
            description,
            price,
            imageUrl,
            shop,
            category,
            stockCount
        });

        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update book details
// @route   PUT /api/books/:id
// @access  Public (for now)
const updateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedBook);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Public (for now)
const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        await book.deleteOne();
        res.status(200).json({ id: req.params.id, message: 'Book deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getBooks,
    getBookById,
    getBooksByShop,
    addBook,
    updateBook,
    deleteBook
};
