import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const previewBtn = document.getElementById("previewBtn");
const actionBtn = document.getElementById("actionBtn");
const uiMsgEl = document.getElementById("errorMsg");
const preview = document.getElementById("preview");
let stream;
let recorder;
let videoFile;
let uiMsg1, uiMsg2, uiMsg3, setTimeout1, setTimeout2;
const filename = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  preview.srcObject = stream;
};

const eventListenerAndTextChange = (text, removeEvent, addEvent) => {
  actionBtn.innerText = text;
  actionBtn.removeEventListener("click", removeEvent);
  actionBtn.addEventListener("click", addEvent);
};
const whenDownloading = () => {
  actionBtn.disabled = true;
  uiMsgEl.innerText = "🟢Please wait. Downloading.";
  setTimeout1 = setTimeout(() => {
    uiMsgEl.innerText = "🟢Please wait. Downloading..";
    uiMsg2 = setInterval(() => {
      uiMsgEl.innerText = "🟢Please wait. Downloading..";
    }, 2100);
  }, 700);
  setTimeout2 = setTimeout(() => {
    uiMsgEl.innerText = "🟢Please wait. Downloading...";
    uiMsg3 = setInterval(() => {
      uiMsgEl.innerText = "🟢Please wait. Downloading...";
    }, 2100);
  }, 1400);
  uiMsg1 = setInterval(() => {
    uiMsgEl.innerText = "🟢Please wait. Downloading.";
  }, 2100);
};
const whenDownloadEnd = () => {
  clearTimeout(setTimeout1);
  clearTimeout(setTimeout2);
  clearInterval(uiMsg1);
  clearInterval(uiMsg2);
  clearInterval(uiMsg3);
  uiMsgEl.innerText = null;
  actionBtn.disabled = false;
};
const createElementAndClick = (url, filename) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
};

const handleStart = () => {
  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  recorder.ondataavailable = (e) => {
    videoFile = URL.createObjectURL(e.data);
    preview.srcObject = null;
    preview.src = videoFile;
    preview.loop = true;
    preview.play();
  };
  recorder.start();
  eventListenerAndTextChange("Stop Recording", handleStart, handleStop);
};
const handleStop = () => {
  recorder.stop();
  eventListenerAndTextChange("Download Recording", handleStop, handleDownload);
};
const handleDownload = async () => {
  whenDownloading();
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();
  ffmpeg.FS("writeFile", filename.input, await fetchFile(videoFile));
  await ffmpeg.run("-i", filename.input, "-r", "60", filename.output);
  await ffmpeg.run(
    "-i",
    filename.input,
    "-ss",
    "00:00:00",
    "-frames:v",
    "1",
    filename.thumb,
  );
  whenDownloadEnd();
  const mp4File = ffmpeg.FS("readFile", filename.output);
  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbnailFile = ffmpeg.FS("readFile", filename.thumb);
  const thumbnailBlob = new Blob([thumbnailFile.buffer], { type: "image/jpg" });
  const thumbnailUrl = URL.createObjectURL(thumbnailBlob);

  createElementAndClick(mp4Url, "MyRecording.mp4");
  createElementAndClick(thumbnailUrl, "MyThumbnail.jpg");

  preview.srcObject = stream;
  preview.src = null;
  preview.play();

  ffmpeg.FS("unlink", filename.input);
  ffmpeg.FS("unlink", filename.output);
  ffmpeg.FS("unlink", filename.thumb);
  URL.revokeObjectURL(videoFile);
  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbnailUrl);

  eventListenerAndTextChange("Start Recording", handleDownload, handleStart);
};

previewBtn.addEventListener("click", () => {
  try {
    if (previewBtn.innerText === "Open Preview") {
      previewBtn.innerText = "Close Preview";
      preview.className = "";
      actionBtn.className = "";
      preview.play();
    } else {
      if (actionBtn.innerText === "Stop Recording") {
        return;
      }
      previewBtn.innerText = "Open Preview";
      preview.className = "display-none";
      actionBtn.className = "display-none";
      preview.pause();
    }
  } catch (error) {
    uiMsgEl.innerText = "🔴" + error;
    setTimeout(() => {
      errorMsgEl.innerText = null;
    }, 2000);
  }
});
actionBtn.addEventListener("click", handleStart);

init();
