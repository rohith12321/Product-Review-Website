const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const app = express();
const port = 5000;

app.use(express.json());

// DEMO
const requireLogin = (req, res, next) => {
    req.user = {
        _id: '64b1b1f2a123456789abc123', // dummy user ID
        username: 'demoUser'
    };
    next();
};


mongoose.connect('mongodb+srv://vishal10992021:FJTBWV98N1Gk05dG@cluster0.nchvnmv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        console.log("✅ MongoDB Connected");
        app.listen(port, () => {
            console.log(`🚀 Server listening on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB Connection Failed:", err);
    });

    // DEMO to check product
app.get('/api/test/add-product', async (req, res) => {
    try {
        const product = await Product.create({
            name: "iPhone 15 Pro Max",
            description: "Apple flagship phone with A17 chip",
            price: 1399,
            imageUrl: "https://example.com/iphone15.jpg",
            buyLinks: [
                "https://amazon.in/iphone15",
                "https://flipkart.com/iphone15"
            ]
        });
        res.json({ success: true, message: "Product added", data: product });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error adding product", error: err.message });
    }
});


app.get('/api/products/search', async (req, res) => {
    try {
        const query = req.query.query || "";
        const regex = new RegExp(query, 'i');

        const products = await Product.find({
            $or: [
                { name: { $regex: regex } },
                { description: { $regex: regex } }
            ]
        });

        res.json({ success: true, total: products.length, data: products });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error searching products", error: err.message });
    }
});



app.post('/api/products/:productId/review', requireLogin, async (req, res) => {
    const { review, rating } = req.body;
    const { productId } = req.params;

    if (!review || !rating) {
        return res.status(400).json({ success: false, message: "Review and rating are required." });
    }

    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        product.reviews.push({
            userId: req.user._id,
            review,
            rating
        });

        await product.save();
        res.json({ success: true, message: "Review added successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error adding review", error: err.message });
    }
});

app.get('/api/products/:productId/reviews', async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId).populate('reviews.userId', 'username');

        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        res.json({ success: true, total: product.reviews.length, data: product.reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching reviews", error: err.message });
    }
});

app.delete('/api/products/:productId/review/:reviewId', requireLogin, async (req, res) => {
    try {
        const { productId, reviewId } = req.params;
        const product = await Product.findById(productId);

        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const review = product.reviews.id(reviewId);
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });

        if (review.userId.toString() !== req.user._id) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this review" });
        }

        review.remove();
        await product.save();

        res.json({ success: true, message: "Review deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error deleting review", error: err.message });
    }
});

app.get('/api/user/reviews', requireLogin, async (req, res) => {
    try {
        const products = await Product.find({ 'reviews.userId': req.user._id });

        const userReviews = [];

        for (const product of products) {
            const matchingReviews = product.reviews
                .filter(r => r.userId.toString() === req.user._id)
                .map(r => ({
                    reviewId: r._id,
                    productId: product._id,
                    productName: product.name,
                    review: r.review,
                    rating: r.rating,
                    createdAt: r.createdAt
                }));
            userReviews.push(...matchingReviews);
        }

        res.json({ success: true, total: userReviews.length, data: userReviews });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching user's reviews", error: err.message });
    }
});
