import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
