# Cat Memes Database 🐱

A beautiful, interactive web application to browse, upload, and vote on cat memes with a custom color palette and smooth animations.

## Features

- 📤 **Upload cat memes** (images & videos) with custom names
- 👍 **Vote system** - upvote your favorites (prevents double voting)
- 🎥 **Custom video player** with auto-play and mute
- 🔍 **Search & filter** - find memes by name or type
- 🎨 **Beautiful UI** - custom color palette with smooth animations
- ⌨️ **Keyboard shortcuts** - press `U` to upload, `R` to refresh
- 📊 **Sort options** - by votes, name, date, or type

## Deployment Guide

This app uses a **split architecture**:
- **Frontend**: GitHub Pages (static files)
- **Backend**: Render.com (Node.js API)

### Step 1: Deploy Backend to Render

1. **Create a Render account** at https://render.com
2. **Create a new Web Service**:
   - Connect your GitHub repository
   - Name: `catmemes-backend` (or any name you like)
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`
3. **Wait for deployment** - Render will give you a URL like:
   ```
   https://catmemes-backend.onrender.com
   ```
4. **Copy this URL** - you'll need it for the frontend

### Step 2: Configure Frontend

1. **Edit `config.js`** and replace the backend URL:
   ```javascript
   const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
       ? 'http://localhost:3000'
       : 'https://YOUR-BACKEND-NAME.onrender.com'; // Replace with your Render URL
   ```

2. **Commit and push** to GitHub:
   ```bash
   git add config.js
   git commit -m "Update backend URL"
   git push origin main
   ```

### Step 3: Deploy Frontend to GitHub Pages

1. **Go to your GitHub repository settings**
2. **Navigate to Pages** (left sidebar)
3. **Source**: Deploy from a branch
4. **Branch**: `main` / `(root)`
5. **Save**

GitHub will deploy your site to:
```
https://YOUR-USERNAME.github.io/Catmemes.db/
```

### Step 4: Enable GitHub Actions (Optional)

The `.github/workflows/pages.yml` file will auto-deploy on every push. To enable:

1. Go to **Settings** → **Actions** → **General**
2. Enable **Read and write permissions**
3. Enable **Allow GitHub Actions to create and approve pull requests**

### Local Development

```bash
# Install dependencies
npm install

# Start the backend server
npm start

# Open index.html in your browser
# Or use a local server: python -m http.server 8000
```

The backend runs on `http://localhost:3000` and the config.js automatically uses this URL for local development.

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express, Multer
- **Storage**: Filesystem (memes) + JSON (votes)
- **Deployment**: GitHub Pages + Render.com

## Color Palette

- Primary: `#0FA3B1` (Teal)
- Secondary: `#B5E2FA` (Sky Blue)
- Light: `#F9F7F3` (Cream)
- Accent: `#EDDEA4` (Gold)
- Warm: `#F7A072` (Coral)

---

Made with ❤️ for cat lovers everywhere!