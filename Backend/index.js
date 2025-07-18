const express = require('express');
const mongoose = require('mongoose');
const { spawn } = require('child_process');
const Product = require('./models/Product');
const User = require('./models/User');
const scrapeFlipkart = require('./scrapers/scrapeFlipkart');
const scrapeAmazon = require('./scrapers/scrapeAmazon');
const cors = require('cors');

const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());

const requireLogin = async (req, res, next) => {
    const username = req.headers['x-username'];
    if (!username) {
        return res.status(401).json({ success: false, message: "Not logged in. Username required in header." });
    }

    const user = await User.findOne({ username });
    if (!user) {
        return res.status(401).json({ success: false, message: "Invalid user." });
    }

    req.user = { username };
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

app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password required" });
    }

    const existing = await User.findOne({ username });
    if (existing) {
        return res.status(409).json({ success: false, message: "Username already exists" });
    }

    await User.create({ username, password });
    res.json({ success: true, message: "User registered successfully!" });
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password required" });
    }

    const user = await User.findOne({ username, password });
    if (!user) {
        return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    res.json({ success: true, message: "Login successful", username });
});

app.get('/api/products/search', async (req, res) => {
  const { q } = req.query;
  try {
    const products = await Product.find({
      name: { $regex: q, $options: 'i' } // case-insensitive search
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
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

        product.reviews.custom.push({
            username: req.user.username,
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
        const product = await Product.findById(req.params.productId);
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

        if (review.username !== req.user.username) {
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
        const products = await Product.find({ 'reviews.username': req.user.username });

        const userReviews = [];

        for (const product of products) {
            const matchingReviews = product.reviews
                .filter(r => r.username === req.user.username)
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

app.post('/api/products/:productId/fullDetails', async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const amazonUrl = product.buyLinks?.amazon;
    const flipkartUrl = product.buyLinks?.flipkart;

    if (!amazonUrl && !flipkartUrl) {
      return res.status(400).json({ success: false, message: 'No Amazon or Flipkart URL provided in buyLinks' });
    }

    const responses = {};

    const runScraper = (platform, scriptPath, url) =>
        new Promise((resolve) => {
            const process = spawn('python', [scriptPath, productId, url]);

            let output = '';
            process.stdout.on('data', data => output += data.toString());
            process.stderr.on('data', err => console.error(`${platform} stderr:`, err.toString()));

            process.on('close', async (code) => {
            if (code !== 0) {
                responses[platform] = 'Failed';
                return resolve();
            }

            try {
                console.log(`${platform} raw output:`, output);
                const parsed = JSON.parse(output);
                responses[platform] = 'Success';

                if (parsed.price) {
                    if (!product.prices) product.prices = {};
                    product.prices[platform] = parsed.price;
                    product.markModified('prices');
                }


                if (Array.isArray(parsed.reviews) && parsed.reviews.length > 0) {
                product.reviews[platform] = parsed.reviews.map(r => ({
                    username: `${platform}-scraper`,
                    review: r.comment,
                    rating: r.rating || 4
                }));
                product.markModified('reviews');
                }

                if (parsed.image && (!product.imageUrl || product.imageUrl === '')) {
                product.imageUrl = parsed.image;
                product.markModified('imageUrl');
                }

                resolve();
            } catch (e) {
                console.error(`Error parsing ${platform} output:`, e, '\nRaw:', output);
                responses[platform] = 'Parse Error';
                resolve();
            }
            });
        });


    const tasks = [];
    if (amazonUrl) tasks.push(runScraper('amazon', 'scrapers/scrapeAmazon.py', amazonUrl));
    if (flipkartUrl) tasks.push(runScraper('flipkart', 'scrapers/scrapeFlipkart.py', flipkartUrl));

    await Promise.all(tasks);
    await product.save();

    res.json({ success: true, message: "Scraping complete", status: responses });
  } catch (err) {
    console.error("Scrape Error:", err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


app.post('/api/products/:productId/insert', async (req, res) => {
    const { productId } = req.params;
    const { flipkartUrl, amazonUrl } = req.body;

    if (!flipkartUrl || !amazonUrl) {
        return res.status(400).json({ success: false, message: "Both Flipkart and Amazon URLs are required." });
    }

    const runScraper = (script, productId, url) => {
        return new Promise((resolve, reject) => {
            const process = spawn('python', [`scripts/${script}`, productId, url]);

            let output = '';
            let error = '';

            process.stdout.on('data', (data) => {
                output += data.toString();
            });

            process.stderr.on('data', (data) => {
                error += data.toString();
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve(output.trim());
                } else {
                    reject(error.trim());
                }
            });
        });
    };

    try {
        const [flipkartOutput, amazonOutput] = await Promise.all([
            runScraper('scrapeFlipkart.py', productId, flipkartUrl),
            runScraper('scrapeAmazon.py', productId, amazonUrl)
        ]);

        res.json({
            success: true,
            message: "Both scrapers completed successfully.",
            flipkartOutput,
            amazonOutput
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "One or both scrapers failed.", error });
    }
});
