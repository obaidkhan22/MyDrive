import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: [3, "Name should be minimum of 3 characters."],
  },
  email: {
    type: String,
    unique: true,
    required: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email.",
    ],
  },
  password: {
    type: String,
    required: true,
    minLength: [4, "Password should be minimum of 4 characters."],
  },
  rootDirId: {
    type: Schema.Types.ObjectId,
    ref: "Directory",
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (userPassword) {
  return bcrypt.compare(userPassword, this.password);
};
const User = model("User", userSchema);

export default User;
