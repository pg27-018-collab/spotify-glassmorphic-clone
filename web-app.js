// --- APP STATE ---
let songDatabase = [];
let currentTrackList = [];
let currentSongIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let likedSongs = new Set(JSON.parse(localStorage.getItem('likedSongs')) || []);
let likedSongObjects = JSON.parse(localStorage.getItem('likedSongObjects')) || [];
let currentVoiceFilter = "all";
let isDraggingTimeline = false;

const maleArtists = ["arijit", "diljit", "kishore", "burman", "karan aujla", "moosewala", "honey singh", "badshah", "nautiyal", "atif", "darshan", "sriram", "udit", "kumar sanu", "sonu"];
const femaleArtists = ["lata", "asha", "shreya", "neha", "sunidhi", "alka", "tulsi", "dhvani", "jasleen", "jonita", "kanika", "asees", "taylor", "billie", "dua", "ariana", "olivia", "selena"];

function getVoiceCategory(artist, songId) {
  const artLower = artist.toLowerCase();
  for (const m of maleArtists) {
    if (artLower.includes(m)) return "male";
  }
  for (const f of femaleArtists) {
    if (artLower.includes(f)) return "female";
  }
  let hash = 0;
  const str = songId || artist || "";
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (hash % 2 === 0) ? "male" : "female";
}

let currentLyrics = [];
let progressInterval = null;

// Unified proxy endpoint for bypassing geoblocks both locally (server.py) and on Vercel
const proxyBase = window.location.origin + "/api/proxy?url=";

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

// Fullscreen player elements
const fsPlayer = document.getElementById("fullscreen-player");
const fsAmbientGlow = document.getElementById("fs-ambient-glow");
const fsArtwork = document.getElementById("fs-artwork");
const fsArtworkContainer = document.querySelector(".fs-artwork-container");
const fsLyricsContainer = document.getElementById("fs-lyrics-container");
const fsLyricsContent = document.getElementById("fs-lyrics-content");
const fsQueueList = document.getElementById("fs-queue-list");
const fsArtistRecList = document.getElementById("fs-artist-rec-list");
const fsTrackTitle = document.getElementById("fs-track-title");
const fsTrackArtist = document.getElementById("fs-track-artist");
const fsBtnLike = document.getElementById("fs-btn-like");
const fsTimeline = document.getElementById("fs-timeline");
const fsTimelineProgress = document.getElementById("fs-timeline-progress");
const fsTimeCurrent = document.getElementById("fs-time-current");
const fsTimeDuration = document.getElementById("fs-time-duration");
const fsBtnShuffle = document.getElementById("fs-btn-shuffle");
const fsBtnPrev = document.getElementById("fs-btn-prev");
const fsBtnPlay = document.getElementById("fs-btn-play");
const fsPlayIcon = document.getElementById("fs-play-icon");
const fsBtnNext = document.getElementById("fs-btn-next");
const fsBtnRepeat = document.getElementById("fs-btn-repeat");
const fsBtnMinimize = document.getElementById("fs-btn-minimize");
const playerTrackInfo = document.querySelector(".player-track-info");

// Settings Modal elements
const settingsModal = document.getElementById("settings-modal");
const btnSettings = document.getElementById("btn-settings");
const btnCloseSettings = document.getElementById("btn-close-settings");
const btnSaveSettings = document.getElementById("btn-save-settings");
const inputSpotifyId = document.getElementById("input-spotify-client-id");
const inputSpotifySecret = document.getElementById("input-spotify-client-secret");

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  updateLibraryView();
  
  // Set default volume
  audio.volume = 0.7;

  // Load initial music catalog
  initAppMusic();

  // Register PWA Service Worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js")
        .then((reg) => console.log("Service Worker registered successfully:", reg.scope))
        .catch((err) => console.warn("Service Worker registration failed:", err));
    });
  }
});

// --- SPOTIFY OAUTH TOKEN SYSTEM ---
async function fetchSpotifyAccessToken(clientId, clientSecret) {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + btoa(clientId + ":" + clientSecret)
      },
      body: "grant_type=client_credentials"
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("spotify_token", data.access_token);
      localStorage.setItem("spotify_token_expires", Date.now() + (data.expires_in * 1000));
      return data.access_token;
    }
  } catch (e) {
    console.error("Failed to fetch Spotify token:", e);
  }
  return null;
}

async function getSpotifyToken() {
  const clientId = localStorage.getItem("spotify_client_id");
  const clientSecret = localStorage.getItem("spotify_client_secret");
  if (!clientId || !clientSecret) return null;

  const token = localStorage.getItem("spotify_token");
  const expires = localStorage.getItem("spotify_token_expires");
  
  if (token && expires && Date.now() < parseInt(expires)) {
    return token;
  }
  
  return await fetchSpotifyAccessToken(clientId, clientSecret);
}

// --- API HELPERS FOR LYRICS & ARTIST RECOMMENDED PLAYLISTS ---
async function fetchJioSaavnLyrics(songId) {
  try {
    const lyricsApiUrl = `https://www.jiosaavn.com/api.php?__call=lyrics.getLyrics&lyrics_id=${songId}&_format=json`;
    const response = await fetch(proxyBase + encodeURIComponent(lyricsApiUrl));
    if (response.ok) {
      const data = await response.json();
      if (data && data.lyrics) {
        const rawLyrics = data.lyrics;
        const parsedLines = rawLyrics
          .split(/<br\s*\/?>|\n/gi)
          .map((line, idx) => {
            return {
              time: idx * 4.5,
              text: line.replace(/<[^>]*>/g, '').trim()
            };
          })
          .filter(line => line.text.length > 0);
          
        return parsedLines;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch JioSaavn lyrics:", err);
  }
  return null;
}

async function fetchArtistTopTracks(artist, currentTrackId) {
  if (!artist || artist === "Unknown") {
    fsArtistRecList.innerHTML = `<div style="color: var(--text-muted); font-size: 0.8rem; padding: 10px 0;">No recommendations available</div>`;
    return;
  }
  
  fsArtistRecList.innerHTML = `<div class="spinner" style="margin: 20px auto; width: 24px; height: 24px;"></div>`;
  
  try {
    const results = await fetchMusic(artist + " hits", 8);
    const filtered = results.filter(t => t.id !== currentTrackId).slice(0, 5);
    
    fsArtistRecList.innerHTML = "";
    if (filtered.length === 0) {
      fsArtistRecList.innerHTML = `<div style="color: var(--text-muted); font-size: 0.8rem; padding: 10px 0;">No other tracks found</div>`;
      return;
    }
    
    filtered.forEach(track => {
      const item = document.createElement("div");
      item.className = "queue-item";
      item.style.display = "flex";
      item.style.alignItems = "center";
      item.style.gap = "10px";
      item.style.padding = "8px 12px";
      item.style.borderRadius = "8px";
      item.style.background = "rgba(255,255,255,0.02)";
      item.style.border = "1px solid var(--glass-border)";
      item.style.cursor = "pointer";
      item.style.transition = "background 0.2s";
      
      item.addEventListener("mouseenter", () => item.style.background = "rgba(255,255,255,0.06)");
      item.addEventListener("mouseleave", () => item.style.background = "rgba(255,255,255,0.02)");
      
      item.innerHTML = `
        <img src="${track.artwork}" style="width: 36px; height: 36px; border-radius: 4px; object-fit: cover;">
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 0.8rem; font-weight: bold; color: #fff; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${track.title}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${track.artist}</div>
        </div>
      `;
      
      item.addEventListener("click", () => {
        const existingIdx = currentTrackList.findIndex(t => t.id === track.id);
        if (existingIdx !== -1) {
          currentSongIndex = existingIdx;
          loadAndPlayTrack();
        } else {
          currentTrackList.splice(currentSongIndex + 1, 0, track);
          currentSongIndex = currentSongIndex + 1;
          loadAndPlayTrack();
        }
      });
      fsArtistRecList.appendChild(item);
    });
  } catch (err) {
    console.error("Failed to load artist recommendations:", err);
    fsArtistRecList.innerHTML = `<div style="color: var(--text-muted); font-size: 0.8rem; padding: 10px 0;">Error loading recommendations</div>`;
  }
}

// --- API FETCH CATALOG (Spotify with fallback to iTunes) ---
async function fetchMusic(query, limit = 20) {
  const spotifyToken = await getSpotifyToken();
  
  // 1. If Spotify credentials are saved, query Spotify catalog
  if (spotifyToken) {
    try {
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`, {
        headers: {
          "Authorization": `Bearer ${spotifyToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.tracks && data.tracks.items) {
          console.log("Loaded search results from official Spotify Web API");
          return data.tracks.items.map(item => {
            const coverUrl = item.album.images && item.album.images[0] 
              ? item.album.images[0].url 
              : "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80";
              
            const artists = item.artists.map(a => a.name).join(", ");

            return {
              id: String(item.id),
              title: item.name,
              artist: artists,
              album: item.album.name || "Single",
              cover: coverUrl,
              url: item.preview_url, // Spotify official 30s preview URL
              duration: 30,          // Initial preview duration
              isFullSong: false,
              isUpgraded: false,
              fallbackUrl: item.preview_url,
              lyrics: generateSimulatedLyrics(item.name, artists)
            };
          }).filter(track => track.url);
        }
      }
    } catch (e) {
      console.warn("Spotify search query failed, falling back to iTunes API:", e);
    }
  }

  // 2. Fallback to iTunes Search API if Spotify is not configured or fails
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
        url: item.previewUrl, // iTunes official 30s preview URL
        duration: 30,          // Initial preview duration
        isFullSong: false,
        isUpgraded: false,
        fallbackUrl: item.previewUrl,
        lyrics: generateSimulatedLyrics(item.trackName, item.artistName)
      };
    }).filter(track => track.url);
  } catch (error) {
    console.error("All search catalogs failed:", error);
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
    { time: 20, text: "Streaming high-fidelity original audio streams." },
    { time: 28, text: "Click the Heart icon to save this song to your library." },
    { time: 35, text: "Toggle between scrolling lyrics and queue panels on the right side." },
    { time: 45, text: "Search for any Hindi, Punjabi, Haryanvi, or international track." },
    { time: 60, text: "[Melodious Instrumental Bridge]" },
    { time: 85, text: "Adjust progress and volume slider controls dynamically." },
    { time: 120, text: "[Outro Beats]" }
  ];
}

// Fetch trending hits on load
async function initAppMusic() {
  const categories = ["Diljit Dosanjh Hits", "Trending Hindi Songs", "Haryanvi Hits", "Arijit Singh"];
  let loadedTracks = [];
  
  homeTrackListContainer.innerHTML = `<div class="spinner" style="margin: 40px auto;"></div>`;

  try {
    const fetchPromises = categories.map(cat => fetchMusic(cat, 5));
    const results = await Promise.all(fetchPromises);
    results.forEach(res => {
      loadedTracks = [...loadedTracks, ...res];
    });
  } catch (err) {
    console.error("Failed to load initial music:", err);
  }

  loadedTracks.sort(() => Math.random() - 0.5);

  if (loadedTracks.length > 0) {
    songDatabase = loadedTracks;
  }

  currentTrackList = [...songDatabase];
  renderHomeTracks();
  
  // Set default details in player bar
  currentSongIndex = 0;
  updatePlayerBar();
  renderLyrics();
  updateQueueView();
}

// --- DECRYPTION LOGIC FOR JIOSAAVN (Correct updated key: 38346591) ---
function decryptJioSaavnUrl(encryptedUrl) {
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    if (!decryptedText) return null;
    
    // Choose 320kbps quality
    let finalUrl = decryptedText.replace("_96.mp4", "_320.mp4").replace("_96.mp3", "_320.mp3");
    if (!finalUrl.startsWith("http")) {
      finalUrl = "https:" + finalUrl;
    }
    return finalUrl;
  } catch (e) {
    console.error("JioSaavn DES Decryption failed:", e);
    return null;
  }
}

// --- NAVIGATION SYSTEM ---
function switchView(viewName) {
  [viewHome, viewSearch, viewLibrary].forEach(view => view.classList.remove("active"));
  [navHome, navSearch, navLibrary].forEach(nav => nav.classList.remove("active"));

  // Mobile bottom nav buttons
  const mHome = document.getElementById("mobile-nav-home");
  const mSearch = document.getElementById("mobile-nav-search");
  const mLibrary = document.getElementById("mobile-nav-library");
  [mHome, mSearch, mLibrary].forEach(m => m && m.classList.remove("active"));

  if (viewName === "home") {
    viewHome.classList.add("active");
    navHome.classList.add("active");
    if (mHome) mHome.classList.add("active");
  } else if (viewName === "search") {
    viewSearch.classList.add("active");
    navSearch.classList.add("active");
    if (mSearch) mSearch.classList.add("active");
  } else if (viewName === "library") {
    viewLibrary.classList.add("active");
    navLibrary.classList.add("active");
    if (mLibrary) mLibrary.classList.add("active");
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
      <div class="track-duration">${track.isFullSong ? 'Full Song' : '0:30 Preview'}</div>
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
    renderHomeTracks();
    currentSongIndex = 0;
    loadAndPlayTrack();
  } else {
    homeTrackListContainer.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 20px;">Could not load playlist items. Check connection.</div>`;
  }
  switchView("home");
}

async function loadMood(moodType, moodTitle, moodDesc) {
  let apiQuery = "";
  switch (moodType) {
    case 'Energetic':
      apiQuery = "diljit dosanjh bhangra energetic bass dance";
      break;
    case 'Romantic':
      apiQuery = "arijit singh romantic love songs hindi";
      break;
    case 'Sad':
      apiQuery = "arijit singh sad slow emotional hits";
      break;
    case 'Relax':
      apiQuery = "lofi hindi soft instrumental study chill";
      break;
    case 'Happy':
      apiQuery = "happy upbeat positive pop hindi";
      break;
  }

  const heroTitle = document.getElementById("hero-title");
  const heroDesc = document.getElementById("hero-desc");
  if (heroTitle) heroTitle.innerText = moodTitle;
  if (heroDesc) heroDesc.innerText = moodDesc;

  homeTrackListContainer.innerHTML = `<div class="spinner" style="margin: 40px auto;"></div>`;
  showToast(`Tuning into your ${moodType} mood...`, true);

  const results = await fetchMusic(apiQuery, 20);
  if (results.length > 0) {
    songDatabase = results;
    currentTrackList = [...songDatabase];
    renderHomeTracks();
    currentSongIndex = 0;
    loadAndPlayTrack();
  } else {
    homeTrackListContainer.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 20px;">Could not load mood recommendations. Check connection.</div>`;
  }
  switchView("home");
}

window.loadMood = loadMood;


function renderHomeTracks() {
  let tracksToRender = [...songDatabase];
  if (currentVoiceFilter !== "all") {
    tracksToRender = tracksToRender.filter(t => getVoiceCategory(t.artist, t.id) === currentVoiceFilter);
  }
  renderTracksList(tracksToRender, homeTrackListContainer);
}

function updateLibraryView() {
  renderTracksList(likedSongObjects, libraryLikedContainer);
}

// --- MUSIC PLAYBACK CONTROL ENGINE WITH DYNAMIC STREAM UPGRADE ---
async function loadAndPlayTrack() {
  const currentSong = currentTrackList[currentSongIndex];
  if (!currentSong) return;

  if (progressInterval) clearInterval(progressInterval);

  showToast(`Streaming: "${currentSong.title}"...`, true);
  fetchArtistTopTracks(currentSong.artist, currentSong.id);

  // 1. Play the iTunes/Spotify preview instantly so user hears music immediately!
  audio.src = currentSong.url;
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
      console.error("Playback failed to start:", err);
    });

  // 2. If already upgraded, stop here
  if (currentSong.isUpgraded) return;

  // 3. Background query JioSaavn official API via proxy & decrypt the full song URL
  try {
    const searchQuery = `${currentSong.title} ${currentSong.artist}`;
    const searchApiUrl = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&query=${encodeURIComponent(searchQuery)}`;
    
    const response = await fetch(proxyBase + encodeURIComponent(searchApiUrl));
    if (response.ok) {
      const data = await response.json();
      const songs = data.songs ? data.songs.data : [];
      
      if (songs && songs.length > 0) {
        const topSong = songs[0];
        
        // Fetch details to get encrypted url
        const detailsApiUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&_format=json&pids=${topSong.id}`;
        const detailRes = await fetch(proxyBase + encodeURIComponent(detailsApiUrl));
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          const songInfo = detailData[topSong.id];
          
          if (songInfo && songInfo.encrypted_media_url) {
            const fullMediaUrl = decryptJioSaavnUrl(songInfo.encrypted_media_url);
            
            if (fullMediaUrl) {
              console.log("Upgraded stream to JioSaavn full-length track:", fullMediaUrl);
              
              const currentPosition = audio.currentTime;
              const wasPlaying = !audio.paused;
              
              currentSong.url = fullMediaUrl;
              currentSong.duration = parseInt(songInfo.duration) || 240;
              currentSong.isFullSong = true;
              currentSong.isUpgraded = true;
              
              audio.src = fullMediaUrl;
              audio.load();
              audio.currentTime = currentPosition;
              
              if (wasPlaying) {
                audio.play().catch(e => console.warn("Autoplay block on hot-swap:", e));
              }
              
              // Load original lyrics from JioSaavn
              const lyrics = await fetchJioSaavnLyrics(topSong.id);
              if (lyrics) {
                currentSong.lyrics = lyrics;
                renderLyrics();
              }
              
              updatePlayerBar();
              renderHomeTracks();
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("JioSaavn upgrade failed, continuing preview streaming:", err);
  }
}

function trackPlaybackProgress() {
  if (isDraggingTimeline) return;
  
  const cur = audio.currentTime || 0;
  const dur = audio.duration || 30; // fallback preview duration
  
  const progressPercent = (cur / dur) * 100;
  
  // Update normal player progress
  if (timelineProgress) timelineProgress.style.width = `${progressPercent}%`;
  if (timeCurrent) timeCurrent.innerText = formatTime(cur);
  if (timeDuration) timeDuration.innerText = formatTime(dur);
  
  // Update fullscreen player progress
  if (fsTimelineProgress) fsTimelineProgress.style.width = `${progressPercent}%`;
  if (fsTimeCurrent) fsTimeCurrent.innerText = formatTime(cur);
  if (fsTimeDuration) fsTimeDuration.innerText = formatTime(dur);
  
  updateLyricsHighlight(cur);
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

  // Update fullscreen elements
  if (fsArtwork) fsArtwork.src = currentSong.cover;
  if (fsTrackTitle) fsTrackTitle.innerText = currentSong.title;
  if (fsTrackArtist) fsTrackArtist.innerText = currentSong.artist;
  
  if (fsBtnLike) {
    if (likedSongs.has(currentSong.id)) {
      fsBtnLike.classList.add("active");
    } else {
      fsBtnLike.classList.remove("active");
    }
  }

  // Set premium dynamic ambient gradient based on track metadata
  if (fsAmbientGlow) {
    const hue = (currentSong.title.charCodeAt(0) * 15) % 360;
    fsAmbientGlow.style.background = `radial-gradient(circle at center, hsla(${hue}, 80%, 40%, 0.22) 0%, hsla(${(hue + 140) % 360}, 80%, 30%, 0.08) 50%, rgba(6, 8, 20, 1) 100%)`;
  }

  if (isPlaying) {
    playIcon.style.display = "none";
    pauseIcon.style.display = "block";
    if (fsPlayIcon) {
      fsPlayIcon.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`;
    }
    if (fsArtworkContainer) fsArtworkContainer.classList.add("playing");
  } else {
    playIcon.style.display = "block";
    pauseIcon.style.display = "none";
    if (fsPlayIcon) {
      fsPlayIcon.innerHTML = `<path d="M8 5v14l11-7z"/>`;
    }
    if (fsArtworkContainer) fsArtworkContainer.classList.remove("playing");
  }

  if (likedSongs.has(currentSong.id)) {
    btnLikeCurrent.classList.add("liked");
  } else {
    btnLikeCurrent.classList.remove("liked");
  }

  updateFsQueueView();
}

function updateFsQueueView() {
  if (!fsQueueList) return;
  fsQueueList.innerHTML = "";
  const nextTracks = currentTrackList.slice(currentSongIndex + 1, currentSongIndex + 6);
  if (nextTracks.length === 0) {
    fsQueueList.innerHTML = `<div style="color: var(--text-muted); font-size: 0.8rem; padding: 10px 0;">Queue is empty</div>`;
    return;
  }
  nextTracks.forEach((track, idx) => {
    const item = document.createElement("div");
    item.className = "queue-item";
    item.style.display = "flex";
    item.style.alignItems = "center";
    item.style.gap = "10px";
    item.style.padding = "8px 12px";
    item.style.borderRadius = "8px";
    item.style.background = "rgba(255,255,255,0.02)";
    item.style.border = "1px solid var(--glass-border)";
    item.style.cursor = "pointer";
    item.style.transition = "background 0.2s";
    
    item.addEventListener("mouseenter", () => item.style.background = "rgba(255,255,255,0.06)");
    item.addEventListener("mouseleave", () => item.style.background = "rgba(255,255,255,0.02)");
    
    item.innerHTML = `
      <img src="${track.artwork}" style="width: 36px; height: 36px; border-radius: 4px; object-fit: cover;">
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 0.8rem; font-weight: bold; color: #fff; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${track.title}</div>
        <div style="font-size: 0.7rem; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${track.artist}</div>
      </div>
    `;
    item.addEventListener("click", () => {
      currentSongIndex = currentSongIndex + 1 + idx;
      loadAndPlayTrack();
    });
    fsQueueList.appendChild(item);
  });
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
  const track = currentTrackList.find(t => t.id === songId) || 
                songDatabase.find(t => t.id === songId) || 
                likedSongObjects.find(t => t.id === songId);
                
  if (!track) return;

  if (likedSongs.has(songId)) {
    likedSongs.delete(songId);
    likedSongObjects = likedSongObjects.filter(t => t.id !== songId);
    showToast("Removed from Liked Songs");
  } else {
    likedSongs.add(songId);
    if (!likedSongObjects.some(t => t.id === songId)) {
      likedSongObjects.push(track);
    }
    showToast("Added to Liked Songs", true);
  }
  
  localStorage.setItem('likedSongs', JSON.stringify(Array.from(likedSongs)));
  localStorage.setItem('likedSongObjects', JSON.stringify(likedSongObjects));
  
  // Re-render
  renderHomeTracks();
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
  if (fsLyricsContent) fsLyricsContent.innerHTML = "";
  
  if (!currentSong || !currentSong.lyrics) {
    paneLyrics.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding-top: 40px;">Lyrics unavailable.</div>`;
    if (fsLyricsContent) {
      fsLyricsContent.innerHTML = `<div style="color: rgba(255,255,255,0.4); font-size: 1.2rem; font-weight: 700; text-align: center; padding: 40px 0;">Lyrics unavailable for this track</div>`;
    }
    return;
  }

  currentLyrics = currentSong.lyrics;
  currentLyrics.forEach((lyric, index) => {
    // Normal lyrics line
    const line = document.createElement("div");
    line.className = "lyrics-line";
    line.id = `lyric-line-${index}`;
    line.innerText = lyric.text;
    paneLyrics.appendChild(line);

    // Fullscreen lyrics line
    if (fsLyricsContent) {
      const fsLine = document.createElement("div");
      fsLine.className = "lyrics-line";
      fsLine.id = `fs-lyric-line-${index}`;
      fsLine.innerText = lyric.text;
      
      // Interactive lyrics seek click listener
      fsLine.addEventListener("click", () => {
        if (!audio.duration) return;
        audio.currentTime = lyric.time;
        updateLyricsHighlight(lyric.time);
      });
      
      fsLyricsContent.appendChild(fsLine);
    }
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
    // Normal panel line highlight
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

    // Fullscreen panel line highlight
    if (fsLyricsContent) {
      const fsLines = fsLyricsContent.querySelectorAll(".lyrics-line");
      fsLines.forEach(l => l.classList.remove("active"));
      
      const fsActiveLine = document.getElementById(`fs-lyric-line-${activeIndex}`);
      if (fsActiveLine) {
        fsActiveLine.classList.add("active");
        
        const fsContainerHeight = fsLyricsContainer.clientHeight;
        const fsOffsetTop = fsActiveLine.offsetTop;
        fsLyricsContainer.scrollTo({
          top: fsOffsetTop - fsContainerHeight / 2,
          behavior: 'smooth'
        });
      }
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

function setupTimelineListeners(timelineEl, progressEl, timeEl) {
  if (!timelineEl || !progressEl) return;

  const handleSeek = (e) => {
    if (!audio.duration || isNaN(audio.duration)) return;
    const rect = timelineEl.getBoundingClientRect();
    let clientX;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    const clickX = clientX - rect.left;
    const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
    
    progressEl.style.width = `${percent * 100}%`;
    if (timeEl) timeEl.innerText = formatTime(percent * audio.duration);
    return percent;
  };

  timelineEl.addEventListener("mousedown", (e) => {
    isDraggingTimeline = true;
    handleSeek(e);
  });
  timelineEl.addEventListener("touchstart", (e) => {
    isDraggingTimeline = true;
    handleSeek(e);
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDraggingTimeline) return;
    handleSeek(e);
  });
  window.addEventListener("touchmove", (e) => {
    if (!isDraggingTimeline) return;
    handleSeek(e);
  });

  const finishSeek = (e) => {
    if (!isDraggingTimeline) return;
    isDraggingTimeline = false;
    if (!audio.duration || isNaN(audio.duration)) return;
    const percent = handleSeek(e);
    if (percent !== undefined) {
      audio.currentTime = percent * audio.duration;
    }
  };

  window.addEventListener("mouseup", finishSeek);
  window.addEventListener("touchend", finishSeek);
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

  // Audio events
  audio.addEventListener("ended", () => {
    if (isRepeat) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } else {
      skipNext();
    }
  });

  audio.addEventListener("pause", () => {
    isPlaying = false;
    updatePlayerBar();
  });

  audio.addEventListener("play", () => {
    isPlaying = true;
    updatePlayerBar();
  });

  // Native self-healing error listener
  audio.addEventListener("error", (e) => {
    console.warn("Media error event caught. Reverting to preview fallback stream...");
    const currentSong = currentTrackList[currentSongIndex];
    if (currentSong && currentSong.isUpgraded && currentSong.fallbackUrl) {
      currentSong.url = currentSong.fallbackUrl;
      currentSong.isUpgraded = false;
      currentSong.isFullSong = false;
      currentSong.duration = 30;
      
      audio.src = currentSong.fallbackUrl;
      audio.load();
      audio.play().catch(err => console.error("Fallback recovery blocked:", err));
      
      updatePlayerBar();
      renderTracksList(currentTrackList, homeTrackListContainer);
    }
  });

  setupTimelineListeners(timeline, timelineProgress, timeCurrent);
  setupTimelineListeners(fsTimeline, fsTimelineProgress, fsTimeCurrent);

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

  // Fullscreen open/close triggers
  if (playerTrackInfo) playerTrackInfo.addEventListener("click", () => {
    fsPlayer.style.display = "flex";
    updatePlayerBar();
  });
  if (playerAlbumArt) playerAlbumArt.addEventListener("click", () => {
    fsPlayer.style.display = "flex";
    updatePlayerBar();
  });
  if (fsBtnMinimize) fsBtnMinimize.addEventListener("click", () => {
    fsPlayer.style.display = "none";
  });

  // Fullscreen Player Controls
  if (fsBtnPlay) fsBtnPlay.addEventListener("click", togglePlay);
  if (fsBtnNext) fsBtnNext.addEventListener("click", skipNext);
  if (fsBtnPrev) fsBtnPrev.addEventListener("click", skipPrev);
  if (fsBtnLike) fsBtnLike.addEventListener("click", toggleLikeCurrent);

  if (fsBtnShuffle) fsBtnShuffle.addEventListener("click", () => {
    isShuffle = !isShuffle;
    btnShuffle.classList.toggle("active", isShuffle);
    if (fsBtnShuffle) fsBtnShuffle.classList.toggle("active", isShuffle);
    showToast(isShuffle ? "Shuffle On" : "Shuffle Off");
  });

  if (fsBtnRepeat) fsBtnRepeat.addEventListener("click", () => {
    isRepeat = !isRepeat;
    btnRepeat.classList.toggle("active", isRepeat);
    if (fsBtnRepeat) fsBtnRepeat.classList.toggle("active", isRepeat);
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

  // Settings Modal events
  btnSettings.addEventListener("click", () => {
    inputSpotifyId.value = localStorage.getItem("spotify_client_id") || "";
    inputSpotifySecret.value = localStorage.getItem("spotify_client_secret") || "";
    settingsModal.style.display = "flex";
  });

  btnCloseSettings.addEventListener("click", () => {
    settingsModal.style.display = "none";
  });

  btnSaveSettings.addEventListener("click", async () => {
    const id = inputSpotifyId.value.trim();
    const secret = inputSpotifySecret.value.trim();
    
    if (id && secret) {
      localStorage.setItem("spotify_client_id", id);
      localStorage.setItem("spotify_client_secret", secret);
      showToast("Verifying credentials...");
      
      const token = await fetchSpotifyAccessToken(id, secret);
      if (token) {
        showToast("Spotify Catalog Connected!", true);
        settingsModal.style.display = "none";
        initAppMusic();
      } else {
        showToast("Validation failed. Check credentials.", false);
      }
    } else {
      localStorage.removeItem("spotify_client_id");
      localStorage.removeItem("spotify_client_secret");
      localStorage.removeItem("spotify_token");
      localStorage.removeItem("spotify_token_expires");
      showToast("Settings cleared. Reverted to backup catalog.", true);
      settingsModal.style.display = "none";
      initAppMusic();
    }
  });

  // Mobile bottom navigation triggers
  const mHome = document.getElementById("mobile-nav-home");
  const mSearch = document.getElementById("mobile-nav-search");
  const mLibrary = document.getElementById("mobile-nav-library");
  
  if (mHome) mHome.addEventListener("click", () => switchView("home"));
  if (mSearch) mSearch.addEventListener("click", () => switchView("search"));
  if (mLibrary) mLibrary.addEventListener("click", () => switchView("library"));

  // Filter chips event listeners
  const filterChips = document.querySelectorAll(".filter-chip");
  filterChips.forEach(chip => {
    chip.addEventListener("click", () => {
      filterChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentVoiceFilter = chip.dataset.filter;
      renderHomeTracks();
      showToast(`Filtered: ${chip.innerText}`);
    });
  });
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
