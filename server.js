const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(__dirname));

// Serve memes folder
app.use('/memes', express.static(path.join(__dirname, 'memes')));

// API endpoint to get all memes
app.get('/api/memes', (req, res) => {
    const memesFolder = path.join(__dirname, 'memes');
    
    // Create memes folder if it doesn't exist
    if (!fs.existsSync(memesFolder)) {
        fs.mkdirSync(memesFolder);
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
                type: videoExtensions.includes(ext) ? 'video' : 'image'
            };
        });
        
        res.json({ memes, count: memes.length });
    });
});

app.listen(PORT, () => {
    console.log(`🐱 Cat Memes Database running at http://localhost:${PORT}`);
    console.log(`📁 Add your cat memes to the "memes" folder`);
});
