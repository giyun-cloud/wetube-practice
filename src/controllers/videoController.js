import Video from "../models/Video";
import User from "../models/User";

export const home = async (req, res) => {
  try {
    const videos = await Video.find({}).sort({ createdAt: "desc" });
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
  const video = await Video.findById(id).populate("owner");
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
  const video = await Video.exists({ _id: id });
  if (!video) return res.render("404", { pageTitle: "Video not found" });
  if (String(video.owner) !== String(req.session.user._id))
    return res.status(403).redirect("/");
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.hashtagsForm(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};
export const postUpload = async (req, res) => {
  try {
    const {
      session: { user: _id },
      body: { title, description, hashtags },
      file: { path: fileUrl },
    } = req;
    const newVideo = await Video.create({
      fileUrl,
      title,
      description,
      hashtags: Video.hashtagsForm(hashtags),
      owner: _id,
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("upload", { errmsg: error._message });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) return res.render("404", { pageTitle: "Video not found" });
  if (String(video.owner) !== String(req.session.user._id))
    return res.status(403).redirect("/");
  const user = await User.findById(video.owner);
  user.videos = user.videos.filter(
    (userVideo) => String(userVideo) !== String(video._id),
  );
  user.save();
  await Video.findByIdAndDelete(id);
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
  return res.render("search", { pageTitle: "Search", videos });
};
