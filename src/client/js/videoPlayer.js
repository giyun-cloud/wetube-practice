const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volumeRange = document.getElementById("volume");
let volumeRangeStore;

playBtn.addEventListener("click", () => {
  video.paused ? video.play() : video.pause();
  playBtn.innerText = video.paused ? "Pause" : "Play";
});

muteBtn.addEventListener("click", () => {
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
    volumeRange.value = volumeRangeStore === "0" ? 0.5 : volumeRangeStore;
  } else {
    video.muted = true;
    muteBtn.innerText = "Unmute";
    volumeRangeStore = volumeRange.value;
    volumeRange.value = 0;
  }
});

volumeRange.addEventListener("input", () => {
  console.log("change");
});
