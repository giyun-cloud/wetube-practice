import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";
import { commentFilter } from "../controllers/commentController";
import aws from "aws-sdk";
let s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

export const home = async (req, res) => {
  try {
    const videos = await Video.find({})
      .sort({ createdAt: "desc" })
      .populate("owner");
    return res.render("home", {
      pageTitle: "Home",
      videos,
    });
  } catch (error) {
    return res.render("error", { error });
  }
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id)
    .populate({
      path: "comments",
      populate: { path: "owner" },
    })
    .populate("owner");
  if (!video) {
    res.status(404).render("404", { pageTitle: "Video not found" });
  }
  return res.render("watch", {
    pageTitle: video.title,
    video,
  });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video)
    return res.status(404).render("404", { pageTitle: "Video not found" });
  if (String(video.owner) !== String(req.session.user._id))
    return res.status(403).redirect("/");
  return res.render("edit", { pageTitle: `Edit : ${video.title}`, video });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.findById({ _id: id });
  if (!video) return res.render("404", { pageTitle: "Video not found" });
  if (String(video.owner) !== String(req.session.user._id))
    return res.status(403).redirect("/");
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.hashtagsForm(hashtags),
  });
  req.flash("success", "Edit done.");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};
export const postUpload = async (req, res) => {
  try {
    const {
      session: {
        user: { _id },
      },
      body: { title, description, hashtags },
      files: { video, thumb },
    } = req;

    const newVideo = await Video.create({
      fileUrl: video[0].location,
      thumbUrl: thumb[0].location,
      title,
      description,
      hashtags: Video.hashtagsForm(hashtags),
      owner: _id,
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    req.flash("success", "Upload complete.");
    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("upload", { errMsg: `????${error._message}` });
  }
};

const outputDeleteFile = (url) => {
  const index = url.indexOf(".com/");
  return url.substr(index + 5);
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) return res.render("404", { pageTitle: "Video not found" });
  if (String(video.owner) !== String(req.session.user._id))
    return res.status(403).redirect("/");
  const user = await User.findById(video.owner);
  const videoUrl = outputDeleteFile(video.fileUrl);
  const thumbUrl = outputDeleteFile(video.thumbUrl);
  s3.deleteObject(
    {
      Bucket: "cloud-wetube",
      Key: videoUrl,
    },
    (err, data) => {
      if (err) {
        throw err;
      }
      console.log("s3 deleteObject ", data);
    },
  );
  s3.deleteObject(
    {
      Bucket: "cloud-wetube",
      Key: thumbUrl,
    },
    (err, data) => {
      if (err) {
        throw err;
      }
      console.log("s3 deleteObject ", data);
    },
  );
  user.videos = user.videos.filter(
    (userVideo) => String(userVideo) !== String(video._id),
  );
  user.save();
  const comments = await Comment.find({ video: video._id });
  for (let i = 0; i < comments.length; i++) {
    const comment = await Comment.findOneAndDelete({ video: video._id });
    const user = await User.findById(comment.owner);
    commentFilter(user, comment);
  }
  await Video.findByIdAndDelete(id);
  req.flash("success", "Delete completed.");
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    });
  }
  req.flash("success", "Search completed.");
  return res.render("search", { pageTitle: "Search", videos, keyword });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) return res.sendStatus(404);
  video.meta.views += 1;
  await video.save();
  return res.sendStatus(200);
};
