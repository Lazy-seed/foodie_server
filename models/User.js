 
import { Schema, model } from "mongoose";
import bcryptjs from "bcryptjs";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Hash password before saving
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcryptjs.hash(this.password, 10);
//   next();
// });

export default model("User", UserSchema);
