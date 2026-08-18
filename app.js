// --- DATABASE OF CURATED SONGS (REAL STREAMABLE FILES) ---
const songDatabase = [
  {
    id: "1",
    title: "Midnight Vibe",
    artist: "Lofi Codex",
    album: "Study Session Vol. 1",
    genre: "Lofi",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    lyrics: [
      { time: 0, text: "[Instrumental Intro]" },
      { time: 10, text: "Lost in the neon lights of the city..." },
      { time: 25, text: "Midnight vibe takes over my mind." },
      { time: 40, text: "Coffee cup warm, code running clean..." },
      { time: 55, text: "Floating away, standard lofi dream." },
      { time: 70, text: "[Chill Saxophone Solo]" },
      { time: 95, text: "No worries tonight, just flow." },
      { time: 120, text: "[Outro Beats]" }
    ]
  },
  {
    id: "2",
    title: "Retro Horizon",
    artist: "Synthwave Project",
    album: "Grid Runner",
    genre: "Electronic",
    cover: "https://images.unsplash.com/photo-1515462277126-270d878326e5?w=300&auto=format&fit=crop&q=80",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    lyrics: [
      { time: 0, text: "[Analog Synth Lead]" },
      { time: 15, text: "Riding the grid, out of time." },
      { time: 30, text: "Chasing the sunset on a neon highway." },
      { time: 45, text: "Digital skies, lasers in your eyes." },
      { time: 60, text: "Can you feel the frequency rising?" },
      { time: 80, text: "[Guitar Synth Harmony]" },
      { time: 110, text: "Reaching the horizon..." }
    ]
  },
  {
    id: "3",
    title: "Sunset Acoustic",
    artist: "Summer Breeze",
    album: "Coastline Acoustic",
    genre: "Acoustic",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=80",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    lyrics: [
      { time: 0, text: "[Acoustic Guitar Strumming]" },
      { time: 12, text: "Sand in our shoes, ocean in our view." },
      { time: 25, text: "Golden hours never felt this good." },
      { time: 40, text: "Singing along to the waves crashing down." },
      { time: 55, text: "Warm breeze, soft keys, no one around." },
      { time: 75, text: "[Harmonica Solo]" },
      { time: 100, text: "Leave your worries behind today." }
    ]
  },
  {
    id: "4",
    title: "Cyber City Beats",
    artist: "Neon Rider",
    album: "Metropolis 2088",
    genre: "Electronic",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    lyrics: [
      { time: 0, text: "[Synth Bass Intro]" },
      { time: 20, text: "Raindrops on the steel skyscraper." },
      { time: 35, text: "Walking through alleys, glowing blue." },
      { time: 50, text: "Hack the mainframe, unlock the gates." },
      { time: 65, text: "The future is ours, we set the pace." }
    ]
  },
  {
    id: "5",
    title: "Serenity Flow",
    artist: "Deep Meditation",
    album: "Mindfulness Ambient",
    genre: "Lofi",
    cover: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=300&auto=format&fit=crop&q=80",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    lyrics: [
      { time: 0, text: "[Soft Ambient Piano]" },
      { time: 15, text: "Take a deep breath. Let it go." },
      { time: 35, text: "In this moment, there is peace." },
      { time: 55, text: "Flow with the tide of the universe." },
      { time: 75, text: "[Wind Chimes & Soft Pad]" }
    ]
  },
  {
    id: "6",
    title: "Acoustic Whispers",
    artist: "Claire de Lune",
    album: "Rainy Day Songs",
    genre: "Acoustic",
    cover: "https://images.unsplash.com/photo-1487180142328-054b783fc471?w=300&auto=format&fit=crop&q=80",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    lyrics: [
      { time: 0, text: "[Piano & Guitar Intro]" },
      { time: 10, text: "Whispers of the wind, drops on the pane." },
      { time: 28, text: "A quiet heart in the autumn rain." },
      { time: 45, text: "We share a cup, we share a smile." },
      { time: 60, text: "Stay here with me for a little while." }
    ]
  },
  {
    id: "7",
    title: "Future Vision",
    artist: "Da Vox",
    album: "Techno Origins",
    genre: "Electronic",
    cover: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop&q=80",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    lyrics: [
      { time: 0, text: "[Tech Beat Loops]" },
      { time: 18, text: "Step into the future, feel the bass." },
      { time: 35, text: "Fast tracks, no time to waste." },
      { time: 52, text: "Visualizing the electronic dream." },
      { time: 70, text: "[High Energy Transition]" }
    ]
  },
  {
    id: "8",
    title: "Ethereal Dream",
    artist: "The Ambientist",
    album: "Infinite Spaces",
    genre: "Cinematic",
    cover: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&auto=format&fit=crop&q=80",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    lyrics: [
      { time: 0, text: "[Ethereal Choirs]" },
      { time: 20, text: "Floating in an endless sky." },
      { time: 45, text: "Stars align, passing by." },
      { time: 70, text: "Cinematic echoes of a timeless realm." },
      { time: 95, text: "[Orchestral String Swells]" }
    ]
  },
  {
    id: "9",
    title: "Vocal Harmony",
    artist: "Acoustic Duo",
    album: "Campfire Sessions",
    genre: "Acoustic",
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&auto=format&fit=crop&q=80",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    lyrics: [
      { time: 0, text: "[Dual Guitars]" },
      { time: 12, text: "Under the starlight, we start to play." },
      { time: 25, text: "Melodies that wash the dust of the day." },
      { time: 42, text: "Harmony sweet, rhythm complete." }
    ]
  },
  {
    id: "10",
    title: "Epic Ascent",
    artist: "Symphonic Echo",
    album: "Legends Unleashed",
    genre: "Cinematic",
    cover: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&auto=format&fit=crop&q=80",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    lyrics: [
      { time: 0, text: "[Epic Drum Roll]" },
      { time: 15, text: "The climb begins, steep and grand." },
      { time: 35, text: "Looking down upon the promised land." },
      { time: 55, text: "Victory is near, the path is clear." },
      { time: 75, text: "[Full Brass & Choir Peak]" }
    ]
  }
];

// --- APP STATE ---
let currentTrackList = [...songDatabase];
let currentSongIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let likedSongs = new Set(JSON.parse(localStorage.getItem('likedSongs')) || []);
let purchasedRingtones = new Set(JSON.parse(localStorage.getItem('purchasedRingtones')) || []);
let currentLyrics = [];
let adTimeRemaining = 15;
let adTimerInterval = null;
let activeSongToPurchase = null;

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

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  startStartupAd();
  renderTracksList(songDatabase, homeTrackListContainer);
  setupEventListeners();
  updateLibraryView();
  
  // Set default volume
  audio.volume = 0.7;
});

// --- AD SYSTEM ---
function startStartupAd() {
  adOverlay.style.display = "flex";
  adTimeRemaining = 15;
  btnContinueApp.disabled = true;
  btnContinueApp.classList.remove("active");
  btnContinueApp.innerText = `Continue to App (15s)`;
  adProgressFill.style.width = "0%";
  adTimerText.innerText = "Please wait 15 seconds to continue.";

  // Set timeout to force trigger layout update for smooth CSS transition
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
  // Reset all active classes
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
    const isCurrent = currentTrackList[currentSongIndex].id === track.id && isPlaying;
    const isUnlocked = purchasedRingtones.has(track.id);

    const row = document.createElement("div");
    row.className = `track-row ${isCurrent ? 'active' : ''}`;
    row.dataset.songId = track.id;

    // Track listing layout
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
      <div class="track-duration">3:02</div>
      <div class="track-actions" onclick="event.stopPropagation();">
        <button class="btn-ringtone ${isUnlocked ? 'unlocked' : ''}" onclick="openPaymentModal('${track.id}')">
          <svg viewBox="0 0 24 24">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
          <span>${isUnlocked ? 'Download Ringtone' : 'Set Ringtone ₹19'}</span>
        </button>
      </div>
    `;

    // Row click triggers audio playback
    row.addEventListener("click", () => {
      // Find the index of the track in current playlist
      const playlistIndex = currentTrackList.findIndex(t => t.id === track.id);
      if (playlistIndex !== -1) {
        currentSongIndex = playlistIndex;
        loadAndPlayTrack();
      } else {
        currentTrackList = [track];
        currentSongIndex = 0;
        loadAndPlayTrack();
      }
    });

    container.appendChild(row);
  });
}

function loadCategory(genre) {
  const filtered = songDatabase.filter(t => t.genre === genre);
  currentTrackList = filtered;
  currentSongIndex = 0;
  
  // Set hero details based on genre
  const heroTitle = document.getElementById("hero-title");
  const heroDesc = document.getElementById("hero-desc");
  heroTitle.innerText = `${genre} Playlist Hits`;
  heroDesc.innerText = `Premium selections of the finest ${genre.toLowerCase()} beats. Unlock ringtones for standard devices instantly.`;
  
  renderTracksList(filtered, homeTrackListContainer);
  loadAndPlayTrack();
  switchView("home");
}

function updateLibraryView() {
  // Liked songs grid
  const likedTracks = songDatabase.filter(t => likedSongs.has(t.id));
  renderTracksList(likedTracks, libraryLikedContainer);

  // Unlocked Ringtone elements
  libraryRingtonesContainer.innerHTML = "";
  if (purchasedRingtones.size === 0) {
    libraryRingtonesContainer.innerHTML = `
      <div style="color: var(--text-muted); font-size: 0.9rem; padding: 24px; text-align: center; border: 1px dashed var(--glass-border); border-radius: 12px;">
        You haven't unlocked any ringtones yet. Unlock songs for ₹19 INR to see them here!
      </div>
    `;
    return;
  }

  songDatabase.forEach(track => {
    if (purchasedRingtones.has(track.id)) {
      const ringtoneCard = document.createElement("div");
      ringtoneCard.className = "unlocked-item";
      ringtoneCard.innerHTML = `
        <div class="unlocked-item-info">
          <img src="${track.cover}" alt="${track.title}">
          <div class="track-detail-text">
            <span class="track-title" style="font-size: 0.85rem;">${track.title}</span>
            <span class="track-artist" style="font-size: 0.75rem;">${track.artist}</span>
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
    }
  });
}

function playMockRingtonePreview(songId) {
  const song = songDatabase.find(s => s.id === songId);
  if (song) {
    audio.src = song.url;
    audio.currentTime = 15; // start preview from 15th second for ringtone effect
    audio.play();
    isPlaying = true;
    updatePlayerBar();
    showToast(`Playing preview for ${song.title} ringtone...`);
  }
}

// --- MUSIC PLAYER CONTROLS ---
function loadAndPlayTrack() {
  const currentSong = currentTrackList[currentSongIndex];
  if (!currentSong) return;

  audio.src = currentSong.url;
  audio.load();
  audio.play()
    .then(() => {
      isPlaying = true;
      updatePlayerBar();
      updateQueueView();
      renderLyrics();
    })
    .catch(error => {
      console.error("Playback failed", error);
      isPlaying = false;
      updatePlayerBar();
    });

  // Re-render active lists to show highlights
  renderTracksList(currentTrackList, homeTrackListContainer);
  if (viewSearch.classList.contains("active")) {
    const term = searchInput.value.toLowerCase().trim();
    if (term) {
      filterSearch(term);
    }
  }
  updateLibraryView();
}

function togglePlay() {
  const currentSong = currentTrackList[currentSongIndex];
  if (!currentSong) {
    // Play first song in list
    if (currentTrackList.length > 0) {
      currentSongIndex = 0;
      loadAndPlayTrack();
    }
    return;
  }

  if (isPlaying) {
    audio.pause();
    isPlaying = false;
  } else {
    audio.play().catch(() => {});
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

  // Update ringtone action button text based on unlock status
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
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
  } else {
    currentSongIndex = (currentSongIndex - 1 + currentTrackList.length) % currentTrackList.length;
    loadAndPlayTrack();
  }
}

function toggleLikeCurrent() {
  const currentSong = currentTrackList[currentSongIndex];
  if (!currentSong) return;

  if (likedSongs.has(currentSong.id)) {
    likedSongs.delete(currentSong.id);
    showToast("Removed from Liked Songs");
  } else {
    likedSongs.add(currentSong.id);
    showToast("Added to Liked Songs", true);
  }
  localStorage.setItem('likedSongs', JSON.stringify(Array.from(likedSongs)));
  updatePlayerBar();
  updateLibraryView();
}

// --- DYNAMIC LYRICS & QUEUE ---
function renderLyrics() {
  const currentSong = currentTrackList[currentSongIndex];
  paneLyrics.innerHTML = "";
  
  if (!currentSong || !currentSong.lyrics) {
    paneLyrics.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding-top: 40px;">No lyrics available.</div>`;
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
      
      // Smooth scroll lyrics panel to active line
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
    if (count >= 5) break; // show maximum 5 upcoming tracks
  }
}

// --- SEARCH & FILTER LOGIC ---
function filterSearch(query) {
  if (!query) {
    searchResultsContainer.innerHTML = `
      <div style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 40px 0;">
        Type in the search bar above to look for tracks or artists.
      </div>
    `;
    return;
  }

  const results = songDatabase.filter(track => 
    track.title.toLowerCase().includes(query) || 
    track.artist.toLowerCase().includes(query) ||
    track.album.toLowerCase().includes(query)
  );

  renderTracksList(results, searchResultsContainer);
}

// --- RINGTONE PURCHASE & MONETIZATION FLOW ---
function openPaymentModal(songId) {
  const song = songDatabase.find(s => s.id === songId);
  if (!song) return;

  activeSongToPurchase = song;

  // Check if already unlocked. If unlocked, trigger direct download
  if (purchasedRingtones.has(songId)) {
    triggerDownload(song);
    return;
  }

  // Set modal fields
  paymentSongName.innerText = `Configure "${song.title}" as your phone ringtone`;
  successMessage.innerText = `The premium ringtone cut for "${song.title}" by ${song.artist} has been activated successfully! You can download the MP3 directly, or manage it in your library.`;
  btnDownloadRingtone.href = song.url;
  btnDownloadRingtone.setAttribute("download", `${song.title} Ringtone.mp3`);

  // Generate UPI QR Code dynamically using standard QR Code API
  const upiUrl = `upi://pay?pa=antigravity@ybl&pn=Antigravity&am=19&cu=INR&tn=Ringtone_${song.id}`;
  qrCodeImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiUrl)}`;

  // Reset steps
  payStepDetails.style.display = "block";
  payStepProcessing.style.display = "none";
  payStepSuccess.style.display = "none";

  // Show Modal
  paymentModal.classList.add("open");
}

function processSimulatedPayment() {
  if (!activeSongToPurchase) return;

  payStepDetails.style.display = "none";
  payStepProcessing.style.display = "flex";

  // Simulate server transaction confirmation delay
  setTimeout(() => {
    payStepProcessing.style.display = "none";
    payStepSuccess.style.display = "flex";
    
    // Unlock ringtone
    purchasedRingtones.add(activeSongToPurchase.id);
    localStorage.setItem('purchasedRingtones', JSON.stringify(Array.from(purchasedRingtones)));
    
    showToast(`Successfully purchased "${activeSongToPurchase.title}" ringtone!`, true);
    
    // Refresh track lists
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
  showToast(`Downloading ringtone for ${song.title}...`, true);
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
  
  // Animate Entrance
  setTimeout(() => toast.classList.add("show"), 50);

  // Remove Toast
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// --- EVENT LISTENERS SETUP ---
function setupEventListeners() {
  // Startup ad dismiss
  btnContinueApp.addEventListener("click", dismissStartupAd);

  // Sidebar navigation
  navHome.addEventListener("click", () => switchView("home"));
  navSearch.addEventListener("click", () => switchView("search"));
  navLibrary.addEventListener("click", () => switchView("library"));

  // Interactive search logic
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query.length > 0) {
      switchView("search");
      filterSearch(query);
    } else {
      switchView("home");
    }
  });

  // Audio Engine event hooks
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    timelineProgress.style.width = `${progressPercent}%`;
    timeCurrent.innerText = formatTime(audio.currentTime);
    updateLyricsHighlight(audio.currentTime);
  });

  audio.addEventListener("loadedmetadata", () => {
    timeDuration.innerText = formatTime(audio.duration);
  });

  audio.addEventListener("ended", () => {
    if (isRepeat) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } else {
      skipNext();
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

  // Timeline seeking click listener
  timeline.addEventListener("click", (e) => {
    if (!audio.duration) return;
    const rect = timeline.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
    audio.currentTime = percent * audio.duration;
  });

  // Volume bar click listener
  volumeSlider.addEventListener("click", (e) => {
    const rect = volumeSlider.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
    audio.volume = percent;
    volumeProgress.style.width = `${percent * 100}%`;
    showToast(`Volume: ${Math.round(percent * 100)}%`);
  });

  // Right sidebar tab toggle
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

  // Payment popup tab switches
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

  // Payment submissions
  btnSubmitUpi.addEventListener("click", processSimulatedPayment);
  btnSubmitCard.addEventListener("click", processSimulatedPayment);
  
  // Close buttons
  btnPaymentClose.addEventListener("click", () => {
    paymentModal.classList.remove("open");
  });

  btnSuccessDone.addEventListener("click", () => {
    paymentModal.classList.remove("open");
  });

  // Close modal when clicking outside background overlay
  paymentModal.addEventListener("click", (e) => {
    if (e.target === paymentModal) {
      paymentModal.classList.remove("open");
    }
  });
}

// --- CONVENIENCE HELPERS ---
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
