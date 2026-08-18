# Spotify Glassmorphic Clone with Ringtone Monetization

A premium, modern web-based Spotify clone featuring full-screen ad overlays, a ₹19 INR ringtone activation flow, and playable music streams, styled with glassmorphism design elements.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pg27-018-collab/spotify-glassmorphic-clone)

## Key Features

* **Forced 15s Startup Ad**: Blocks the application when loaded or refreshed, prompting the user with a sponsor overlay. A 15-second countdown timer must finish to activate the enter button.
* **Set as Ringtone Monetization (₹19)**:
  - Omit subscription models; instead, purchase ringtones for individual tracks.
  - Scan-to-pay via dynamic UPI QR code generator (`upi://pay?pa=antigravity@ybl&pn=Antigravity&am=19&cu=INR`).
  - Alternate card verification form support.
  - Persistent unlocks (managed in browser `localStorage`) which populates the Library tab with direct MP3 downloads.
* **Glassmorphic User Interface**: Beautiful dark mode layouts using CSS `backdrop-filter: blur(25px)`, subtle translucent borders, and animated background glow blobs.
* **Audio Playback Engine**: Real music files (SoundHelix streams) supporting playlist filtering, interactive search, play/pause, seeks, skip, shuffle, repeat, and likes.
* **Scrolling Lyrics Sync**: Integrates a tab showing song lyrics that automatically highlights and scrolls to focus the currently playing lyric line.

## Getting Started

To run locally:
```bash
# Start a simple server using Python
python3 -m http.server 8000
```
Open **`http://localhost:8000`** in your browser.

## Deployment

Deploy this project directly to Vercel using the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pg27-018-collab/spotify-glassmorphic-clone)
