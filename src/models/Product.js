import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    star: { type: Number, required: true },
    reviews: { type: Number, required: true },
    description: { type: [String], required: true },
    imgUrl: { type: String, required: true },
    category: { type: String, required: true },
    veg: { type: Boolean, required: true },
    stock: { type: Number, default: 100 },
    isAvailable: { type: Boolean, default: true },
    soldCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Product", ProductSchema);
