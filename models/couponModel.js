// const mongoose = require('mongoose');

// const couponSchema = new mongoose.Schema({
//     code: { type: String, required: true, unique: true },
//     discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
//     discountValue: { type: Number, required: true },
//     expiryDate: { type: Date, required: true },
//     usageLimit: { type: Number, default: null },
//     usedCount: { type: Number, default: 0 },
//     minOrderAmount: { type: Number, default: 0 },
//     userSpecific: { type: Boolean, default: false },
//     applicableUsers: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
// });

// module.exports = mongoose.model('Coupon', couponSchema);

const couponData = [
    {
        code: "SAVE10",
        discountType: "percentage",
        discountValue: 10,
        expiryDate: new Date("2025-02-28"),
        usageLimit: 100,
        usedCount: 0,
        minOrderAmount: 500,
        userSpecific: false,
        applicableUsers: [],
    },
    {
        code: "FLAT50",
        discountType: "fixed",
        discountValue: 50,
        expiryDate: new Date("2025-01-31"),
        usageLimit: 50,
        usedCount: 0,
        minOrderAmount: 300,
        userSpecific: false,
        applicableUsers: [],
    },
    {
        code: "NEWUSER20",
        discountType: "percentage",
        discountValue: 20,
        expiryDate: new Date("2025-06-30"),
        usageLimit: 1,
        usedCount: 0,
        minOrderAmount: 0,
        userSpecific: false,
        applicableUsers: ["64b5f0c9f7e9a5d1e9a1f001"], // Replace with actual user IDs
    },
    {
        code: "FESTIVE30",
        discountType: "percentage",
        discountValue: 30,
        expiryDate: new Date("2025-12-31"),
        usageLimit: 500,
        usedCount: 0,
        minOrderAmount: 1000,
        userSpecific: false,
        applicableUsers: [],
    },
    {
        code: "SPECIAL100",
        discountType: "fixed",
        discountValue: 100,
        expiryDate: new Date("2025-03-15"),
        usageLimit: 200,
        usedCount: 0,
        minOrderAmount: 800,
        userSpecific: false,
        applicableUsers: [],
    },
    {
        code: "LOYALTY15",
        discountType: "percentage",
        discountValue: 15,
        expiryDate: new Date("2025-04-30"),
        usageLimit: null,
        usedCount: 0,
        minOrderAmount: 0,
        userSpecific: false,
        applicableUsers: ["64b5f0c9f7e9a5d1e9a1f002", "64b5f0c9f7e9a5d1e9a1f003"], // Replace with actual user IDs
    },
];

export default couponData;

