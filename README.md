# Cat Memes Database 🐱

WORKS BEST ON DESKTOP!!!!

## Features

- **Upload cat memes** (images & videos) with custom names
- **Vote system** - upvote your favorites (prevents double voting)
- **Custom video player** with auto-play and mute
- **Search & filter** - find memes by name or type
- **Beautiful UI** - custom color palette with smooth animations
- **Keyboard shortcuts** - press `U` to upload, `R` to refresh
- **Sort options** - by votes, name, date, or type

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express, Multer, CORS
- **Storage**: Filesystem (memes) + JSON (votes) - **Persistent on Railway**
- **Deployment**: GitHub Pages + Railway

## Deployment Instructions

### 1. Deploy Backend to Railway
1. Go to https://railway.app and sign up
2. Click **New Project** → **Deploy from GitHub repo**
3. Select `tbdfrfr/Catmemes.db`
4. Railway auto-detects Node.js and deploys
5. Go to **Settings** → **Networking** → **Generate Domain**
6. Copy your URL: `https://your-app.up.railway.app`

### Managing Uploads
Use Railway CLI to remove unwanted files:
```bash
railway shell
cd memes
rm unwanted-file.jpg
```


## Color Palette

- Primary: `#0FA3B1` (Teal)
- Secondary: `#B5E2FA` (Sky Blue)
- Light: `#F9F7F3` (Cream)
- Accent: `#EDDEA4` (Gold)
- Warm: `#F7A072` (Coral)
