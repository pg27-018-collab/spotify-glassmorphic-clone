// --- APP STATE ---
let songDatabase = [];
let currentTrackList = [];
let currentSongIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let likedSongs = new Set(JSON.parse(localStorage.getItem('likedSongs')) || []);
let currentLyrics = [];
let progressInterval = null;

// --- DOM ELEMENTS ---
const audio = document.getElementById("audio-engine");
const viewHome = document.getElementById("view-home");
const viewSearch = document.getElementById("view-search");
const viewLibrary = document.getElementById("view-library");
const searchInput = document.getElementById("search-bar");

const navHome = document.getElementById("nav-home");
const navSearch = document.getElementById("nav-search");
const navLibrary = document.getElementById("nav-library");

const homeTrackListContainer = document.getElementById("home-track-list");
const searchResultsContainer = document.getElementById("search-results-list");
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
const toastContainer = document.getElementById("toast-container");

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  updateLibraryView();
  
  // Set default volume
  audio.volume = 0.7;

  // Load trending music on startup
  initAppMusic();
});

// --- API FETCH UTILITIES (Self-Healing & Lazy-Loading) ---
async function fetchMusic(query, limit = 20) {
  const base = "https://jiosaavn-api.vercel.app";
  
  try {
    const url = `${base}/api/search?query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        console.log("Fetched song metadata from JioSaavn Search API");
        return data.results.map(item => {
          const coverUrl = item.images && item.images["500x500"] 
            ? item.images["500x500"] 
            : (item.image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80");
            
          const artistsName = item.more_info ? item.more_info.singers : "Unknown Artist";

          return {
            id: String(item.id),
            title: item.title,
            artist: artistsName,
            album: item.album || "Single",
            cover: coverUrl,
            url: "", // Direct audio stream will be lazy-loaded on play
            duration: 180, // Default duration fallback
            isFullSong: true,
            fallbackUrl: "",
            lyrics: generateSimulatedLyrics(item.title, artistsName)
          };
        });
      }
    }
  } catch (e) {
    console.warn("JioSaavn search failed, falling back to iTunes API:", e);
  }

  // Fallback to iTunes Search API if JioSaavn API is offline
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
        url: item.previewUrl, // 30s iTunes preview
        duration: 30,
        isFullSong: false,
        fallbackUrl: item.previewUrl,
        lyrics: generateSimulatedLyrics(item.trackName, item.artistName)
      };
    }).filter(track => track.url);
  } catch (error) {
    console.error("All music APIs failed:", error);
    return [];
  }
}

// Generate synced lyrics dynamically
function generateSimulatedLyrics(title, artist) {
  return [
    { time: 0, text: `[Playing: ${title}]` },
    { time: 4, text: `Artist: ${artist}` },
    { time: 8, text: "[Melodic Intro Playing...]" },
    { time: 13, text: "Welcome to Spotify Glass!" },
    { time: 20, text: "Streaming high-fidelity full songs natively in your browser." },
    { time: 28, text: "Click the Heart icon to save this song to your library." },
    { time: 35, text: "Toggle between scrolling lyrics and queue panels on the right side." },
    { time: 45, text: "Search for any Hindi, Punjabi, Haryanvi, or international track." },
    { time: 60, text: "[Melodious Instrumental Bridge]" },
    { time: 85, text: "Adjust progress and volume slider controls dynamically." },
    { time: 120, text: "[Outro Beats]" }
  ];
}

// Helper to parse duration string (e.g. "3:34" or 214) into seconds
function parseDurationString(dur) {
  if (!dur) return 180;
  if (typeof dur === "number") return dur;
  
  const parts = String(dur).split(":").map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return parseInt(dur) || 180;
}

// Fetch trending hits from Hindi, Punjabi, and Haryanvi on load
async function initAppMusic() {
  const categories = ["Diljit Dosanjh Hits", "Trending Hindi Songs", "Haryanvi Hits", "Arijit Singh"];
  let loadedTracks = [];
  
  // Show loading indicator
  homeTrackListContainer.innerHTML = `<div class="spinner" style="margin: 40px auto;"></div>`;

  try {
    const fetchPromises = categories.map(cat => fetchMusic(cat, 5));
    const results = await Promise.all(fetchPromises);
    results.forEach(res => {
      loadedTracks = [...loadedTracks, ...res];
    });
  } catch (err) {
    console.error("Failed to load initial music from API:", err);
  }

  // Shuffle initial results
  loadedTracks.sort(() => Math.random() - 0.5);

  if (loadedTracks.length > 0) {
    songDatabase = loadedTracks;
  }

  currentTrackList = [...songDatabase];
  renderTracksList(songDatabase, homeTrackListContainer);
  
  // Set default details in player bar
  currentSongIndex = 0;
  updatePlayerBar();
  renderLyrics();
  updateQueueView();
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
      <div class="track-duration">${track.isFullSong ? 'Full Song' : 'Preview'}</div>
      <div class="track-actions" onclick="event.stopPropagation();">
        <button class="btn-like ${likedSongs.has(track.id) ? 'liked' : ''}" onclick="toggleLike('${track.id}')">
          <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: currentColor;">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
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
      displayDesc = "Bhangra energy and punjabi pop trends. Full songs streaming now.";
      break;
    case 'Retro':
      apiQuery = "Kishore Kumar Lata Mangeshkar RD Burman Rafi";
      displayTitle = "Retro Classics (60s, 70s & 80s)";
      displayDesc = "Timeless melodies from the golden era of Indian cinema.";
      break;
    case 'Bollywood':
      apiQuery = "Alka Yagnik Kumar Sanu Udit Narayan 90s bollywood";
      displayTitle = "90s Bollywood Hits";
      displayDesc = "The romantic melodious decade. Relive the classics.";
      break;
    case 'Haryanvi':
      apiQuery = "Sapna Choudhary Raju Haryanvi Hits";
      displayTitle = "Latest Haryanvi Beats";
      displayDesc = "High bass and local rhythmic hooks streaming in full length.";
      break;
  }

  const heroTitle = document.getElementById("hero-title");
  const heroDesc = document.getElementById("hero-desc");
  heroTitle.innerText = displayTitle;
  heroDesc.innerText = displayDesc;

  homeTrackListContainer.innerHTML = `<div class="spinner" style="margin: 40px auto;"></div>`;

  const results = await fetchMusic(apiQuery, 20);
  
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
}

// --- MUSIC PLAYBACK CONTROL ENGINE ---
async function loadAndPlayTrack() {
  const currentSong = currentTrackList[currentSongIndex];
  if (!currentSong) return;

  if (progressInterval) clearInterval(progressInterval);

  try {
    showToast(`Loading "${currentSong.title}"...`, true);

    // Lazy-load direct full audio streams from the JioSaavn API
    if (currentSong.isFullSong && !currentSong.url) {
      const detailsUrl = `https://jiosaavn-api.vercel.app/api/song?id=${currentSong.id}`;
      const response = await fetch(detailsUrl);
      if (response.ok) {
        const detailsData = await response.json();
        const songInfo = detailsData.results ? detailsData.results[0] : detailsData;
        
        if (songInfo && songInfo.media_url) {
          currentSong.url = songInfo.media_url;
          currentSong.duration = parseDurationString(songInfo.duration);
        } else {
          console.warn("Direct stream URL missing in API. Using fallback.");
        }
      }
    }

    // Playback
    audio.src = currentSong.url || currentSong.fallbackUrl;
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
        console.error("Native playback failed, attempting fallback:", err);
        // Attempt fallback if available
        if (currentSong.fallbackUrl && audio.src !== currentSong.fallbackUrl) {
          audio.src = currentSong.fallbackUrl;
          audio.play().then(() => {
            isPlaying = true;
            updatePlayerBar();
          }).catch(e => {
            console.error("Playback fallback failed:", e);
            isPlaying = false;
            updatePlayerBar();
          });
        } else {
          isPlaying = false;
          updatePlayerBar();
        }
      });
  } catch (err) {
    console.error("Playback engine setup failed:", err);
    isPlaying = false;
    updatePlayerBar();
  }

  renderTracksList(currentTrackList, homeTrackListContainer);
  updateLibraryView();
}

function trackPlaybackProgress() {
  const cur = audio.currentTime || 0;
  const dur = audio.duration || 0;

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

function toggleLike(songId) {
  if (likedSongs.has(songId)) {
    likedSongs.delete(songId);
    showToast("Removed from Liked Songs");
  } else {
    likedSongs.add(songId);
    showToast("Added to Liked Songs", true);
  }
  localStorage.setItem('likedSongs', JSON.stringify(Array.from(likedSongs)));
  
  // Re-render
  renderTracksList(currentTrackList, homeTrackListContainer);
  if (viewSearch.classList.contains("active")) {
    const term = searchInput.value.toLowerCase().trim();
    if (term) filterSearch(term);
  }
  updateLibraryView();
  updatePlayerBar();
}

function toggleLikeCurrent() {
  const currentSong = currentTrackList[currentSongIndex];
  if (!currentSong) return;
  toggleLike(currentSong.id);
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

// Track lyrics scrolling
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

// Queue view updating
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

  const results = await fetchMusic(query, 25);
  
  if (results.length === 0) {
    searchResultsContainer.innerHTML = `
      <div style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 40px 0;">
        No results found on the server. Try searching different keywords.
      </div>
    `;
    return;
  }

  renderTracksList(results, searchResultsContainer);
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

  timeline.addEventListener("click", (e) => {
    if (!audio.duration) return;
    const rect = timeline.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
    audio.currentTime = percent * audio.duration;
  });

  volumeSlider.addEventListener("click", (e) => {
    const rect = volumeSlider.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
    audio.volume = percent;
    volumeProgress.style.width = `${percent * 100}%`;
    showToast(`Volume: ${Math.round(percent * 100)}%`);
  });

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
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
