import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  avatarUrl: String,
  username: { type: String, required: true, unique: true },
  socialOnly: { type: Boolean, default: false },
  password: { type: String },
  name: { type: String, required: true },
  location: String,
});

userSchema.pre("save", async function () {
  if (this.password) this.password = await bcrypt.hash(this.password, 5);
});

const userModel = mongoose.model("users", userSchema);

export default userModel;
