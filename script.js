let allMemes = [];
let filteredMemes = [];

// DOM elements
const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const refreshBtn = document.getElementById('refreshBtn');
const memeCount = document.getElementById('memeCount');
const loading = document.getElementById('loading');
const empty = document.getElementById('empty');

// Load memes on page load
document.addEventListener('DOMContentLoaded', loadMemes);

// Event listeners
searchInput.addEventListener('input', filterMemes);
sortSelect.addEventListener('change', sortMemes);
refreshBtn.addEventListener('click', loadMemes);

async function loadMemes() {
    loading.style.display = 'block';
    gallery.innerHTML = '';
    empty.style.display = 'none';

    try {
        const response = await fetch('/api/memes');
        const data = await response.json();
        
        allMemes = data.memes || [];
        filteredMemes = [...allMemes];
        
        if (allMemes.length === 0) {
            loading.style.display = 'none';
            empty.style.display = 'block';
            memeCount.textContent = '0';
        } else {
            sortMemes();
            displayMemes();
            loading.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading memes:', error);
        loading.style.display = 'none';
        empty.style.display = 'block';
        empty.textContent = 'Error loading memes. Make sure the server is running!';
    }
}

function filterMemes() {
    const searchTerm = searchInput.value.toLowerCase();
    filteredMemes = allMemes.filter(meme => 
        meme.name.toLowerCase().includes(searchTerm)
    );
    displayMemes();
}

function sortMemes() {
    const sortBy = sortSelect.value;
    
    filteredMemes.sort((a, b) => {
        if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'date') {
            return new Date(b.date) - new Date(a.date);
        }
        return 0;
    });
    
    displayMemes();
}

function displayMemes() {
    gallery.innerHTML = '';
    memeCount.textContent = filteredMemes.length;

    filteredMemes.forEach(meme => {
        const card = createMemeCard(meme);
        gallery.appendChild(card);
    });
}

function createMemeCard(meme) {
    const card = document.createElement('div');
    card.className = 'meme-card';
    
    let mediaElement;
    if (meme.type === 'video') {
        mediaElement = document.createElement('video');
        mediaElement.src = `/memes/${encodeURIComponent(meme.filename)}`;
        mediaElement.controls = true;
        mediaElement.loop = true;
        mediaElement.muted = true;
        mediaElement.playsInline = true;
        mediaElement.preload = 'metadata';
    } else {
        mediaElement = document.createElement('img');
        mediaElement.src = `/memes/${encodeURIComponent(meme.filename)}`;
        mediaElement.alt = meme.name;
        mediaElement.loading = 'lazy';
    }
    
    const info = document.createElement('div');
    info.className = 'meme-info';
    
    const name = document.createElement('div');
    name.className = 'meme-name';
    name.textContent = meme.name;
    
    const date = document.createElement('div');
    date.className = 'meme-date';
    date.textContent = new Date(meme.date).toLocaleDateString();
    
    info.appendChild(name);
    info.appendChild(date);
    card.appendChild(mediaElement);
    card.appendChild(info);
    
    // Click to view fullsize
    card.addEventListener('click', (e) => {
        // Don't open modal if clicking on video controls
        if (e.target.tagName !== 'VIDEO') {
            openModal(mediaElement.src, meme.name, meme.type);
        }
    });
    
    return card;
}

function openModal(src, alt, type) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    let mediaElement;
    if (type === 'video') {
        mediaElement = document.createElement('video');
        mediaElement.className = 'modal-content';
        mediaElement.src = src;
        mediaElement.controls = true;
        mediaElement.autoplay = true;
        mediaElement.loop = true;
    } else {
        mediaElement = document.createElement('img');
        mediaElement.className = 'modal-content';
        mediaElement.src = src;
        mediaElement.alt = alt;
    }
    
    const close = document.createElement('span');
    close.className = 'modal-close';
    close.innerHTML = '&times;';
    close.onclick = () => modal.remove();
    
    modal.appendChild(close);
    modal.appendChild(mediaElement);
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
    
    document.body.appendChild(modal);
}
