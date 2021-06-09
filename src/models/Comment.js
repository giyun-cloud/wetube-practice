import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  createdAt: { type: Date, required: true, default: Date.now },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  video: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Video" },
  text: { type: String, required: true },
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
