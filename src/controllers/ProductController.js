import Product from "../models/Product.js";
import redisClient from "../config/redis.js";

const CACHE_EXPIRATION = 3600; // 1 hour

// Helper to clear product cache
const clearProductCache = async () => {
  const keys = await redisClient.keys('products:*');
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

// Create Product
export const createProduct = async (req, res) => {
  try {
    const { title, price, star, reviews, description, imgUrl, category, veg } = req.body;

    const product = new Product({ title, price, star, reviews, description, imgUrl, category, veg });
    await product.save();

    await clearProductCache();

    res.status(201).json({ message: "Product created successfully", product });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Products
export const getAllProducts = async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 9 } = req.query;
    const cacheKey = `products:${JSON.stringify(req.query)}`;

    // Check cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    // Build the query object
    const query = {};
    if (category && category !== "Popular" && category !== "all") {
      query.category = category;
    }
    if (search) {
      query.title = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    // Sorting logic
    let sortOption = {};
    if (category === "Popular") {
      // Special case for "Popular" category: sort by reviews (highest first)
      sortOption.reviews = -1;
    } else {
      if (sort === "priceHighToLow") {
        sortOption.price = -1;
      } else if (sort === "priceLowToHigh") {
        sortOption.price = 1;
      } else {
        sortOption.createdAt = -1; // Default: sort by newest
      }
    }

    // Pagination logic
    const skip = (page - 1) * limit;

    // Fetching the data
    let products;
    let total;

    if (category === "Popular") {
      // Fetch top 9 products with highest reviews
      products = await Product.find(query)
        .sort({ reviews: -1 })
        .limit(9);
      total = 9; // Fixed total for "Popular" category
    } else {
      total = await Product.countDocuments(query);
      products = await Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit));
    }

    const responseData = {
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    };

    // Set cache
    await redisClient.setEx(cacheKey, CACHE_EXPIRATION, JSON.stringify(responseData));

    res.status(200).json(responseData);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// Get Product by ID
export const getProductById = async (req, res) => {
  try {
    const cacheKey = `product:${req.params.id}`;
    const cachedProduct = await redisClient.get(cacheKey);

    if (cachedProduct) {
      return res.status(200).json(JSON.parse(cachedProduct));
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await redisClient.setEx(cacheKey, CACHE_EXPIRATION, JSON.stringify(product));

    res.status(200).json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const { title, price, star, reviews, description, imgUrl, category, veg } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { title, price, star, reviews, description, imgUrl, category, veg },
      { new: true }
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    // Invalidate caches
    await redisClient.del(`product:${req.params.id}`);
    await clearProductCache();

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Invalidate caches
    await redisClient.del(`product:${req.params.id}`);
    await clearProductCache();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const productData = [
  {
    "title": "Fries (King)",
    "description": "The perfect crispy partner.",
    "kcal": 455,
    "category": "Snacks",
    "price": 109,
    "imgUrl": "https://d1rgpf387mknul.cloudfront.net/products/PLP/web/2x_web_20240425070818116654_482x264jpg",
    "veg": true,
    "star": 4.3,
    "reviews": 180
  },
  {
    "title": "Fries (Medium)",
    "description": "The perfect crispy partner.",
    "kcal": 332.5,
    "category": "Snacks",
    "price": 102,
    "imgUrl": "https://d1rgpf387mknul.cloudfront.net/products/PLP/web/2x_web_20240425070752205875_482x264jpg",
    "veg": true,
    "star": 4.1,
    "reviews": 120
  },
  {
    "title": "Peri Peri Fries (Medium)",
    "description": "Cripsy fries with peri peri spice. Hot indeed.",
    "kcal": 345.3,
    "category": "Snacks",
    "price": 119,
    "imgUrl": "https://d1rgpf387mknul.cloudfront.net/products/PLP/web/2x_web_20231211115458060556_482x264jpg",
    "veg": true,
    "star": 4.5,
    "reviews": 200
  },
  {
    "title": "Peri Peri Fries (King)",
    "description": "Cripsy fries with peri peri spice. Hot indeed.",
    "kcal": 467.8,
    "category": "Snacks",
    "price": 129,
    "imgUrl": "https://d1rgpf387mknul.cloudfront.net/products/PLP/web/2x_web_20231211114807165833_482x264jpg",
    "veg": true,
    "star": 4.7,
    "reviews": 250
  },
  {
    "title": "Masala Hashbrown",
    "description": "Fried golden brown potatoes with a desi masala twist.",
    "kcal": null,
    "category": "Snacks",
    "price": 39,
    "imgUrl": "https://d1rgpf387mknul.cloudfront.net/products/PLP/web/2x_web_20240425065457911886_482x264jpg",
    "veg": true,
    "star": 4.2,
    "reviews": 150
  },
  {
    "title": "Saucy Fries",
    "description": "Crispy French fries, loaded with sauce",
    "kcal": 461,
    "category": "Snacks",
    "price": 125,
    "imgUrl": "https://d1rgpf387mknul.cloudfront.net/products/PLP/web/2x_web_20241025070936192286_482x264jpg",
    "veg": true,
    "star": 4.4,
    "reviews": 190
  },
  {
    "title": "(6Pc) Crunchy Chicken Nuggets + 1 Dip",
    "description": "Tender Juicy Crunchy Chicken Nuggets fried to golden brown perfection. Served with Fiery Hell Dip",
    "kcal": 336.9,
    "category": "Snacks",
    "price": 139,
    "imgUrl": "https://d1rgpf387mknul.cloudfront.net/products/PLP/web/2x_web_20240224065005359900_482x264jpg",
    "veg": false,
    "star": 4.6,
    "reviews": 220
  },
  {
    "title": "(9Pc) Crunchy Chicken Nuggets + 2 Dips",
    "description": "Tender Juicy Crunchy Chicken Nuggets fried to golden brown perfection. Served with Fiery Hell Dip",
    "kcal": 548.3,
    "category": "Snacks",
    "price": 169,
    "imgUrl": "https://d1rgpf387mknul.cloudfront.net/products/PLP/web/2x_web_20240224064249475730_482x264jpg",
    "veg": false,
    "star": 4.8,
    "reviews": 280
  }
]

export const AutoAddProducts = async (req, res) => {
  try {
    const promises = productData.map(async (element) => {
      const { title, price, star, reviews, description, imgUrl, category, veg } = element;

      const product = new Product({
        title,
        price,
        star,
        reviews,
        description,
        imgUrl,
        category,
        veg,
      });
      await product.save();
    });

    await Promise.all(promises);
    await clearProductCache();
    res.status(201).json({ message: "Products added successfully!" });
  } catch (err) {
    console.error("Error adding products:", err.message);
    res.status(500).json({ message: "Failed to add products" });
  }
};


// export const AutoAddProducts = async (req, res) => {
//   try {
//     //  const alldata = await Product.find()
//     const newData = await Product.updateMany({
//       category: "Tacos" 
//     }, {
//       $set: { category: "Burgers" }
//     })

//     res.status(201).json({ message: "Products Update successfully!", count :newData.modifiedCount });
//   } catch (err) {
//     console.error("Error adding products:", err.message);
//     res.status(500).json({ message: "Failed to add products" });
//   }
// };
