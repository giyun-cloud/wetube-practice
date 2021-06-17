import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";

export const createComment = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id: owner },
    },
    body: { text },
  } = req;
  const video = await Video.findById(id);
  const user = await User.findById(owner);
  if (!video || !user) return res.sendStatus(404);
  const comment = await Comment.create({
    owner,
    video: video._id,
    text,
  });
  video.comments.push(comment._id);
  user.comments.push(comment._id);
  await video.save();
  await user.save();
  return res.status(201).json({ id: comment._id });
};

export const commentFilter = async (element, comment) => {
  element.comments = element.comments.filter((el) => {
    return String(el) !== String(comment._id);
  });
  await element.save();
};

export const deleteComment = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id },
    },
  } = req;
  const comment = await Comment.findByIdAndDelete(id);
  const video = await Video.findById(comment.video);
  const user = await User.findById(comment.owner);
  console.log("id찾기 :", video, user, comment.owner, comment.video);
  if (
    !video ||
    !user ||
    !comment ||
    (String(_id) !== String(comment.owner) &&
      String(_id) !== String(video.owner))
  )
    return res.sendStatus(404);
  commentFilter(video, comment);
  commentFilter(user, comment);
  if (String(_id) === String(comment.owner)) req.session.user = user;
  return res.sendStatus(201);
};
