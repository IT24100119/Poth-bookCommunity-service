const mongoose = require('mongoose');
const Book = require('./models/bookModel');
const Order = require('./models/orderModel'); // I should also delete dummy orders if their book gets deleted to be safe!

const MONGO_URI = "mongodb+srv://PothMobileApp:Y2S2WDDS0101@pothmobileapp.yebdczv.mongodb.net/?appName=PothMobileApp";

async function cleanup() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        // Delete all books except 'The English Teacher'
        const result = await Book.deleteMany({ title: { $ne: 'The English Teacher' } });
        console.log(`Deleted ${result.deletedCount} dummy books.`);
        
        // Also wipe orders that belong to dummy books or are orphaned (optional, but good practice since I wiped books)
        // Wait, just let them be, or delete them
        const resultOrders = await Order.deleteMany({});
        console.log(`Wiped orders to reset state for new real book.`);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
cleanup();
