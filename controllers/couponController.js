const Coupon = require('./models/Coupon');

const validateCoupon = async (couponCode, orderTotal, userId) => {
    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) throw new Error("Invalid coupon code.");
    if (new Date() > coupon.expiryDate) throw new Error("Coupon has expired.");
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new Error("Coupon usage limit reached.");
    if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) throw new Error(`Minimum order amount is ${coupon.minOrderAmount}.`);

    if (coupon.userSpecific && !coupon.applicableUsers.includes(userId)) {
        throw new Error("This coupon is not applicable to you.");
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
        discount = (orderTotal * coupon.discountValue) / 100;
    } else if (coupon.discountType === 'fixed') {
        discount = coupon.discountValue;
    }

    return {
        discount: Math.min(discount, orderTotal),
        finalAmount: orderTotal - discount,
    };
};
