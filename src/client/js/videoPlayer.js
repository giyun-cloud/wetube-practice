const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");

const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
let volumeRangeStore = 0.5;
video.volume = volumeRangeStore;

const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
let timeLength;

const timeLine = document.getElementById("timeLine");
const fullscreenBtn = document.getElementById("fullscreen");
const fullscreenBtnIcon = fullscreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");
let showingClassProcess = null;

const funcformatTime = (sec, currentTimeIs) => {
  if (currentTimeIs)
    return new Date(sec * 1000)
      .toISOString()
      .substr(19 - timeLength, timeLength);
  const time = new Date(sec * 1000).toISOString().substr(11, 8);
  const returnTime =
    time.indexOf("00") === 0
      ? time.indexOf(":0") === 2
        ? time.substr(4)
        : time.substr(3)
      : time;
  timeLength = returnTime.length;
  return returnTime;
};
const funcSetTimeoutShowing = () => {
  videoControls.classList.remove("showing");
};
const handlePlayVideo = () => {
  video.paused ? video.play() : video.pause();
  playBtnIcon.className = video.paused ? "fas fa-play" : "fas fa-pause";
};

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    handlePlayVideo();
  }
});
playBtn.addEventListener("click", handlePlayVideo);
muteBtn.addEventListener("click", () => {
  if (video.muted) {
    video.muted = false;
    muteBtnIcon.className = "fas fa-volume-up";
    video.volume = volumeRange.value =
      volumeRangeStore === "0" ? 0.1 : volumeRangeStore;
  } else {
    video.muted = true;
    muteBtnIcon.className = "fas fa-volume-down";
    volumeRangeStore = volumeRange.value;
    volumeRange.value = 0;
  }
});
volumeRange.addEventListener("input", (e) => {
  video.volume = e.target.value;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
});
video.addEventListener("click", handlePlayVideo);
video.addEventListener("loadedmetadata", () => {
  totalTime.innerText = funcformatTime(Math.floor(video.duration));
  currentTime.innerText = currentTime.innerText.substr(8 - timeLength);
  timeLine.max = Math.floor(video.duration * 10) / 10;
  video.addEventListener("timeupdate", () => {
    currentTime.innerText = funcformatTime(Math.floor(video.currentTime), true);
    timeLine.value = video.currentTime;
  });
});
video.addEventListener("ended", () => {
  playBtnIcon.className = "fas fa-play";
  videoControls.classList.add("showing");
  showingClassProcess = setTimeout(funcSetTimeoutShowing, 3000);
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, {
    method: "POST",
  });
});
video.addEventListener("mousemove", () => {
  videoControls.classList.add("showing");
  if (showingClassProcess) {
    clearTimeout(showingClassProcess);
    showingClassProcess = null;
  }
  showingClassProcess = setTimeout(funcSetTimeoutShowing, 2000);
});
videoContainer.addEventListener("mouseleave", () => {
  funcSetTimeoutShowing();
});
videoControls.addEventListener("mouseenter", () => {
  videoControls.classList.add("showing");
  clearTimeout(showingClassProcess);
});
timeLine.addEventListener("input", (e) => {
  video.currentTime = e.target.value;
});
fullscreenBtn.addEventListener("click", () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
    fullscreenBtnIcon.className = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullscreenBtnIcon.className = "fas fa-compress";
  }
});
