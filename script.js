// Configuration for API endpoint
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080'
    : 'https://catmemesdb-production.up.railway.app';

console.log('Cat Memes DB: API Base URL:', API_BASE_URL);
console.log('Cat Memes DB: Current hostname:', window.location.hostname);

let allMemes = [];
let filteredMemes = [];
let currentFilter = 'all'; // 'all', 'image', 'video'
let displayedCount = 0;
const ITEMS_PER_PAGE = window.innerWidth < 768 ? 12 : 20; // Fewer items on mobile
let isLoadingMore = false;
let activeObservers = new Map(); // Track observers for cleanup

// Mobile state
const isMobile = window.innerWidth <= 768;
let currentMobileIndex = 0;
let touchStartY = 0;

// DOM elements - will be initialized after DOMContentLoaded
let gallery, searchInput, sortSelect, refreshBtn, uploadBtn, memeCount, imageCount, videoCount, loading, empty;
let uploadModal, uploadModalClose, dropZone, fileInput, memeName, uploadSubmit, preview, previewMedia, uploadProgress;

let selectedFile = null;

// Load memes on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    gallery = !isMobile ? document.getElementById('gallery') : null;
    searchInput = document.getElementById('searchInput');
    sortSelect = !isMobile ? document.getElementById('sortSelect') : null;
    refreshBtn = !isMobile ? document.getElementById('refreshBtn') : null;
    uploadBtn = document.getElementById('uploadBtn');
    memeCount = !isMobile ? document.getElementById('memeCount') : null;
    imageCount = !isMobile ? document.getElementById('imageCount') : null;
    videoCount = !isMobile ? document.getElementById('videoCount') : null;
    loading = !isMobile ? document.getElementById('loading') : null;
    empty = !isMobile ? document.getElementById('empty') : null;
    
    // Upload modal elements
    uploadModal = document.getElementById('uploadModal');
    uploadModalClose = document.querySelector('.upload-modal-close');
    dropZone = document.getElementById('dropZone');
    fileInput = document.getElementById('fileInput');
    memeName = document.getElementById('memeName');
    uploadSubmit = document.getElementById('uploadSubmit');
    preview = document.getElementById('preview');
    previewMedia = document.getElementById('previewMedia');
    uploadProgress = document.getElementById('uploadProgress');
    
    // Set up event listeners
    if (!isMobile) {
        searchInput.addEventListener('input', filterMemes);
        sortSelect.addEventListener('change', sortMemes);
        refreshBtn.addEventListener('click', loadMemes);
        
        // Stat badge click handlers for filtering
        document.querySelector('.stat-badge:nth-child(1)').addEventListener('click', () => {
            currentFilter = currentFilter === 'image' ? 'all' : 'image';
            updateStatBadgeStyles();
            filterMemes();
        });

        document.querySelector('.stat-badge:nth-child(2)').addEventListener('click', () => {
            currentFilter = currentFilter === 'video' ? 'all' : 'video';
            updateStatBadgeStyles();
            filterMemes();
        });
    }
    
    uploadBtn.addEventListener('click', openUploadModal);
    uploadModalClose.addEventListener('click', closeUploadModal);
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    memeName.addEventListener('input', checkUploadReady);
    uploadSubmit.addEventListener('click', handleUpload);
    
    // Drag and drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            handleFileSelect({ target: { files: e.dataTransfer.files } });
        }
    });

    // Close modal when clicking outside
    uploadModal.addEventListener('click', (e) => {
        if (e.target === uploadModal) {
            closeUploadModal();
        }
    });
    
    // Set up mobile or desktop
    if (isMobile) {
        setupMobileViewer();
    } else {
        initScrollToTop();
        addTooltips();
        setupInfiniteScroll();
    }
    
    // Load memes
    loadMemes();
});

function openUploadModal() {
    uploadModal.classList.add('active');
    resetUploadForm();
}

function closeUploadModal() {
    uploadModal.classList.remove('active');
    resetUploadForm();
}

function resetUploadForm() {
    selectedFile = null;
    fileInput.value = '';
    memeName.value = '';
    preview.style.display = 'none';
    previewMedia.innerHTML = '';
    uploadSubmit.disabled = true;
    uploadProgress.style.display = 'none';
    dropZone.style.display = 'block';
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's an image or video
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
        alert('Please select an image or video file!');
        return;
    }

    selectedFile = file;
    
    // Auto-generate name from filename
    const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
    memeName.value = fileName;

    // Show preview
    previewMedia.innerHTML = '';
    const reader = new FileReader();
    reader.onload = (e) => {
        if (isImage) {
            const img = document.createElement('img');
            img.src = e.target.result;
            previewMedia.appendChild(img);
        } else {
            const video = document.createElement('video');
            video.src = e.target.result;
            video.controls = true;
            video.muted = true;
            previewMedia.appendChild(video);
        }
        dropZone.style.display = 'none';
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);

    checkUploadReady();
}

function checkUploadReady() {
    uploadSubmit.disabled = !(selectedFile && memeName.value.trim());
}

async function handleUpload() {
    if (!selectedFile || !memeName.value.trim()) return;

    const formData = new FormData();
    const extension = selectedFile.name.split('.').pop();
    const newFilename = `${memeName.value.trim()}.${extension}`;
    formData.append('meme', selectedFile, newFilename);

    uploadSubmit.disabled = true;
    uploadProgress.style.display = 'block';
    const progressFill = document.querySelector('.progress-fill');

    try {
        // Simulate progress animation
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            if (progress <= 90) {
                progressFill.style.width = progress + '%';
            }
        }, 100);

        const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            body: formData
        });

        clearInterval(progressInterval);
        progressFill.style.width = '100%';

        if (response.ok) {
            setTimeout(() => {
                closeUploadModal();
                loadMemes();
            }, 500);
        } else {
            const error = await response.json();
            alert('Upload failed: ' + (error.error || 'Unknown error'));
            uploadSubmit.disabled = false;
            uploadProgress.style.display = 'none';
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed! Make sure the server is running.');
        uploadSubmit.disabled = false;
        uploadProgress.style.display = 'none';
    }
}

async function loadMemes() {
    console.log('Loading memes from:', API_BASE_URL + '/api/memes');
    if (!isMobile) {
        loading.style.display = 'block';
        gallery.innerHTML = '';
        empty.style.display = 'none';
    }
    displayedCount = 0;

    try {
        const response = await fetch(`${API_BASE_URL}/api/memes`);
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        console.log('Loaded memes:', data.memes.length, 'memes');
        
        allMemes = data.memes || [];
        filteredMemes = [...allMemes];
        
        if (!isMobile) {
            // Update counts
            const images = allMemes.filter(m => m.type === 'image').length;
            const videos = allMemes.filter(m => m.type === 'video').length;
            imageCount.textContent = images;
            videoCount.textContent = videos;
        }
        
        if (allMemes.length === 0) {
            if (!isMobile) {
                loading.style.display = 'none';
                empty.style.display = 'block';
                memeCount.textContent = '0';
            }
        } else {
            if (!isMobile) {
                sortMemes();
            }
            displayMemes();
            if (!isMobile) {
                loading.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error loading memes:', error);
        if (!isMobile) {
            loading.style.display = 'none';
            empty.style.display = 'block';
            empty.innerHTML = `<div class="empty-icon">⚠️</div><p>Error loading memes: ${error.message}</p>`;
        } else {
            alert(`Error loading memes: ${error.message}`);
        }
    }
}

function filterMemes() {
    const searchTerm = searchInput.value.toLowerCase();
    filteredMemes = allMemes.filter(meme => {
        const matchesSearch = meme.name.toLowerCase().includes(searchTerm);
        const matchesType = currentFilter === 'all' || meme.type === currentFilter;
        return matchesSearch && matchesType;
    });
    updateFilterIndicator(searchTerm);
    displayMemes();
}

function updateStatBadgeStyles() {
    const imageBadge = document.querySelector('.stat-badge:nth-child(1)');
    const videoBadge = document.querySelector('.stat-badge:nth-child(2)');
    
    if (currentFilter === 'image') {
        imageBadge.classList.add('active');
        videoBadge.classList.remove('active');
    } else if (currentFilter === 'video') {
        videoBadge.classList.add('active');
        imageBadge.classList.remove('active');
    } else {
        imageBadge.classList.remove('active');
        videoBadge.classList.remove('active');
    }
}

function sortMemes() {
    const sortBy = sortSelect.value;
    
    filteredMemes.sort((a, b) => {
        if (sortBy === 'votes') {
            return (b.votes || 0) - (a.votes || 0);
        } else if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'date') {
            return new Date(b.date) - new Date(a.date);
        } else if (sortBy === 'type') {
            return a.type.localeCompare(b.type);
        }
        return 0;
    });
    
    displayMemes();
}

function displayMemes() {
    if (isMobile) {
        // On mobile, just render the first meme if available
        if (filteredMemes.length > 0) {
            currentMobileIndex = 0;
            renderMobileMeme();
        }
        return;
    }
    
    gallery.innerHTML = '';
    displayedCount = 0;
    memeCount.textContent = filteredMemes.length;
    
    loadMoreMemes();
}

function loadMoreMemes() {
    if (isLoadingMore || displayedCount >= filteredMemes.length) return;
    
    isLoadingMore = true;
    const end = Math.min(displayedCount + ITEMS_PER_PAGE, filteredMemes.length);
    
    // Use requestAnimationFrame for smoother rendering
    requestAnimationFrame(() => {
        for (let i = displayedCount; i < end; i++) {
            const card = createMemeCard(filteredMemes[i]);
            gallery.appendChild(card);
        }
        
        displayedCount = end;
        isLoadingMore = false;
    });
}

function setupInfiniteScroll() {
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollPosition = window.innerHeight + window.scrollY;
            const threshold = document.documentElement.scrollHeight - 800; // Increased threshold
            
            if (scrollPosition >= threshold && !isLoadingMore) {
                loadMoreMemes();
            }
            
            // Clean up far away cards on mobile to save memory
            if (window.innerWidth < 768) {
                cleanupDistantCards();
            }
        }, 100);
    });
}

function cleanupDistantCards() {
    const cards = gallery.querySelectorAll('.meme-card');
    const viewportHeight = window.innerHeight;
    const scrollTop = window.scrollY;
    
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardTop = scrollTop + rect.top;
        const distanceFromView = Math.abs(cardTop - scrollTop - viewportHeight / 2);
        
        // Remove cards that are more than 3 screens away
        if (distanceFromView > viewportHeight * 3) {
            const observer = activeObservers.get(card.querySelector('.video-wrapper'));
            if (observer) {
                observer.disconnect();
                activeObservers.delete(card.querySelector('.video-wrapper'));
            }
            card.remove();
        }
    });
}

function createMemeCard(meme) {
    const card = document.createElement('div');
    card.className = 'meme-card';
    
    let mediaElement;
    if (meme.type === 'video') {
        // Create video wrapper for better UI
        const videoWrapper = document.createElement('div');
        videoWrapper.className = 'video-wrapper';
        
        mediaElement = document.createElement('video');
        const videoUrl = `${API_BASE_URL}/memes/${encodeURIComponent(meme.filename)}`;
        console.log('Creating video element:', videoUrl);
        mediaElement.dataset.src = videoUrl; // Store URL in dataset
        mediaElement.loop = true;
        mediaElement.muted = true;
        mediaElement.playsInline = true;
        mediaElement.preload = 'none';
        mediaElement.style.backgroundColor = '#000';
        
        // Use Intersection Observer to autoplay and manage memory
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Load and play when visible
                    if (!mediaElement.src) {
                        mediaElement.src = mediaElement.dataset.src;
                        mediaElement.load();
                    }
                    mediaElement.play().catch(e => console.log('Autoplay prevented:', e));
                } else {
                    // Pause and unload when far away
                    mediaElement.pause();
                    const rect = entry.boundingClientRect;
                    const viewportHeight = window.innerHeight;
                    const distanceFromView = Math.abs(rect.top - viewportHeight / 2);
                    
                    // Unload video if it's more than 2 screens away
                    if (distanceFromView > viewportHeight * 2) {
                        mediaElement.src = '';
                        mediaElement.load(); // Force unload
                    }
                }
            });
        }, { threshold: 0.25, rootMargin: '100px' });
        
        observer.observe(videoWrapper);
        activeObservers.set(videoWrapper, observer);
        
        // Also play on hover for desktop
        videoWrapper.addEventListener('mouseenter', () => {
            mediaElement.play().catch(e => console.log('Play failed:', e));
        });
        
        videoWrapper.addEventListener('mouseleave', () => {
            // Don't pause on desktop hover out - let IntersectionObserver handle it
        });
        
        // Click to open fullscreen
        videoWrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal(meme);
        });
        
        // Video overlay with play icon
        const overlay = document.createElement('div');
        overlay.className = 'video-overlay';
        overlay.innerHTML = '<div class="play-icon">▶</div>';
        
        // Video badge
        const badge = document.createElement('div');
        badge.className = 'video-badge';
        badge.textContent = '🎬 VIDEO';
        
        videoWrapper.appendChild(mediaElement);
        videoWrapper.appendChild(overlay);
        videoWrapper.appendChild(badge);
        card.appendChild(videoWrapper);
    } else {
        mediaElement = document.createElement('img');
        const imageUrl = `${API_BASE_URL}/memes/${encodeURIComponent(meme.filename)}`;
        console.log('Creating image element:', imageUrl);
        mediaElement.src = imageUrl;
        mediaElement.alt = meme.name;
        mediaElement.loading = 'lazy';
        
        // Add error handler for images
        mediaElement.onerror = function() {
            console.error('Failed to load image:', imageUrl);
            this.alt = `Failed to load: ${meme.name}`;
            this.style.backgroundColor = '#f0f0f0';
        };
        
        mediaElement.onload = function() {
            console.log('Successfully loaded image:', imageUrl);
        };
        
        card.appendChild(mediaElement);
    }
    
    const info = document.createElement('div');
    info.className = 'meme-info';
    
    const name = document.createElement('div');
    name.className = 'meme-name';
    
    // Highlight search term
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm && meme.name.toLowerCase().includes(searchTerm)) {
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        name.innerHTML = meme.name.replace(regex, '<mark>$1</mark>');
    } else {
        name.textContent = meme.name;
    }
    
    const date = document.createElement('div');
    date.className = 'meme-date';
    date.textContent = new Date(meme.date).toLocaleDateString();
    
    // Voting system
    const voteContainer = document.createElement('div');
    voteContainer.className = 'vote-container';
    
    const voteBtn = document.createElement('button');
    voteBtn.className = 'vote-btn';
    const hasVoted = checkIfVoted(meme.filename);
    voteBtn.classList.toggle('voted', hasVoted);
    voteBtn.innerHTML = hasVoted ? '❤️' : '🤍';
    
    const voteCount = document.createElement('span');
    voteCount.className = 'vote-count';
    voteCount.textContent = meme.votes || 0;
    
    voteBtn.onclick = async (e) => {
        e.stopPropagation();
        // Check if already voted on each click
        const currentlyVoted = checkIfVoted(meme.filename);
        if (!currentlyVoted) {
            const success = await voteMeme(meme.filename);
            if (success) {
                voteBtn.classList.add('voted');
                voteBtn.innerHTML = '❤️';
                voteCount.textContent = parseInt(voteCount.textContent) + 1;
                markAsVoted(meme.filename);
                voteBtn.classList.add('vote-animation');
                setTimeout(() => voteBtn.classList.remove('vote-animation'), 600);
                // Update meme votes in allMemes array
                const memeIndex = allMemes.findIndex(m => m.filename === meme.filename);
                if (memeIndex !== -1) {
                    allMemes[memeIndex].votes = parseInt(voteCount.textContent);
                }
            }
        }
    };
    
    voteContainer.appendChild(voteBtn);
    voteContainer.appendChild(voteCount);
    
    info.appendChild(name);
    info.appendChild(date);
    info.appendChild(voteContainer);
    card.appendChild(info);
    
    // Click to view fullsize (only for images, videos handle their own clicks)
    if (meme.type === 'image') {
        card.addEventListener('click', () => {
            openModal(meme);
        });
    }
    
    return card;
}

function openModal(meme) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    const close = document.createElement('span');
    close.className = 'modal-close';
    close.innerHTML = '&times;';
    close.onclick = () => modal.remove();
    
    modal.appendChild(close);
    
    if (meme.type === 'video') {
        const videoPlayer = createCustomVideoPlayer(meme);
        modal.appendChild(videoPlayer);
    } else {
        const img = document.createElement('img');
        img.className = 'modal-content';
        img.src = `${API_BASE_URL}/memes/${encodeURIComponent(meme.filename)}`;
        img.alt = meme.name;
        modal.appendChild(img);
    }
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
    
    document.body.appendChild(modal);
}

function createCustomVideoPlayer(meme) {
    const container = document.createElement('div');
    container.className = 'custom-video-player';
    
    const video = document.createElement('video');
    video.className = 'modal-video';
    video.src = `${API_BASE_URL}/memes/${encodeURIComponent(meme.filename)}`;
    video.autoplay = true;
    video.loop = true;
    video.muted = false; // Unmute by default
    video.playsInline = true;
    
    const controls = document.createElement('div');
    controls.className = 'custom-video-controls';
    
    // Play/Pause button
    const playBtn = document.createElement('button');
    playBtn.className = 'control-btn play-pause-btn';
    playBtn.innerHTML = '⏸';
    playBtn.onclick = () => togglePlay(video, playBtn);
    
    // Timeline
    const timeline = document.createElement('div');
    timeline.className = 'video-timeline';
    const progress = document.createElement('div');
    progress.className = 'video-progress';
    timeline.appendChild(progress);
    
    timeline.onclick = (e) => {
        const rect = timeline.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
    };
    
    // Update progress
    video.ontimeupdate = () => {
        const percent = (video.currentTime / video.duration) * 100;
        progress.style.width = percent + '%';
    };
    
    video.onended = () => {
        playBtn.innerHTML = '▶';
    };
    
    controls.appendChild(playBtn);
    controls.appendChild(timeline);
    
    container.appendChild(video);
    container.appendChild(controls);
    
    return container;
}

function togglePlay(video, btn) {
    if (video.paused) {
        video.play();
        btn.innerHTML = '⏸';
    } else {
        video.pause();
        btn.innerHTML = '▶';
    }
}

// Voting functions
function checkIfVoted(filename) {
    const voted = localStorage.getItem('voted_memes');
    if (!voted) return false;
    const votedArray = JSON.parse(voted);
    return votedArray.includes(filename);
}

function markAsVoted(filename) {
    let voted = localStorage.getItem('voted_memes');
    const votedArray = voted ? JSON.parse(voted) : [];
    if (!votedArray.includes(filename)) {
        votedArray.push(filename);
        localStorage.setItem('voted_memes', JSON.stringify(votedArray));
    }
}

async function voteMeme(filename) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filename })
        });
        
        if (response.ok) {
            return true;
        }
        return false;
    } catch (error) {
        console.error('Vote error:', error);
        return false;
    }
}

// Scroll to top functionality
function initScrollToTop() {
    const scrollBtn = document.getElementById('scrollToTop');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Filter indicator
function updateFilterIndicator(searchTerm) {
    const indicator = document.getElementById('filterIndicator');
    const filterText = indicator.querySelector('.filter-text');
    const clearBtn = indicator.querySelector('.clear-filter');
    
    const hasSearch = searchTerm.length > 0;
    const hasTypeFilter = currentFilter !== 'all';
    
    if (hasSearch || hasTypeFilter) {
        let text = 'Filtering: ';
        if (hasSearch) text += `"${searchTerm}"`;
        if (hasSearch && hasTypeFilter) text += ' + ';
        if (hasTypeFilter) text += `${currentFilter}s`;
        
        filterText.textContent = text;
        indicator.style.display = 'flex';
        
        clearBtn.onclick = () => {
            searchInput.value = '';
            currentFilter = 'all';
            updateStatBadgeStyles();
            filterMemes();
        };
    } else {
        indicator.style.display = 'none';
    }
}

// Add tooltips
function addTooltips() {
    // Add tooltip to upload button
    uploadBtn.setAttribute('title', 'Upload a new cat meme');
    refreshBtn.setAttribute('title', 'Refresh meme list');
    searchInput.setAttribute('title', 'Search memes by name');
    sortSelect.setAttribute('title', 'Sort memes');
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
    }
    
    // Escape to clear search
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        searchInput.blur();
        filterMemes();
    }
    
    // U to open upload
    if (e.key === 'u' && document.activeElement === document.body) {
        openUploadModal();
    }
});

// ============================================
// MOBILE-SPECIFIC ENHANCEMENTS
// ============================================

// Detect if user is on mobile device
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Prevent pull-to-refresh on mobile when scrolling at the top
let lastTouchY = 0;
if (isTouchDevice) {
    document.addEventListener('touchstart', (e) => {
        lastTouchY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        const touchY = e.touches[0].clientY;
        const touchYDelta = touchY - lastTouchY;
        lastTouchY = touchY;

        if (window.scrollY === 0 && touchYDelta > 0) {
            // Prevent pull-to-refresh
            if (e.cancelable) {
                e.preventDefault();
            }
        }
    }, { passive: false });
}

// Add touch feedback for interactive elements
if (isTouchDevice) {
    const interactiveElements = document.querySelectorAll('.vote-btn, .upload-btn, #refreshBtn, .stat-badge');
    
    interactiveElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.opacity = '0.7';
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.opacity = '1';
            }, 100);
        }, { passive: true });
        
        element.addEventListener('touchcancel', function() {
            this.style.opacity = '1';
        }, { passive: true });
    });
}

// Optimize video loading on mobile
function optimizeVideoForMobile() {
    if (isMobileDevice) {
        const videos = document.querySelectorAll('.meme-card video');
        videos.forEach(video => {
            // Keep preload as 'auto' to show first frame instead of black screen
            // Don't change to 'metadata' as that causes black screen
            video.setAttribute('playsinline', ''); // Prevent fullscreen on iOS
            
            // Ensure first frame is loaded
            if (video.readyState < 2) {
                video.load();
            }
            
            // Pause videos when they go out of view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting && !video.paused) {
                        video.pause();
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(video);
        });
    }
}

// Call video optimization when memes are loaded
const originalRenderMemes = renderMemes;
renderMemes = function(memes) {
    originalRenderMemes(memes);
    if (isMobileDevice) {
        setTimeout(optimizeVideoForMobile, 100);
    }
};

// Improve scroll performance on mobile
let scrollTimeout;
let isScrolling = false;

window.addEventListener('scroll', () => {
    if (!isScrolling) {
        isScrolling = true;
        document.body.classList.add('is-scrolling');
    }
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
        document.body.classList.remove('is-scrolling');
    }, 150);
}, { passive: true });

// Add swipe gesture support for modal
if (isTouchDevice && uploadModal) {
    let touchStartY = 0;
    let touchEndY = 0;
    
    uploadModal.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    uploadModal.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].clientY;
        handleSwipeGesture();
    }, { passive: true });
    
    function handleSwipeGesture() {
        const swipeDistance = touchStartY - touchEndY;
        
        // Swipe down to close modal (at least 100px swipe)
        if (swipeDistance < -100 && uploadModal.classList.contains('active')) {
            closeUploadModal();
        }
    }
}

// Optimize search input on mobile
if (isMobile && searchInput) {
    // Debounce search input on mobile for better performance
    let searchTimeout;
    const originalSearchHandler = searchInput.oninput;
    
    searchInput.oninput = function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (originalSearchHandler) {
                originalSearchHandler.call(this, e);
            }
        }, 300); // 300ms debounce
    };
}

// Handle orientation change
window.addEventListener('orientationchange', () => {
    // Reload gallery layout after orientation change
    setTimeout(() => {
        if (typeof filterMemes === 'function') {
            filterMemes();
        }
    }, 100);
});

// Add double-tap to zoom prevention on interactive elements
if (isTouchDevice) {
    const preventDoubleTap = (element) => {
        let lastTap = 0;
        element.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) {
                e.preventDefault();
            }
            lastTap = currentTime;
        });
    };
    
    const elements = document.querySelectorAll('.vote-btn, .upload-btn, #refreshBtn');
    elements.forEach(preventDoubleTap);
}

// Log mobile device info for debugging
if (isMobileDevice) {
    console.log('Mobile device detected');
    console.log('Screen size:', window.innerWidth, 'x', window.innerHeight);
    console.log('Device pixel ratio:', window.devicePixelRatio);
    console.log('Touch support:', isTouchDevice);
}

// ========== MOBILE TIKTOK VIEWER ==========

function setupMobileViewer() {
    const container = document.querySelector('.mobile-media-container');
    const searchInput = document.getElementById('mobileSearchInput');
    const uploadBtn = document.getElementById('mobileUploadBtn');
    const likeBtn = document.getElementById('mobileLikeBtn');
    
    // Add clear button to search
    const searchContainer = searchInput.parentElement;
    const clearBtn = document.createElement('button');
    clearBtn.innerHTML = '✕';
    clearBtn.style.cssText = 'position:absolute;right:58px;top:50%;transform:translateY(-50%);width:32px;height:32px;border-radius:50%;border:none;background:rgba(255,255,255,0.3);color:white;font-size:16px;display:none;z-index:20;cursor:pointer;';
    clearBtn.onclick = () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        filteredMemes = [...allMemes];
        currentMobileIndex = 0;
        renderMobileMeme();
    };
    searchContainer.style.position = 'relative';
    searchContainer.appendChild(clearBtn);
    
    // Swipe gestures
    container.addEventListener('touchstart', e => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    container.addEventListener('touchend', e => {
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentMobileIndex < filteredMemes.length - 1) {
                currentMobileIndex++;
                renderMobileMeme();
                // After user interaction, subsequent videos can play with sound
            } else if (diff < 0 && currentMobileIndex > 0) {
                currentMobileIndex--;
                renderMobileMeme();
            }
        }
    });
    
    // Tap to pause/play video and unmute
    container.addEventListener('click', e => {
        const video = container.querySelector('video');
        if (video) {
            if (video.paused) {
                video.muted = false; // Ensure sound is on when user interacts
                video.play();
            } else {
                video.pause();
            }
        }
    });
    
    // Search with clear button
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        
        // Show/hide clear button
        clearBtn.style.display = query ? 'flex' : 'none';
        
        filteredMemes = query ? allMemes.filter(m => m.name.toLowerCase().includes(query)) : [...allMemes];
        currentMobileIndex = 0;
        if (filteredMemes.length > 0) {
            renderMobileMeme();
        } else {
            // Show no results message
            const container = document.querySelector('.mobile-media-container');
            container.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#fff;font-size:18px;text-align:center;padding:20px;">No memes found 😿<br><small style="font-size:14px;opacity:0.7;margin-top:10px;display:block;">Try a different search</small></div>';
        }
    });
    
    // Clear search on double tap
    let searchTapTimeout;
    searchInput.addEventListener('focus', () => {
        if (searchInput.value) {
            searchInput.select();
        }
    });
    
    // Upload button
    if (uploadBtn) {
        uploadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Mobile upload button clicked');
            openUploadModal();
        });
    }
    
    // Like button
    likeBtn.addEventListener('click', handleMobileLike);
}

function renderMobileMeme() {
    if (!filteredMemes.length) return;
    
    const meme = filteredMemes[currentMobileIndex];
    const container = document.querySelector('.mobile-media-container');
    const nameEl = document.querySelector('.mobile-meme-name');
    const posEl = document.querySelector('.mobile-position');
    const likeBtn = document.getElementById('mobileLikeBtn');
    const voteCount = likeBtn.querySelector('.mobile-vote-count');
    
    container.innerHTML = '';
    
    let media;
    if (meme.type === 'video') {
        media = document.createElement('video');
        media.src = `${API_BASE_URL}/memes/${encodeURIComponent(meme.filename)}`;
        media.autoplay = true;
        media.loop = true;
        media.playsInline = true;
        media.muted = false; // Enable sound for mobile
        
        // Try to play with sound, fallback to muted if blocked
        media.play().catch(err => {
            console.log('Autoplay with sound blocked, trying muted:', err);
            media.muted = true;
            media.play().catch(e => console.log('Muted autoplay also failed:', e));
        });
    } else {
        media = document.createElement('img');
        media.src = `${API_BASE_URL}/memes/${encodeURIComponent(meme.filename)}`;
        media.alt = meme.name;
    }
    
    container.appendChild(media);
    nameEl.textContent = meme.name;
    posEl.textContent = `${currentMobileIndex + 1} / ${filteredMemes.length}`;
    voteCount.textContent = meme.votes || 0;
    
    likeBtn.classList.toggle('liked', checkIfVoted(meme.filename));
    likeBtn.dataset.filename = meme.filename;
}

async function handleMobileLike(e) {
    e.stopPropagation(); // Prevent triggering video pause
    const likeBtn = document.getElementById('mobileLikeBtn');
    const filename = likeBtn.dataset.filename;
    
    if (!filename) {
        console.log('No filename set');
        return;
    }
    
    if (checkIfVoted(filename)) {
        console.log('Already voted for:', filename);
        return;
    }
    
    const success = await voteMeme(filename);
    if (success) {
        markAsVoted(filename);
        const meme = filteredMemes[currentMobileIndex];
        meme.votes = (meme.votes || 0) + 1;
        likeBtn.classList.add('liked');
        likeBtn.querySelector('.mobile-vote-count').textContent = meme.votes;
        
        // Heart animation
        const heart = document.createElement('div');
        heart.textContent = '❤️';
        heart.style.cssText = 'position:fixed;left:50%;top:50%;font-size:80px;animation:heartFloat 1s ease;z-index:20000;pointer-events:none;';
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1000);
    }
}

// Override displayMemes for mobile
const origDisplay = displayMemes;
displayMemes = function() {
    if (isMobileDevice) {
        currentMobileIndex = 0;
        renderMobileMeme();
    } else {
        origDisplay();
    }
};

// Heart animation CSS
if (isMobileDevice) {
    const style = document.createElement('style');
    style.textContent = '@keyframes heartFloat { 0% { transform:translate(-50%,-50%) scale(0); opacity:1; } 50% { transform:translate(-50%,-50%) scale(1.2); } 100% { transform:translate(-50%,-60%) scale(1); opacity:0; } }';
    document.head.appendChild(style);
}
