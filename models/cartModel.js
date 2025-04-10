import { Schema, model } from 'mongoose';

const cartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  items: [
    {
      productId: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
      quantity: { type: Number, required: true, min: 1, default:1 }
    }
  ],
  totalPrice: { type: Number, required: true, default: 0 }
}, { timestamps: true });

export default model('Cart', cartSchema);
