import Cart from '../models/cartModel.js';
import orderModel from "../models/orderModel.js";


export const createOrder = async (req, res) => {
    const address = req.body;
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    let totalPrice = 0
    const itemsss = cart.items.map(item => {
        const price = item.productId.price;
        totalPrice += price * item.quantity;
        return {
            ...item.toObject(), // Convert item to plain object to prevent MongoDB schema issues
            price,
        };
    });
    const order = await orderModel.create({ userId: req.user.id, shippingAddress: { ...address }, paymentMethod: "ONLINE", note: address.orderNotes, items: itemsss, totalPrice });
     // Schedule a function to run after 30 seconds
     setTimeout(async () => {
        try {
            console.log("Running delayed function after 30 seconds...");
            // Add your delayed logic here
            // For example: Notify the user or update the order status
            await orderModel.findByIdAndUpdate(order._id, { status: "Processed" });
            console.log("Order status updated to 'Processed'.");
            setTimeout(async () => {
                try {
                    console.log("Running delayed function after 30 seconds...");
                    // Add your delayed logic here
                    // For example: Notify the user or update the order status
                    await orderModel.findByIdAndUpdate(order._id, { status: "Delivered" });
                    console.log("Order status updated to 'Delivered'.");
                } catch (error) {
                    console.error("Error in delayed function:", error);
                }
            }, 30000);
        } catch (error) {
            console.error("Error in delayed function:", error);
        }
    }, 30000);
    res.status(200).json({message:"Order created successfully",order});

}

export const getOrders = async (req, res) => {
    const orders = await orderModel.find({ userId: req.user.id }).populate('items.productId');
    res.status(200).json(orders);
}