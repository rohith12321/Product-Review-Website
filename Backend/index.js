const express = require('express');
const mongoose = require('mongoose');
const Review = require('./models/review');  // Models folder me Review.js se import
const Product = require('./models/Product');

const app = express();
const port = 5000;

app.use(express.json());


// mongoose.connect('mongodb+srv://vishal10992021:FJTBWV98N1Gk05dG@cluster0.nchvnmv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
// .then(() => {
//     console.log("✅ MongoDB Connected");

//     // Server start tabhi hoga jab DB connect ho jaye
//     app.listen(port, () => {
//         console.log(`🚀 Server listening on port ${port}`);
//     });
// })
// .catch((err) => {
//     console.error("❌ MongoDB Connection Failed:", err);
// });

mongoose.connect('mongodb+srv://vishal10992021:FJTBWV98N1Gk05dG@cluster0.nchvnmv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',)
.then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(port, () => {
        console.log(`🚀 Server listening on port ${port}`);
    });
})
.catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err);
});


app.post('/api/review', async (req, res) => {
    try {
        const { productId, review, rating } = req.body;
        if(!productId || !review || !rating){
            return res.status(400).json({ success: false,message :"All fieds are required"});
        }
        const newReview = await Review.create({ productId, review, rating });
        res.json({ success: true, message: "Review submitted successfully!", data: newReview });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error submitting review", error: err.message });
    }
});



app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find();
        res.json({ success: true, total: reviews.length, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching reviews", error: err.message });
    }
});



app.put('/api/review/:id', async (req, res) => {
    try {
        const reviewId = req.params.id;
        const { review, rating } = req.body;

        const updatedReview = await Review.findByIdAndUpdate(
            reviewId,
            { review, rating },
            { new: true }
        );

        if (!updatedReview) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        res.json({ success: true, message: "Review updated successfully", data: updatedReview });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error updating review", error: err.message });
    }
});
// Create Product
app.post('/api/products', async (req, res) => {
    try {
        const { name, description, price } = req.body;
        if(!name || !price){
            return res.status(400).json({ success: false, message:"Name and price are required"});
        }
        const newProduct = await Product.create({ name, description, price });
        res.json({ success: true, message: "Product created successfully", data: newProduct });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error creating product", error: err.message });
    }
});

// Get All Products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json({ success: true, total: products.length, data: products });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching products", error: err.message });
    }
});



app.delete('/api/review/:id', async (req, res) => {
    try {
        const reviewId = req.params.id;
        const deletedReview = await Review.findByIdAndDelete(reviewId);

        if (!deletedReview) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        res.json({ success: true, message: "Review deleted successfully", data: deletedReview });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error deleting review", error: err.message });
    }
});
