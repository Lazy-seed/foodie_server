import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../src/models/User.js";
import Product from "../src/models/Product.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../seed/demo-seed.json"), "utf-8")
);

const seedDemo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        // Seed Users
        for (const user of seedData.users) {
            const existingUser = await User.findOne({ email: user.email });
            if (!existingUser) {
                await User.create(user);
                console.log(`User created: ${user.email}`);
            } else {
                console.log(`User already exists: ${user.email}`);
            }
        }

        // Seed Products
        for (const product of seedData.products) {
            const existingProduct = await Product.findOne({ title: product.title });
            if (!existingProduct) {
                await Product.create(product);
                console.log(`Product created: ${product.title}`);
            } else {
                console.log(`Product already exists: ${product.title}`);
            }
        }

        console.log("Demo seeding completed");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding demo data:", error);
        process.exit(1);
    }
};

seedDemo();
