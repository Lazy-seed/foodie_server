import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
            quantity: { type: Number, required: true, min: 1, default: 1 },
            price: { type: Number, required: true }
        }
    ],
    
    totalPrice: { type: Number, required: true, default: 0 },
    paymentMethod: { type: String},
    shippingAddress: { 
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        address: {
            line1: { type: String, required: true },
            line2:{ type: String }
        },
        city: { type: String, required: true },
        postcode: { type: Number, required: true },
        contact:{ type: Number, required: true }
     },
     note: { type: String },
    status: { type: String, required: true, default: 'pending' },
    createdAt: { type: Date, default: Date.now },
}) 

export default mongoose.model('OrderModel', orderSchema);