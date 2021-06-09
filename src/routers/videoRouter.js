import express from "express";
import {
  watch,
  getEdit,
  postEdit,
  getUpload,
  postUpload,
  deleteVideo,
} from "../controllers/videoController";
import { idTypeCheck, protectorMiddleware, videoUpload } from "../middlewares";

const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", idTypeCheck, watch);
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware, idTypeCheck)
  .get(getEdit)
  .post(postEdit);
videoRouter.get(
  "/:id([0-9a-f]{24})/delete",
  protectorMiddleware,
  idTypeCheck,
  deleteVideo,
);
videoRouter
  .route("/upload")
  .get(getUpload)
  .all(protectorMiddleware)
  .post(
    videoUpload.fields([
      { name: "video", maxCount: 1 },
      { name: "thumb", maxCount: 1 },
    ]),
    postUpload,
  );

export default videoRouter;
