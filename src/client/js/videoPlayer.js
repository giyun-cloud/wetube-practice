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

const formatTime = (sec, currentTimeIs) => {
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
const setTimeoutShowing = () => {
  videoControls.classList.remove("showing");
};

playBtn.addEventListener("click", () => {
  video.paused ? video.play() : video.pause();
  playBtnIcon.className = video.paused ? "fas fa-play" : "fas fa-pause";
});

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

video.addEventListener("loadedmetadata", () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  currentTime.innerText = currentTime.innerText.substr(8 - timeLength);
  timeLine.max = Math.floor(video.duration * 10) / 10;
  video.addEventListener("timeupdate", () => {
    currentTime.innerText = formatTime(Math.floor(video.currentTime), true);
    timeLine.value = video.currentTime;
  });
});
video.addEventListener("mousemove", () => {
  videoControls.classList.add("showing");
  if (showingClassProcess) {
    clearTimeout(showingClassProcess);
    showingClassProcess = null;
  }
  showingClassProcess = setTimeout(setTimeoutShowing, 2000);
});
video.addEventListener("mouseleave", () => {
  showingClassProcess = setTimeout(setTimeoutShowing, 2000);
});
timeLine.addEventListener("input", (e) => {
  video.currentTime = e.target.value;
});
fullscreenBtn.addEventListener("click", () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
    fullscreenBtn.innerText = "Enter Full Screen";
  } else {
    videoContainer.requestFullscreen();
    fullscreenBtn.innerText = "Exit Full Screen";
  }
});
