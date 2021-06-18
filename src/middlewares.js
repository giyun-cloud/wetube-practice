import multer from "multer";
import mongoose from "mongoose";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});
const s3ImageUploader = multerS3({
  s3,
  bucket: "cloud-wetube/videos",
  acl: "public-read",
});

const s3VideoUploader = multerS3({
  s3,
  bucket: "cloud-wetube/videos",
  acl: "public-read",
});

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.userInfo = req.session.user || {};
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    req.flash("error", "Log in first!");
    res.redirect("/login");
  } else next();
};
export const publicOnlyMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    req.flash("error", "Not authorized!");
    return res.redirect("/");
  } else next();
};

export const avatarUpload = multer({
  dest: "uploads/avatar/",
  limits: {
    fileSize: 3000000,
  },
  storage: s3ImageUploader,
});
export const videoUpload = multer({
  dest: "uploads/video/",
  limits: {
    fileSize: 10000000,
  },
  storage: s3VideoUploader,
});

export const idTypeCheck = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(404)
      .render("404", { pageTitle: "404 ID value is incorrect." });
  } else next();
};
