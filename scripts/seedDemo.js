import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../src/models/User.js";
import Product from "../src/models/Product.js";
import Address from "../src/models/addressModel.js"; // <-- new

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
            // Remove address from user object before creating User model (User schema likely doesn't accept defaultAddress)
            const userData = { ...user };
            const defaultAddress = userData.defaultAddress || null;
            delete userData.defaultAddress;

            let createdUser = await User.findOne({ email: userData.email });
            if (!createdUser) {
                createdUser = await User.create(userData);
                console.log(`User created: ${userData.email}`);
            } else {
                console.log(`User already exists: ${userData.email}`);
            }

            // Create Address document for the user if defaultAddress is provided and Address doesn't already exist
            if (defaultAddress) {
                const existingAddress = await Address.findOne({ userId: createdUser._id });
                if (!existingAddress) {
                    await Address.create({
                        userId: createdUser._id,
                        addresses: [
                            {
                                tag: defaultAddress.tag || "Home",
                                firstName: defaultAddress.firstName,
                                lastName: defaultAddress.lastName,
                                address: {
                                    line1: defaultAddress.address.line1,
                                    line2: defaultAddress.address.line2 || ""
                                },
                                city: defaultAddress.city,
                                postcode: defaultAddress.postcode,
                                contact: defaultAddress.contact,
                                isDefault: defaultAddress.isDefault === undefined ? true : defaultAddress.isDefault
                            }
                        ],
                        maxAddresses: defaultAddress.maxAddresses || 5
                    });
                    console.log(`Address created for user: ${userData.email}`);
                } else {
                    console.log(`Address already exists for user: ${userData.email}`);
                }
            }
        }

        // Seed Products
        if (Array.isArray(seedData.products)) {
            for (const product of seedData.products) {
                const existingProduct = await Product.findOne({ title: product.title });
                if (!existingProduct) {
                    await Product.create(product);
                    console.log(`Product created: ${product.title}`);
                } else {
                    console.log(`Product already exists: ${product.title}`);
                }
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
