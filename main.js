// Configuration
const CONFIG = {
  workMusic: "lCOF9LN_Zxs", // ID pour la vidéo Lofi
  relaxMusic: "2OEL4P1Rz04", // ID pour la musique relaxante
  defaultVolume: 50,
};

// State
let state = {
  timer: null,
  workTime: 25 * 60,
  breakTime: 5 * 60,
  timeLeft: 25 * 60,
  isRunning: false,
  isBreak: false,
  totalTimeWorked: 0,
  player: null,
  isMuted: false,
};

// DOM Elements
const elements = {
  timer: document.getElementById("timer"),
  status: document.getElementById("status"),
  startBtn: document.getElementById("start-btn"),
  pauseBtn: document.getElementById("pause-btn"),
  resetBtn: document.getElementById("reset-btn"),
  serieSelect: document.getElementById("serie-select"),
  saveBtn: document.getElementById("save-btn"),
  muteBtn: document.getElementById("mute-btn"),
  volumeUp: document.getElementById("volume-up"),
  volumeDown: document.getElementById("volume-down"),
  totalTime: document.getElementById("total-time"),
};

// Timer Functions
function updateTimerDisplay() {
  const minutes = Math.floor(state.timeLeft / 60);
  const seconds = state.timeLeft % 60;
  elements.timer.textContent = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
  elements.status.textContent = state.isBreak ? "Mode Pause" : "Mode Travail";
  elements.status.className = state.isBreak
    ? "text-xl text-center mb-4 text-blue-400"
    : "text-xl text-center mb-4 text-green-400";
}

function startTimer() {
  if (!state.isRunning) {
    state.isRunning = true;
    playMusic(state.isBreak ? CONFIG.relaxMusic : CONFIG.workMusic);

    state.timer = setInterval(() => {
      if (state.timeLeft > 0) {
        state.timeLeft--;
        if (!state.isBreak) {
          state.totalTimeWorked++;
          elements.totalTime.textContent = state.totalTimeWorked;
        }
        updateTimerDisplay();
      } else {
        clearInterval(state.timer);
        state.isRunning = false;

        if (!state.isBreak) {
          const notification = new Notification("Pomodoro", {
            body: "Pause ! Prenez un moment de repos !",
            icon: "https://example.com/icon.png",
          });
          state.timeLeft = state.breakTime;
          state.isBreak = true;
          playMusic(CONFIG.relaxMusic);
        } else {
          const notification = new Notification("Pomodoro", {
            body: "C'est reparti ! Retour au travail !",
            icon: "https://example.com/icon.png",
          });
          state.timeLeft = state.workTime;
          state.isBreak = false;
          playMusic(CONFIG.workMusic);
        }
        startTimer();
      }
    }, 1000);
  }
}

function pauseTimer() {
  clearInterval(state.timer);
  state.isRunning = false;
  if (state.player) {
    state.player.pauseVideo();
  }
}

function resetTimer() {
  clearInterval(state.timer);
  state.timeLeft = state.workTime;
  state.isBreak = false;
  state.isRunning = false;
  if (state.player) {
    state.player.stopVideo();
  }
  updateTimerDisplay();
}

// YouTube Functions
function loadYouTubeAPI() {
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
  state.player = new YT.Player("player", {
    height: "200",
    width: "100%",
    videoId: CONFIG.workMusic,
    playerVars: {
      autoplay: 0,
      controls: 1,
      loop: 1,
      rel: 0,
      showinfo: 0,
      playlist: CONFIG.workMusic,
    },
    events: {
      onReady: onPlayerReady,
    },
  });
}

function onPlayerReady(event) {
  event.target.setVolume(CONFIG.defaultVolume);
}

function playMusic(videoId) {
  if (state.player && state.player.loadVideoById) {
    state.player.loadVideoById({
      videoId: videoId,
      startSeconds: 0,
      suggestedQuality: "small",
    });

    // Vérifiez si l'utilisateur a interagi avec la page
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      state.player.playVideo();
    } else {
      document.addEventListener(
        "click",
        () => {
          state.player.playVideo();
        },
        { once: true }
      );
    }
  }
}

// Initialize
// if (Notification.permission !== "granted") {
//     Notification.requestPermission();
// }

document.addEventListener(
  "DOMContentLoaded",
  () => {
    // Initialize
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    loadYouTubeAPI();
    updateTimerDisplay();
  },
  { passive: true }
);

elements.startBtn.addEventListener("click", startTimer, { passive: true });
elements.pauseBtn.addEventListener("click", pauseTimer, { passive: true });
elements.resetBtn.addEventListener("click", resetTimer, { passive: true });
elements.saveBtn.addEventListener("click", exportStats, { passive: true });

elements.muteBtn.addEventListener(
  "click",
  () => {
    state.isMuted = !state.isMuted;
    if (state.player) {
      if (state.isMuted) {
        state.player.mute();
      } else {
        state.player.unMute();
      }
    }
  },
  { passive: true }
);

elements.volumeUp.addEventListener(
  "click",
  () => {
    if (state.player) {
      const currentVolume = state.player.getVolume();
      state.player.setVolume(Math.min(100, currentVolume + 10));
    }
  },
  { passive: true }
);

elements.volumeDown.addEventListener(
  "click",
  () => {
    if (state.player) {
      const currentVolume = state.player.getVolume();
      state.player.setVolume(Math.max(0, currentVolume - 10));
    }
  },
  { passive: true }
);

loadYouTubeAPI();
updateTimerDisplay();

function onPlayerReady(event) {
  event.target.setVolume(CONFIG.defaultVolume);
}

function playMusic(videoId) {
  if (state.player && state.player.loadVideoById) {
    state.player.loadVideoById({
      videoId: videoId,
      startSeconds: 0,
      suggestedQuality: "small",
    });
    state.player.playVideo();
  }
}

// Stats Export
function exportStats() {
  const hours = Math.floor(state.totalTimeWorked / 60);
  const minutes = state.totalTimeWorked % 60;
  const markdown = `## 🕒 Rapport de travail Pomodoro\n\n- **Temps total travaillé** : ${hours}h ${minutes}min\n- **Sessions terminées** : ${Math.floor(
    state.totalTimeWorked / state.workTime
  )}\n- **Date** : ${new Date().toLocaleDateString()}\n`;

  const blob = new Blob([markdown], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `pomodoro_stats_${new Date().toISOString().split("T")[0]}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Event Listeners
elements.serieSelect.addEventListener("change", () => {
  const selectedValue = elements.serieSelect.value;
  if (selectedValue === "25") {
    state.workTime = 25 * 60;
    state.breakTime = 5 * 60;
  } else {
    state.workTime = 50 * 60;
    state.breakTime = 10 * 60;
  }
  resetTimer();
});

elements.startBtn.addEventListener("click", startTimer);
elements.pauseBtn.addEventListener("click", pauseTimer);
elements.resetBtn.addEventListener("click", resetTimer);
elements.saveBtn.addEventListener("click", exportStats);

elements.muteBtn.addEventListener("click", () => {
  state.isMuted = !state.isMuted;
  if (state.player) {
    if (state.isMuted) {
      state.player.mute();
    } else {
      state.player.unMute();
    }
  }
});

elements.volumeUp.addEventListener("click", () => {
  if (state.player) {
    const currentVolume = state.player.getVolume();
    state.player.setVolume(Math.min(100, currentVolume + 10));
  }
});

elements.volumeDown.addEventListener("click", () => {
  if (state.player) {
    const currentVolume = state.player.getVolume();
    state.player.setVolume(Math.max(0, currentVolume - 10));
  }
});

// Initialize
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

loadYouTubeAPI();
updateTimerDisplay();
