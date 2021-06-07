const previewBtn = document.getElementById("previewBtn");
const startBtn = document.getElementById("startBtn");
const errorMsgEl = document.getElementById("errorMsg");
const preview = document.getElementById("preview");
let stream;
let recorder;

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  preview.srcObject = stream;
};

const handleStart = () => {
  startBtn.innerText = "Stop Recording";
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (e) => {
    const videoFile = URL.createObjectURL(e.data);
    preview.srcObject = null;
    preview.src = videoFile;
    preview.loop = true;
    preview.play();
  };
  recorder.start();
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);
  setTimeout(() => {
    recorder.stop();
  }, 10000);
};
const handleStop = () => {
  startBtn.innerText = "Start Recording";
  startBtn.removeEventListener("click", handleStop);
  startBtn.addEventListener("click", handleStart);
  recorder.stop();
};

previewBtn.addEventListener("click", () => {
  try {
    if (previewBtn.innerText === "Open Preview") {
      previewBtn.innerText = "Close Preview";
      preview.className = "";
      startBtn.className = "";
      preview.play();
    } else {
      if (startBtn.innerText === "Stop Recording") {
        return;
      }
      previewBtn.innerText = "Open Preview";
      preview.className = "display-none";
      startBtn.className = "display-none";
      preview.pause();
    }
  } catch (error) {
    errorMsgEl.innerText = "🔴" + error;
    setTimeout(() => {
      errorMsgEl.innerText = null;
    }, 2000);
  }
});
startBtn.addEventListener("click", handleStart);

init();
