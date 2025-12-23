 const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins with all methods
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Use Railway volume for persistent storage, fallback to local for development
const STORAGE_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH || __dirname;
const memesFolder = path.join(STORAGE_PATH, 'memes');
const votesFile = path.join(STORAGE_PATH, 'votes.json');

// Ensure memes folder exists
if (!fs.existsSync(memesFolder)) {
    fs.mkdirSync(memesFolder, { recursive: true });
}

// Vote storage
let votes = {};

// Load votes from file if it exists
if (fs.existsSync(votesFile)) {
    try {
        votes = JSON.parse(fs.readFileSync(votesFile, 'utf8'));
    } catch (e) {
        votes = {};
    }
}

// Save votes to file
function saveVotes() {
    fs.writeFileSync(votesFile, JSON.stringify(votes, null, 2));
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, memesFolder);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = /jpeg|jpg|png|gif|webp|bmp|mp4|webm|mov|avi|mkv/;
        const allowedMimeTypes = /image\/(jpeg|jpg|png|gif|webp|bmp)|video\/(mp4|webm|quicktime|x-msvideo|x-matroska)/;
        
        const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedMimeTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed!'));
        }
    }
});

// Serve static files
app.use(express.static(__dirname));

// Serve memes folder
app.use('/memes', express.static(memesFolder));

// API endpoint to get all memes
app.get('/api/memes', (req, res) => {
    // Create memes folder if it doesn't exist
    if (!fs.existsSync(memesFolder)) {
        fs.mkdirSync(memesFolder, { recursive: true });
    }
    
    fs.readdir(memesFolder, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to read memes folder' });
        }
        
        // Filter for image and video files
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
        const videoExtensions = ['.mp4', '.webm', '.mov'];
        const mediaExtensions = [...imageExtensions, ...videoExtensions];
        const mediaFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return mediaExtensions.includes(ext);
        });
        
        // Get file stats for each media file
        const memes = mediaFiles.map(file => {
            const filePath = path.join(memesFolder, file);
            const stats = fs.statSync(filePath);
            const ext = path.extname(file).toLowerCase();
            
            return {
                filename: file,
                name: path.parse(file).name,
                date: stats.mtime,
                size: stats.size,
                type: videoExtensions.includes(ext) ? 'video' : 'image',
                votes: votes[file] || 0
            };
        });
        
        res.json({ memes, count: memes.length });
    });
});

// API endpoint to upload memes
app.post('/api/upload', upload.single('meme'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        res.json({
            success: true,
            filename: req.file.filename,
            message: 'File uploaded successfully!'
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to vote on a meme
app.post('/api/vote', (req, res) => {
    try {
        const { filename } = req.body;
        
        if (!filename) {
            return res.status(400).json({ error: 'Filename required' });
        }
        
        // Initialize vote count if it doesn't exist
        if (!votes[filename]) {
            votes[filename] = 0;
        }
        
        // Increment vote
        votes[filename]++;
        
        // Save votes to file
        saveVotes();
        
        res.json({
            success: true,
            votes: votes[filename]
        });
    } catch (error) {
        console.error('Vote error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🐱 Cat Memes Database running at http://localhost:${PORT}`);
    console.log(`📁 Memes folder: ${path.join(__dirname, 'memes')}`);
    console.log(`📤 Upload memes through the web interface!`);
});
