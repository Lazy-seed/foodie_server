import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true
    },
    addresses: [{
        tag: {
            type: String,
            enum: ['Home', 'Work', 'Other'],
            required: true,
            default: 'Home'
        },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        address: {
            line1: { type: String, required: true },
            line2: { type: String }
        },
        city: { type: String, required: true },
        postcode: { type: String, required: true },
        contact: { type: String, required: true },
        isDefault: { type: Boolean, default: false }
    }],
    maxAddresses: { type: Number, default: 5 }
}, {
    timestamps: true
});

// Ensure only one default address per user
addressSchema.pre('save', function (next) {
    const defaultAddresses = this.addresses.filter(addr => addr.isDefault);
    if (defaultAddresses.length > 1) {
        // Keep only the last one marked as default
        this.addresses.forEach((addr, index) => {
            if (index < this.addresses.length - 1) {
                addr.isDefault = false;
            }
        });
    }
    next();
});

export default mongoose.model('Address', addressSchema);
