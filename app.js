// --- STATIC FALLBACK DATABASE ---
const fallbackSongs = [
  {
    id: "fb_1",
    title: "Midnight Vibe",
    artist: "Lofi Codex",
    album: "Study Session Vol. 1",
    genre: "Lofi",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: "fb_2",
    title: "Retro Horizon",
    artist: "Synthwave Project",
    album: "Grid Runner",
    genre: "Electronic",
    cover: "https://images.unsplash.com/photo-1515462277126-270d878326e5?w=300&auto=format&fit=crop&q=80",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  }
];

// --- APP STATE ---
let songDatabase = [...fallbackSongs];
let currentTrackList = [...songDatabase];
let currentSongIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let likedSongs = new Set(JSON.parse(localStorage.getItem('likedSongs')) || []);
let purchasedRingtones = new Set(JSON.parse(localStorage.getItem('purchasedRingtones')) || []);
let purchasedRingtonesTrimTimes = JSON.parse(localStorage.getItem('purchasedRingtonesTrimTimes')) || {};
let currentLyrics = [];
let adTimeRemaining = 15;
let adTimerInterval = null;
let activeSongToPurchase = null;

// YouTube states
let ytPlayer = null;
let isYTReady = false;
let progressInterval = null;

// Trimmer states
let trimStartTime = 0;
let isPreviewingTrim = false;

// --- DOM ELEMENTS ---
const audio = document.getElementById("audio-engine");
const adOverlay = document.getElementById("ad-overlay");
const btnContinueApp = document.getElementById("btn-continue-app");
const adProgressFill = document.getElementById("ad-progress-fill");
const adTimerText = document.getElementById("ad-timer-text");

const viewHome = document.getElementById("view-home");
const viewSearch = document.getElementById("view-search");
const viewLibrary = document.getElementById("view-library");
const searchInput = document.getElementById("search-bar");

const navHome = document.getElementById("nav-home");
const navSearch = document.getElementById("nav-search");
const navLibrary = document.getElementById("nav-library");

const homeTrackListContainer = document.getElementById("home-track-list");
const searchResultsContainer = document.getElementById("search-results-list");
const libraryRingtonesContainer = document.getElementById("library-ringtones-list");
const libraryLikedContainer = document.getElementById("library-liked-list");

// Player elements
const playerAlbumArt = document.getElementById("player-album-art");
const playerTrackTitle = document.getElementById("player-track-title");
const playerTrackArtist = document.getElementById("player-track-artist");
const btnPlay = document.getElementById("btn-play");
const playIcon = document.getElementById("play-icon");
const pauseIcon = document.getElementById("pause-icon");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const btnShuffle = document.getElementById("btn-shuffle");
const btnRepeat = document.getElementById("btn-repeat");
const btnLikeCurrent = document.getElementById("btn-like-current");
const btnPlayerRingtone = document.getElementById("btn-player-ringtone");

const timeline = document.getElementById("player-timeline");
const timelineProgress = document.getElementById("player-timeline-progress");
const timeCurrent = document.getElementById("player-time-current");
const timeDuration = document.getElementById("player-time-duration");
const volumeSlider = document.getElementById("player-volume");
const volumeProgress = document.getElementById("player-volume-progress");

// Tab and panel elements
const tabLyrics = document.getElementById("tab-lyrics");
const tabQueue = document.getElementById("tab-queue");
const paneLyrics = document.getElementById("pane-lyrics");
const paneQueue = document.getElementById("pane-queue");

// Modals
const paymentModal = document.getElementById("payment-modal");
const btnPaymentClose = document.getElementById("btn-payment-close");
const paymentSongName = document.getElementById("payment-song-name");
const tabUpi = document.getElementById("tab-upi");
const tabCard = document.getElementById("tab-card");
const paneUpi = document.getElementById("pane-upi");
const paneCard = document.getElementById("pane-card");
const qrCodeImage = document.getElementById("qr-code-image");
const btnSubmitUpi = document.getElementById("btn-submit-upi");
const btnSubmitCard = document.getElementById("btn-submit-card");
const payStepDetails = document.getElementById("pay-step-details");
const payStepProcessing = document.getElementById("pay-step-processing");
const payStepSuccess = document.getElementById("pay-step-success");
const successMessage = document.getElementById("success-message");
const btnDownloadRingtone = document.getElementById("btn-download-ringtone");
const btnSuccessDone = document.getElementById("btn-success-done");
const toastContainer = document.getElementById("toast-container");

// Trimmer elements
const trimSlider = document.getElementById("trim-slider");
const trimRangeDisplay = document.getElementById("trim-range-display");
const btnPreviewTrim = document.getElementById("btn-preview-trim");
const btnPreviewTrimText = document.getElementById("btn-preview-trim-text");

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  startStartupAd();
  setupEventListeners();
  updateLibraryView();
  
  // Set default volume
  audio.volume = 0.7;

  // Load YouTube IFrame API script dynamically
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // Load trending music from API on startup
  initAppMusic();
});

// --- YOUTUBE PLAYER BOOTSTRAP ---
window.onYouTubeIframeAPIReady = function() {
  ytPlayer = new YT.Player('youtube-player-container', {
    height: '1',
    width: '1',
    videoId: '',
    playerVars: {
      'playsinline': 1,
      'controls': 0,
      'disablekb': 1,
      'fs': 0,
      'rel': 0,
      'origin': window.location.origin
    },
    events: {
      'onReady': () => {
        isYTReady = true;
        console.log("YouTube Background Player API Ready");
      },
      'onStateChange': onYTPlayerStateChange
    }
  });
};

function onYTPlayerStateChange(event) {
  // YT.PlayerState.ENDED = 0, PLAYING = 1, PAUSED = 2
  if (event.data === YT.PlayerState.ENDED) {
    if (isRepeat) {
      ytPlayer.seekTo(0);
      ytPlayer.playVideo();
    } else {
      skipNext();
    }
  }
}

// --- API SEARCH UTILITY ---
async function fetchFromiTunes(query, limit = 30) {
  try {
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=${limit}`);
    const data = await response.json();
    
    return data.results.map(item => {
      const hdCover = item.artworkUrl100 
        ? item.artworkUrl100.replace("100x100bb.jpg", "500x500bb.jpg") 
        : "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80";

      return {
        id: String(item.trackId),
        title: item.trackName,
        artist: item.artistName,
        album: item.collectionName || "Single",
        cover: hdCover,
        url: item.previewUrl,
        lyrics: generateSimulatedLyrics(item.trackName, item.artistName)
      };
    }).filter(track => track.url);
  } catch (error) {
    console.error("iTunes API error:", error);
    return [];
  }
}

function generateSimulatedLyrics(title, artist) {
  return [
    { time: 0, text: `[Playing: ${title}]` },
    { time: 4, text: `Artist: ${artist}` },
    { time: 8, text: "[Melodic Music intro playing...]" },
    { time: 13, text: "Welcome to Spotify Glass Premium!" },
    { time: 20, text: "Listen to the FULL song streamed directly from YouTube." },
    { time: 27, text: "Click the 🔔 Set Ringtone button to trim any 30s window!" },
    { time: 35, text: "Adjust the start time slider inside the payment modal." },
    { time: 45, text: "Thank you for watching the sponsor ad to support free streaming." },
    { time: 60, text: "[Guitar/Sitar solo playing...]" },
    { time: 85, text: "Enjoy your custom ringtone download after activation!" },
    { time: 120, text: "[Outro Beats]" }
  ];
}

async function initAppMusic() {
  const categories = ["Diljit Dosanjh", "Trending Hindi", "Haryanvi Hits", "Arijit Singh Hits"];
  let loadedTracks = [];
  
  try {
    const fetchPromises = categories.map(cat => fetchFromiTunes(cat, 5));
    const results = await Promise.all(fetchPromises);
    results.forEach(res => {
      loadedTracks = [...loadedTracks, ...res];
    });
  } catch (err) {
    console.error("Failed to load initial music from API:", err);
  }

  loadedTracks.sort(() => Math.random() - 0.5);

  if (loadedTracks.length > 0) {
    songDatabase = loadedTracks;
  } else {
    songDatabase = [...fallbackSongs];
  }

  currentTrackList = [...songDatabase];
  renderTracksList(songDatabase, homeTrackListContainer);
  
  currentSongIndex = 0;
  updatePlayerBar();
  renderLyrics();
  updateQueueView();
}

// --- AD SYSTEM ---
function startStartupAd() {
  adOverlay.style.display = "flex";
  adTimeRemaining = 15;
  btnContinueApp.disabled = true;
  btnContinueApp.classList.remove("active");
  btnContinueApp.innerText = `Continue to App (15s)`;
  adProgressFill.style.width = "0%";
  adTimerText.innerText = "Please wait 15 seconds to continue.";

  setTimeout(() => {
    adProgressFill.style.transition = "width 15s linear";
    adProgressFill.style.width = "100%";
  }, 100);

  adTimerInterval = setInterval(() => {
    adTimeRemaining--;
    if (adTimeRemaining > 0) {
      btnContinueApp.innerText = `Continue to App (${adTimeRemaining}s)`;
    } else {
      clearInterval(adTimerInterval);
      btnContinueApp.disabled = false;
      btnContinueApp.classList.add("active");
      btnContinueApp.innerText = "Continue to App";
      adTimerText.innerText = "Sponsor message finished. You can now enter the app!";
    }
  }, 1000);
}

function dismissStartupAd() {
  if (adTimeRemaining <= 0) {
    adOverlay.style.opacity = 0;
    setTimeout(() => {
      adOverlay.style.display = "none";
      showToast("Welcome to Spotify Glass!");
    }, 400);
  }
}

// --- NAVIGATION SYSTEM ---
function switchView(viewName) {
  [viewHome, viewSearch, viewLibrary].forEach(view => view.classList.remove("active"));
  [navHome, navSearch, navLibrary].forEach(nav => nav.classList.remove("active"));

  if (viewName === "home") {
    viewHome.classList.add("active");
    navHome.classList.add("active");
  } else if (viewName === "search") {
    viewSearch.classList.add("active");
    navSearch.classList.add("active");
  } else if (viewName === "library") {
    viewLibrary.classList.add("active");
    navLibrary.classList.add("active");
    updateLibraryView();
  }
}

// --- DYNAMIC RENDERING ---
function renderTracksList(tracks, container) {
  container.innerHTML = "";
  
  if (tracks.length === 0) {
    container.innerHTML = `<div style="color: var(--text-muted); padding: 24px; text-align: center;">No tracks found.</div>`;
    return;
  }

  tracks.forEach((track, index) => {
    const isCurrent = currentTrackList[currentSongIndex] && currentTrackList[currentSongIndex].id === track.id && isPlaying;
    const isUnlocked = purchasedRingtones.has(track.id);

    const row = document.createElement("div");
    row.className = `track-row ${isCurrent ? 'active' : ''}`;
    row.dataset.songId = track.id;

    row.innerHTML = `
      <div class="track-index">${index + 1}</div>
      <div class="track-info">
        <img class="track-cover" src="${track.cover}" alt="${track.title}">
        <div class="track-detail-text">
          <span class="track-title">${track.title}</span>
          <span class="track-artist">${track.artist}</span>
        </div>
      </div>
      <div class="track-album">${track.album}</div>
      <div class="track-duration">Full Song</div>
      <div class="track-actions" onclick="event.stopPropagation();">
        <button class="btn-ringtone ${isUnlocked ? 'unlocked' : ''}" onclick="openPaymentModal('${track.id}')">
          <svg viewBox="0 0 24 24">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
          <span>${isUnlocked ? 'Download Ringtone' : 'Set Ringtone ₹19'}</span>
        </button>
      </div>
    `;

    row.addEventListener("click", () => {
      currentTrackList = [...tracks];
      currentSongIndex = index;
      loadAndPlayTrack();
    });

    container.appendChild(row);
  });
}

async function loadCategory(genre) {
  let apiQuery = "";
  let displayTitle = "";
  let displayDesc = "";

  switch (genre) {
    case 'Punjabi':
      apiQuery = "Diljit Dosanjh Karan Aujla AP Dhillon Shubh";
      displayTitle = "Latest Punjabi Hits";
      displayDesc = "The ultimate bhangra, beats, and punjabi pop trends. Play full songs & trim ringtones.";
      break;
    case 'Retro':
      apiQuery = "Kishore Kumar Lata Mangeshkar RD Burman Rafi";
      displayTitle = "Retro Classics (60s, 70s & 80s)";
      displayDesc = "Timeless melodies from the golden era of Indian music. Select any 30s cut.";
      break;
    case 'Bollywood':
      apiQuery = "Alka Yagnik Kumar Sanu Udit Narayan 90s bollywood";
      displayTitle = "90s Bollywood Hits";
      displayDesc = "The melodious romantic decade of Hindi cinema. Play full length tracks.";
      break;
    case 'Haryanvi':
      apiQuery = "Sapna Choudhary Raju Haryanvi Hits";
      displayTitle = "Latest Haryanvi Beats";
      displayDesc = "High bass and local rhythmic hooks. Trimmable ringtone activation.";
      break;
  }

  const heroTitle = document.getElementById("hero-title");
  const heroDesc = document.getElementById("hero-desc");
  heroTitle.innerText = displayTitle;
  heroDesc.innerText = displayDesc;

  homeTrackListContainer.innerHTML = `<div class="spinner" style="margin: 40px auto;"></div>`;

  const results = await fetchFromiTunes(apiQuery, 20);
  
  if (results.length > 0) {
    songDatabase = results;
    currentTrackList = [...songDatabase];
    renderTracksList(songDatabase, homeTrackListContainer);
    currentSongIndex = 0;
    loadAndPlayTrack();
  } else {
    homeTrackListContainer.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 20px;">Could not load playlist items. Check connection.</div>`;
  }
  switchView("home");
}

function updateLibraryView() {
  const likedTracks = currentTrackList.filter(t => likedSongs.has(t.id));
  renderTracksList(likedTracks, libraryLikedContainer);

  libraryRingtonesContainer.innerHTML = "";
  const purchasedSongs = [];
  
  purchasedRingtones.forEach(id => {
    let song = songDatabase.find(s => s.id === id);
    if (!song) song = fallbackSongs.find(s => s.id === id);
    if (song) {
      purchasedSongs.push(song);
    }
  });

  if (purchasedSongs.length === 0) {
    libraryRingtonesContainer.innerHTML = `
      <div style="color: var(--text-muted); font-size: 0.9rem; padding: 24px; text-align: center; border: 1px dashed var(--glass-border); border-radius: 12px;">
        You haven't unlocked any ringtones yet. Unlock songs for ₹19 INR to see them here!
      </div>
    `;
    return;
  }

  purchasedSongs.forEach(track => {
    const startS = purchasedRingtonesTrimTimes[track.id] || 0;
    const ringtoneCard = document.createElement("div");
    ringtoneCard.className = "unlocked-item";
    ringtoneCard.innerHTML = `
      <div class="unlocked-item-info">
        <img src="${track.cover}" alt="${track.title}">
        <div class="track-detail-text">
          <span class="track-title" style="font-size: 0.85rem;">${track.title}</span>
          <span class="track-artist" style="font-size: 0.75rem;">${track.artist}</span>
          <span style="font-size: 0.7rem; color: var(--cyan-accent); font-weight: bold; margin-top: 2px;">
            🔔 Ringtone Cut: ${formatTime(startS)} - ${formatTime(startS + 30)}
          </span>
        </div>
      </div>
      <div class="unlocked-actions">
        <button class="btn-mini" onclick="playMockRingtonePreview('${track.id}')">
          <svg viewBox="0 0 24 24" style="width: 12px; height: 12px; fill: #fff;"><path d="M8 5v14l11-7z"/></svg>
          <span>Play Preview</span>
        </button>
        <a class="btn-mini btn-mini-download" href="${track.url}" download="${track.title} Ringtone.mp3" style="text-decoration: none;">
          <svg viewBox="0 0 24 24" style="width: 12px; height: 12px; fill: #000;"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg>
          <span>Download MP3</span>
        </a>
      </div>
    `;
    libraryRingtonesContainer.appendChild(ringtoneCard);
  });
}

function playMockRingtonePreview(songId) {
  let song = songDatabase.find(s => s.id === songId);
  if (!song) song = fallbackSongs.find(s => s.id === songId);
  if (!song) return;

  const startS = purchasedRingtonesTrimTimes[songId] || 0;

  // Pause everything else
  audio.pause();
  if (isYTReady && ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo();

  if (isYTReady && ytPlayer && ytPlayer.loadPlaylist) {
    const query = `${song.title} ${song.artist} audio`;
    ytPlayer.loadPlaylist({
      list: query,
      listType: 'search',
      index: 0,
      startSeconds: startS
    });
    isPlaying = true;
    isPreviewingTrim = true;
    trimStartTime = startS;
    btnPreviewTrimText.innerText = "Stop Trim Preview";
    updatePlayerBar();
  } else {
    audio.src = song.url;
    audio.currentTime = 0;
    audio.play();
    isPlaying = true;
    updatePlayerBar();
  }
  showToast(`Playing 30s preview for ${song.title} ringtone...`);
}

// --- MUSIC PLAYBACK CONTROL ENGINE ---
function loadAndPlayTrack() {
  const currentSong = currentTrackList[currentSongIndex];
  if (!currentSong) return;

  // Stop previous polling
  if (progressInterval) clearInterval(progressInterval);
  audio.pause();

  // If YouTube Player API is loaded, play full track via search index cue
  if (isYTReady && ytPlayer && ytPlayer.loadPlaylist) {
    const searchQuery = `${currentSong.title} ${currentSong.artist} audio`;
    
    try {
      ytPlayer.loadPlaylist({
        list: searchQuery,
        listType: 'search',
        index: 0,
        startSeconds: 0
      });
      isPlaying = true;
      updatePlayerBar();
      updateQueueView();
      renderLyrics();
      
      // Start timeline update interval
      progressInterval = setInterval(trackPlaybackProgress, 500);
    } catch (e) {
      console.warn("YouTube play failed, falling back to Audio:", e);
      fallbackToHtmlAudio(currentSong);
    }
  } else {
    fallbackToHtmlAudio(currentSong);
  }

  renderTracksList(currentTrackList, homeTrackListContainer);
  updateLibraryView();
}

function fallbackToHtmlAudio(track) {
  audio.src = track.url;
  audio.load();
  audio.play()
    .then(() => {
      isPlaying = true;
      updatePlayerBar();
      updateQueueView();
      renderLyrics();
      progressInterval = setInterval(trackPlaybackProgress, 500);
    })
    .catch(err => {
      console.error("Audio engine failed entirely:", err);
      isPlaying = false;
      updatePlayerBar();
    });
}

function trackPlaybackProgress() {
  let cur = 0;
  let dur = 0;

  if (isYTReady && ytPlayer && ytPlayer.getPlayerState && ytPlayer.getPlayerState() === YT.PlayerState.PLAYING && !audio.paused === false) {
    cur = ytPlayer.getCurrentTime() || 0;
    dur = ytPlayer.getDuration() || 180; // default 3m if not ready
  } else {
    cur = audio.currentTime || 0;
    dur = audio.duration || 30;
  }

  // Handle trim preview boundary check
  if (isPreviewingTrim && cur >= trimStartTime + 30) {
    stopTrimPreview();
    return;
  }

  if (dur) {
    const progressPercent = (cur / dur) * 100;
    timelineProgress.style.width = `${progressPercent}%`;
    timeCurrent.innerText = formatTime(cur);
    timeDuration.innerText = formatTime(dur);
    updateLyricsHighlight(cur);
  }
}

function togglePlay() {
  const currentSong = currentTrackList[currentSongIndex];
  if (!currentSong) {
    if (currentTrackList.length > 0) {
      currentSongIndex = 0;
      loadAndPlayTrack();
    }
    return;
  }

  if (isPlaying) {
    if (isYTReady && ytPlayer && ytPlayer.pauseVideo) {
      ytPlayer.pauseVideo();
    }
    audio.pause();
    isPlaying = false;
  } else {
    if (isYTReady && ytPlayer && ytPlayer.playVideo) {
      ytPlayer.playVideo();
    } else {
      audio.play().catch(() => {});
    }
    isPlaying = true;
  }
  updatePlayerBar();
}

function updatePlayerBar() {
  const currentSong = currentTrackList[currentSongIndex];
  if (!currentSong) return;

  playerAlbumArt.src = currentSong.cover;
  playerTrackTitle.innerText = currentSong.title;
  playerTrackArtist.innerText = currentSong.artist;

  if (isPlaying) {
    playIcon.style.display = "none";
    pauseIcon.style.display = "block";
  } else {
    playIcon.style.display = "block";
    pauseIcon.style.display = "none";
  }

  if (likedSongs.has(currentSong.id)) {
    btnLikeCurrent.classList.add("liked");
  } else {
    btnLikeCurrent.classList.remove("liked");
  }

  if (purchasedRingtones.has(currentSong.id)) {
    btnPlayerRingtone.querySelector("span").innerText = "Download Ringtone";
    btnPlayerRingtone.style.background = "linear-gradient(135deg, var(--spotify-green) 0%, #158f3f 100%)";
  } else {
    btnPlayerRingtone.querySelector("span").innerText = "Set Ringtone ₹19";
    btnPlayerRingtone.style.background = "linear-gradient(135deg, var(--premium-purple) 0%, #7b2cbf 100%)";
  }
}

function skipNext() {
  if (isShuffle) {
    currentSongIndex = Math.floor(Math.random() * currentTrackList.length);
  } else {
    currentSongIndex = (currentSongIndex + 1) % currentTrackList.length;
  }
  loadAndPlayTrack();
}

function skipPrev() {
  let cur = (isYTReady && ytPlayer && ytPlayer.getCurrentTime) ? ytPlayer.getCurrentTime() : audio.currentTime;
  if (cur > 3) {
    if (isYTReady && ytPlayer && ytPlayer.seekTo) ytPlayer.seekTo(0);
    audio.currentTime = 0;
  } else {
    currentSongIndex = (currentSongIndex - 1 + currentTrackList.length) % currentTrackList.length;
    loadAndPlayTrack();
  }
}

// --- RINGTONE TRIMMER CONTROLS ---
function startTrimPreview() {
  if (!activeSongToPurchase) return;

  // Stop active playback first
  audio.pause();
  if (isYTReady && ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo();

  isPreviewingTrim = true;
  btnPreviewTrimText.innerText = "Stop Preview";

  if (isYTReady && ytPlayer && ytPlayer.loadPlaylist) {
    const query = `${activeSongToPurchase.title} ${activeSongToPurchase.artist} audio`;
    ytPlayer.loadPlaylist({
      list: query,
      listType: 'search',
      index: 0,
      startSeconds: trimStartTime
    });
    isPlaying = true;
  } else {
    audio.src = activeSongToPurchase.url;
    audio.currentTime = trimStartTime;
    audio.play().catch(() => {});
    isPlaying = true;
  }
  updatePlayerBar();
  showToast(`Previewing 30s ringtone from ${formatTime(trimStartTime)}...`);
}

function stopTrimPreview() {
  isPreviewingTrim = false;
  btnPreviewTrimText.innerText = "Preview 30s Ringtone Trim";

  if (isYTReady && ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo();
  audio.pause();
  isPlaying = false;
  updatePlayerBar();
  showToast("Preview stopped.");
}

// --- DYNAMIC LYRICS & QUEUE ---
function renderLyrics() {
  const currentSong = currentTrackList[currentSongIndex];
  paneLyrics.innerHTML = "";
  
  if (!currentSong || !currentSong.lyrics) {
    paneLyrics.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding-top: 40px;">Lyrics unavailable.</div>`;
    return;
  }

  currentLyrics = currentSong.lyrics;
  currentLyrics.forEach((lyric, index) => {
    const line = document.createElement("div");
    line.className = "lyrics-line";
    line.id = `lyric-line-${index}`;
    line.innerText = lyric.text;
    paneLyrics.appendChild(line);
  });
}

function updateLyricsHighlight(time) {
  if (currentLyrics.length === 0) return;

  let activeIndex = -1;
  for (let i = 0; i < currentLyrics.length; i++) {
    if (time >= currentLyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  if (activeIndex !== -1) {
    const allLines = paneLyrics.querySelectorAll(".lyrics-line");
    allLines.forEach(l => l.classList.remove("active"));

    const activeLine = document.getElementById(`lyric-line-${activeIndex}`);
    if (activeLine && !activeLine.classList.contains("active")) {
      activeLine.classList.add("active");
      
      const paneHeight = paneLyrics.clientHeight;
      const offsetTop = activeLine.offsetTop;
      paneLyrics.scrollTo({
        top: offsetTop - paneHeight / 2,
        behavior: 'smooth'
      });
    }
  }
}

function updateQueueView() {
  paneQueue.innerHTML = "";
  if (currentTrackList.length <= 1) {
    paneQueue.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding-top: 40px;">Queue is empty.</div>`;
    return;
  }

  let count = 0;
  for (let i = 1; i <= currentTrackList.length; i++) {
    const idx = (currentSongIndex + i) % currentTrackList.length;
    if (idx === currentSongIndex) break;

    const track = currentTrackList[idx];
    const qItem = document.createElement("div");
    qItem.className = "queue-item";
    qItem.innerHTML = `
      <img src="${track.cover}" alt="${track.title}">
      <div style="flex: 1; display: flex; flex-direction: column;">
        <span style="font-weight: 600;">${track.title}</span>
        <span style="color: var(--text-muted); font-size: 0.7rem;">${track.artist}</span>
      </div>
    `;
    paneQueue.appendChild(qItem);
    
    count++;
    if (count >= 5) break;
  }
}

// --- SEARCH & FILTER LOGIC ---
async function filterSearch(query) {
  if (!query) {
    searchResultsContainer.innerHTML = `
      <div style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 40px 0;">
        Type in the search bar above to look for tracks or artists.
      </div>
    `;
    return;
  }

  searchResultsContainer.innerHTML = `<div class="spinner" style="margin: 40px auto;"></div>`;

  const results = await fetchFromiTunes(query, 25);
  
  if (results.length === 0) {
    searchResultsContainer.innerHTML = `
      <div style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 40px 0;">
        No results found for "${query}" on Apple Music. Try searching different keywords.
      </div>
    `;
    return;
  }

  renderTracksList(results, searchResultsContainer);
}

// --- RINGTONE PURCHASE & MONETIZATION FLOW ---
function openPaymentModal(songId) {
  let song = currentTrackList.find(s => s.id === songId);
  if (!song) song = songDatabase.find(s => s.id === songId);
  if (!song) song = fallbackSongs.find(s => s.id === songId);
  if (!song) return;

  activeSongToPurchase = song;

  // Trigger download if already unlocked
  if (purchasedRingtones.has(songId)) {
    triggerDownload(song);
    return;
  }

  // Determine song duration to configure trimmer slider bounds
  let trackDuration = 180; // default 3 minutes fallback
  if (isYTReady && ytPlayer && ytPlayer.getDuration && ytPlayer.getDuration() > 0) {
    // If it's the current song playing on YouTube, get its actual duration
    const currentSong = currentTrackList[currentSongIndex];
    if (currentSong && currentSong.id === songId) {
      trackDuration = ytPlayer.getDuration();
    }
  } else if (!isNaN(audio.duration) && audio.src === song.url) {
    trackDuration = audio.duration;
  }

  // Setup Trimmer bounds (Ringtone is exactly 30s, so max start is duration - 30)
  const maxStart = Math.max(0, Math.floor(trackDuration - 30));
  trimSlider.max = maxStart;
  trimSlider.value = 0;
  trimStartTime = 0;
  trimRangeDisplay.innerText = `0:00 - 0:30`;

  // Set modal text configurations
  paymentSongName.innerText = `Configure "${song.title}" as your phone ringtone`;
  successMessage.innerText = `The premium 30-second ringtone cut for "${song.title}" by ${song.artist} has been activated successfully! You can download the MP3 directly, or manage it in your library.`;
  btnDownloadRingtone.href = song.url;
  btnDownloadRingtone.setAttribute("download", `${song.title} Ringtone.mp3`);

  // Build UPI QR Code link
  const upiUrl = `upi://pay?pa=antigravity@ybl&pn=Antigravity&am=19&cu=INR&tn=Ringtone_${song.id}`;
  qrCodeImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiUrl)}`;

  // Reset steps
  payStepDetails.style.display = "block";
  payStepProcessing.style.display = "none";
  payStepSuccess.style.display = "none";

  paymentModal.classList.add("open");
}

function processSimulatedPayment() {
  if (!activeSongToPurchase) return;

  payStepDetails.style.display = "none";
  payStepProcessing.style.display = "flex";

  // Simulate payment confirmation delay
  setTimeout(() => {
    payStepProcessing.style.display = "none";
    payStepSuccess.style.display = "flex";
    
    // Save unlocked states
    purchasedRingtones.add(activeSongToPurchase.id);
    purchasedRingtonesTrimTimes[activeSongToPurchase.id] = trimStartTime;

    localStorage.setItem('purchasedRingtones', JSON.stringify(Array.from(purchasedRingtones)));
    localStorage.setItem('purchasedRingtonesTrimTimes', JSON.stringify(purchasedRingtonesTrimTimes));
    
    // Update success screen details with specific trim details
    const endSec = trimStartTime + 30;
    successMessage.innerText = `The premium 30-second ringtone cut (${formatTime(trimStartTime)} - ${formatTime(endSec)}) for "${activeSongToPurchase.title}" by ${activeSongToPurchase.artist} has been unlocked successfully!`;
    
    showToast(`Successfully purchased "${activeSongToPurchase.title}" ringtone!`, true);
    
    // Refresh interfaces
    renderTracksList(currentTrackList, homeTrackListContainer);
    if (viewSearch.classList.contains("active")) {
      const term = searchInput.value.toLowerCase().trim();
      if (term) filterSearch(term);
    }
    updateLibraryView();
    updatePlayerBar();
  }, 2200);
}

function triggerDownload(song) {
  const startS = purchasedRingtonesTrimTimes[song.id] || 0;
  showToast(`Downloading ringtone cut (${formatTime(startS)} - ${formatTime(startS+30)}) for ${song.title}...`, true);
  const a = document.createElement('a');
  a.href = song.url;
  a.download = `${song.title} Ringtone.mp3`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// --- TOAST SYSTEM ---
function showToast(message, isSuccess = true) {
  const toast = document.createElement("div");
  toast.className = `toast ${isSuccess ? 'toast-success' : ''}`;
  
  toast.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="${isSuccess ? 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' : 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-12S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'}"/>
    </svg>
    <span class="toast-message">${message}</span>
  `;

  toastContainer.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 50);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// --- EVENT LISTENERS SETUP ---
function setupEventListeners() {
  btnContinueApp.addEventListener("click", dismissStartupAd);

  navHome.addEventListener("click", () => switchView("home"));
  navSearch.addEventListener("click", () => switchView("search"));
  navLibrary.addEventListener("click", () => switchView("library"));

  searchInput.addEventListener("input", async (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query.length > 0) {
      switchView("search");
      await filterSearch(query);
    } else {
      switchView("home");
    }
  });

  // Timeline seeking click listener
  timeline.addEventListener("click", (e) => {
    const rect = timeline.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.min(Math.max(clickX / rect.width, 0), 1);

    let dur = 0;
    if (isYTReady && ytPlayer && ytPlayer.getDuration && ytPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
      dur = ytPlayer.getDuration() || 180;
      ytPlayer.seekTo(percent * dur, true);
    } else {
      dur = audio.duration || 30;
      audio.currentTime = percent * dur;
    }
  });

  // Volume bar click listener
  volumeSlider.addEventListener("click", (e) => {
    const rect = volumeSlider.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
    
    if (isYTReady && ytPlayer && ytPlayer.setVolume) {
      ytPlayer.setVolume(percent * 100);
    }
    audio.volume = percent;
    volumeProgress.style.width = `${percent * 100}%`;
    showToast(`Volume: ${Math.round(percent * 100)}%`);
  });

  // Trimmer slider input listener
  trimSlider.addEventListener("input", (e) => {
    trimStartTime = parseInt(e.target.value);
    const end = trimStartTime + 30;
    trimRangeDisplay.innerText = `${formatTime(trimStartTime)} - ${formatTime(end)}`;
    
    if (isPreviewingTrim) {
      stopTrimPreview();
    }
  });

  // Trimmer preview button listener
  btnPreviewTrim.addEventListener("click", () => {
    if (isPreviewingTrim) {
      stopTrimPreview();
    } else {
      startTrimPreview();
    }
  });

  // Playback control button listeners
  btnPlay.addEventListener("click", togglePlay);
  btnNext.addEventListener("click", skipNext);
  btnPrev.addEventListener("click", skipPrev);
  btnLikeCurrent.addEventListener("click", toggleLikeCurrent);

  btnShuffle.addEventListener("click", () => {
    isShuffle = !isShuffle;
    btnShuffle.classList.toggle("active", isShuffle);
    showToast(isShuffle ? "Shuffle On" : "Shuffle Off");
  });

  btnRepeat.addEventListener("click", () => {
    isRepeat = !isRepeat;
    btnRepeat.classList.toggle("active", isRepeat);
    showToast(isRepeat ? "Repeat Track On" : "Repeat Off");
  });

  btnPlayerRingtone.addEventListener("click", () => {
    const currentSong = currentTrackList[currentSongIndex];
    if (currentSong) {
      openPaymentModal(currentSong.id);
    } else {
      showToast("Play a song first!", false);
    }
  });

  // Sidebar right tabs toggle
  tabLyrics.addEventListener("click", () => {
    tabLyrics.classList.add("active");
    tabQueue.classList.remove("active");
    paneLyrics.style.display = "flex";
    paneQueue.style.display = "none";
  });

  tabQueue.addEventListener("click", () => {
    tabQueue.classList.add("active");
    tabLyrics.classList.remove("active");
    paneQueue.style.display = "flex";
    paneLyrics.style.display = "none";
    updateQueueView();
  });

  // Payment modal tabs
  tabUpi.addEventListener("click", () => {
    tabUpi.classList.add("active");
    tabCard.classList.remove("active");
    paneUpi.classList.add("active");
    paneCard.classList.remove("active");
  });

  tabCard.addEventListener("click", () => {
    tabCard.classList.add("active");
    tabUpi.classList.remove("active");
    paneCard.classList.add("active");
    paneUpi.classList.remove("active");
  });

  // Submissions
  btnSubmitUpi.addEventListener("click", processSimulatedPayment);
  btnSubmitCard.addEventListener("click", processSimulatedPayment);
  
  // Closes
  btnPaymentClose.addEventListener("click", () => {
    stopTrimPreview();
    paymentModal.classList.remove("open");
  });

  btnSuccessDone.addEventListener("click", () => {
    stopTrimPreview();
    paymentModal.classList.remove("open");
  });

  paymentModal.addEventListener("click", (e) => {
    if (e.target === paymentModal) {
      stopTrimPreview();
      paymentModal.classList.remove("open");
    }
  });
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
