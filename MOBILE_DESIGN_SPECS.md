# Mobile Design Specifications

## 📱 Mobile Layout Structure

### Screen Size Adaptations

#### Desktop (1024px+)
```
┌────────────────────────────────────┐
│         🐱 Catmemes.db            │
│      Total Memes: 42               │
│  [🖼️ Images: 30] [🎬 Videos: 12]  │
└────────────────────────────────────┘
┌────────────────────────────────────┐
│ [🔍 Search] [Sort▼] [📤] [🔄]     │
└────────────────────────────────────┘
┌──────────┬──────────┬──────────┐
│  Meme 1  │  Meme 2  │  Meme 3  │
│  [Image] │  [Image] │  [Video] │
│  ❤️ 42   │  ❤️ 38   │  ❤️ 35   │
├──────────┼──────────┼──────────┤
│  Meme 4  │  Meme 5  │  Meme 6  │
└──────────┴──────────┴──────────┘
```

#### Tablet (768px - 1024px)
```
┌──────────────────────────────┐
│      🐱 Catmemes.db         │
│    Total Memes: 42           │
│ [🖼️ Images: 30] [🎬 12]     │
└──────────────────────────────┘
┌──────────────────────────────┐
│ [🔍 Search........]          │
│ [Sort by ▼........]          │
│ [📤 Upload Meme....]         │
│ [🔄 Refresh.......]          │
└──────────────────────────────┘
┌────────────┬────────────┐
│   Meme 1   │   Meme 2   │
│  [Image]   │  [Video]   │
│   ❤️ 42    │   ❤️ 38    │
├────────────┼────────────┤
│   Meme 3   │   Meme 4   │
└────────────┴────────────┘
```

#### Mobile (480px - 768px)
```
┌──────────────────────┐
│  🐱 Catmemes.db     │
│   Total Memes: 42   │
│  [🖼️ Images: 30]    │
│  [🎬 Videos: 12]    │
└──────────────────────┘
┌──────────────────────┐
│ [🔍 Search.......]  │
│ [Sort by ▼.......]  │
│ [📤 Upload Meme..]  │
│ [🔄 Refresh......]  │
└──────────────────────┘
┌──────────────────────┐
│      Meme 1          │
│     [Image]          │
│      ❤️ 42           │
├──────────────────────┤
│      Meme 2          │
│     [Video] ▶️       │
│      ❤️ 38           │
└──────────────────────┘
```

#### Small Mobile (< 480px)
```
┌─────────────────┐
│ 🐱 Catmemes.db │
│ Total: 42      │
│ [🖼️ Images: 30]│
│ [🎬 Videos: 12]│
└─────────────────┘
┌─────────────────┐
│ [🔍 Search..]  │
│ [Sort ▼.....]  │
│ [📤 Upload..]  │
│ [🔄 Refresh.]  │
└─────────────────┘
┌─────────────────┐
│    Meme 1       │
│   [Image]       │
│    ❤️ 42        │
├─────────────────┤
│    Meme 2       │
│   [Video] ▶️    │
│    ❤️ 38        │
└─────────────────┘
```

## 🎨 Typography Scale

### Desktop → Mobile
- **H1 (Title)**: 3.5em → 2.2em → 1.8em → 1.6em
- **Subtitle**: 1.3em → 1.1em → 1em → 0.95em
- **Body Text**: 1em → 0.95em → 0.9em
- **Buttons**: 16px → 15px → 14px
- **Card Title**: 1.1em → 1em → 0.95em

## 📏 Spacing Scale

### Desktop → Mobile
- **Body Padding**: 20px → 15px → 10px → 8px
- **Header Padding**: 40px → 30px → 25px → 20px
- **Card Gap**: 30px → 20px → 18px → 15px
- **Control Gap**: 15px → 12px → 10px
- **Button Padding**: 14px 32px → 12px 24px → 12px 20px

## 🎯 Touch Target Sizes

| Element | Desktop | Mobile | Standard |
|---------|---------|--------|----------|
| Buttons | 40px | 44px | ✅ WCAG |
| Vote Button | 40px | 44px | ✅ WCAG |
| Input Fields | 38px | 44px | ✅ WCAG |
| Scroll Button | 50px | 48px | ✅ WCAG |
| Stat Badges | 36px | 44px | ✅ WCAG |

## 🖼️ Image Dimensions

### Card Images
- **Desktop**: 320px height
- **Tablet**: 300px height
- **Mobile**: 280px height
- **Small Mobile**: 250px height
- **Extra Small**: 220px height
- **Landscape**: 200px height

### Upload Modal Preview
- **Max Width**: 100%
- **Max Height**: 300px (desktop) → 250px (mobile)

## 🎬 Video Behavior

### Desktop
- Hover to show play overlay
- Click to play in-place
- Controls appear on hover
- Autoplay with mute (optional)

### Mobile
- Play overlay always visible
- Tap to play inline (no fullscreen)
- Controls always available
- Preload: metadata only
- Playsinline attribute
- Pause when out of viewport

## 📱 Modal Behavior

### Desktop
- Width: 600px max (90% viewport)
- Centered on screen
- Click outside to close
- ESC key to close
- Smooth animations

### Mobile
- Width: 90% viewport (480px+)
- Width: 95% viewport (< 480px)
- Swipe down to close (100px threshold)
- Tap outside to close
- Optimized animations
- Reduced padding

## 🎨 Color Scheme

### Light Mode (Default)
```css
--color-primary: #0FA3B1    /* Teal */
--color-secondary: #B5E2FA  /* Light Blue */
--color-light: #F9F7F3      /* Off White */
--color-accent: #EDDEA4     /* Beige */
--color-warm: #F7A072       /* Coral */
```

### Dark Mode (Mobile)
```css
Background: #0a5a63 → #1a3d47 → #2a2a2a
Cards: #2a2a2a
Text: #eee
Borders: rgba(255,255,255,0.1)
```

## 🔄 Animation Durations

| Animation | Desktop | Mobile | Reduced Motion |
|-----------|---------|--------|----------------|
| Page Load | 0.6s | 0.4s | 0.01s |
| Card Hover | 0.4s | 0.3s | 0.01s |
| Modal Open | 0.4s | 0.3s | 0.01s |
| Scroll | Smooth | Smooth | Auto |
| Touch Feedback | N/A | 0.1s | 0.01s |

## 🚀 Loading States

### Desktop
```
┌─────────────────┐
│   ⟳ Loading...  │
│   [Spinner]     │
└─────────────────┘
```

### Mobile
```
┌───────────┐
│ ⟳ Loading │
│ [Spinner] │
└───────────┘
```

## 📊 Grid Breakpoints

```css
/* Desktop: 3-4 columns */
grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));

/* Tablet: 2-3 columns */
@media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

/* Mobile: 1-2 columns */
@media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

/* Small Mobile: 1 column */
@media (max-width: 480px) {
    grid-template-columns: 1fr;
}
```

## 🎮 Interaction States

### Button States
```
Normal:   background: primary, scale(1)
Hover:    background: darker, scale(1.05) [Desktop only]
Touch:    opacity: 0.7 [Mobile only]
Active:   scale(0.98)
Disabled: opacity: 0.5, cursor: not-allowed
```

### Card States
```
Normal:   translateY(0), scale(1)
Hover:    translateY(-12px), scale(1.03) [Desktop only]
Touch:    translateY(0), scale(1) [Mobile]
Active:   Border highlight
```

## 📱 Safe Area Support

### iPhone X+ Notched Devices
```css
@supports (padding: max(0px)) {
    /* Bottom safe area */
    padding-bottom: max(10px, env(safe-area-inset-bottom));
    
    /* Side safe areas */
    padding-left: max(10px, env(safe-area-inset-left));
    padding-right: max(10px, env(safe-area-inset-right));
}
```

### Scroll Button Position
```css
/* Desktop */
bottom: 30px;
right: 30px;

/* Mobile */
bottom: max(20px, env(safe-area-inset-bottom));
right: max(20px, env(safe-area-inset-right));
```

## 🎯 Performance Targets

### Mobile Metrics
- **First Paint**: < 1s
- **Time to Interactive**: < 3s
- **Scroll FPS**: 60fps
- **Animation FPS**: 60fps
- **Memory**: < 100MB
- **CPU**: < 30% average

### Optimization Techniques
- ✅ Hardware acceleration (transform3d)
- ✅ Passive event listeners
- ✅ Debounced search (300ms)
- ✅ Lazy video loading
- ✅ Intersection Observer
- ✅ RequestAnimationFrame for animations
- ✅ CSS containment
- ✅ Will-change property (careful use)

## 🔧 Testing Checklist

### Visual
- [ ] Text is readable (min 14px)
- [ ] Buttons are tappable (min 44px)
- [ ] No horizontal scroll
- [ ] Images scale properly
- [ ] Modal fits screen
- [ ] Proper spacing
- [ ] Correct colors

### Functional
- [ ] Search works
- [ ] Sort works
- [ ] Vote buttons work
- [ ] Upload works
- [ ] Videos play inline
- [ ] Smooth scrolling
- [ ] Swipe gestures work
- [ ] Touch feedback visible

### Performance
- [ ] Fast page load
- [ ] Smooth animations
- [ ] No jank/lag
- [ ] Videos don't autoplay
- [ ] Efficient memory use

### Cross-Browser
- [ ] Safari iOS
- [ ] Chrome Android
- [ ] Samsung Internet
- [ ] Firefox Mobile
- [ ] Edge Mobile

---

**This design system ensures consistent, beautiful mobile experience across all devices! 📱✨**
