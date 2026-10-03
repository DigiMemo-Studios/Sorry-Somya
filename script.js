/*
   DigiMemo - Script Logic
   Handles dynamic config, character SVGs, particle physics, runaway button, music player, scrapbook, envelope, and canvas screenshots.
*/

document.addEventListener('DOMContentLoaded', () => {
  // --- State Variables ---
  let currentPageIndex = 0;
  let evadeCount = 0;
  let particles = [];
  let particleAnimationId = null;
  let audioContextInitialized = false;
  
  // DOM Elements
  const ambientBg = document.getElementById('ambientBg');
  const particlesCanvas = document.getElementById('particlesCanvas');
  const ctx = particlesCanvas.getContext('2d');
  
  const landingScreen = document.getElementById('landingScreen');
  const landingTitle = document.getElementById('landingTitle');
  const heartTrigger = document.getElementById('heartTrigger');
  
  const appContainer = document.getElementById('appContainer');
  const cardWrapper = document.getElementById('cardWrapper');
  const storyCard = document.getElementById('storyCard');
  const characterContainer = document.getElementById('characterContainer');
  const bubbleContainer = document.getElementById('bubbleContainer');
  const bubbleText = document.getElementById('bubbleText');
  const cardMessage = document.getElementById('cardMessage');
  const dynamicContentArea = document.getElementById('dynamicContentArea');
  const cardFooter = document.getElementById('cardFooter');
  
  const musicPlayer = document.getElementById('musicPlayer');
  const musicToggle = document.getElementById('musicToggle');
  const volumeSlider = document.getElementById('volumeSlider');
  const bgAudio = document.getElementById('bgAudio');
  
  const photoModal = document.getElementById('photoModal');
  const modalImage = document.getElementById('modalImage');
  const modalCaption = document.getElementById('modalCaption');
  const modalClose = document.getElementById('modalClose');

  // Helper to adjust brightness of hex colors (for light/dark variants)
  function adjustColorBrightness(hex, percent) {
    // Strip '#' if present
    const cleanHex = hex.startsWith('#') ? hex.substring(1) : hex;
    
    let R = parseInt(cleanHex.substring(0, 2), 16);
    let G = parseInt(cleanHex.substring(2, 4), 16);
    let B = parseInt(cleanHex.substring(4, 6), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = Math.min(255, Math.max(0, R));
    G = Math.min(255, Math.max(0, G));
    B = Math.min(255, Math.max(0, B));

    const rHex = R.toString(16).padStart(2, '0');
    const gHex = G.toString(16).padStart(2, '0');
    const bHex = B.toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  }

  // --- Initialize App Colors from Config ---
  function initTheme() {
    const primaryHex = websiteData.primaryColor || '#ff85a2';
    const secondaryHex = websiteData.secondaryColor || '#a29bfe';

    document.documentElement.style.setProperty('--primary-color', primaryHex);
    document.documentElement.style.setProperty('--primary-light', adjustColorBrightness(primaryHex, 20));
    document.documentElement.style.setProperty('--primary-dark', adjustColorBrightness(primaryHex, -20));
    
    // Parse hex to RGB for opacity card and button shadows
    const cleanHex = primaryHex.startsWith('#') ? primaryHex.substring(1) : primaryHex;
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
    
    document.documentElement.style.setProperty('--secondary-color', secondaryHex);
    document.documentElement.style.setProperty('--secondary-light', adjustColorBrightness(secondaryHex, 20));
    
    if (websiteData.accentColor) {
      document.documentElement.style.setProperty('--accent-color', websiteData.accentColor);
    }
    
    // Set landing page details
    landingTitle.textContent = websiteData.title || "My DigiMemo";
    
    // Load Music
    if (websiteData.songUrl) {
      bgAudio.src = websiteData.songUrl;
      bgAudio.volume = volumeSlider.value;
      
      const audioFallbacks = ['saibo.webm', 'saibo.mp3', 'Saibo.mp3', 'saibo.m4a', 'Saibo.m4a', 'saibo.wav'];
      let audioTryIdx = 0;
      bgAudio.onerror = function() {
        if (audioTryIdx < audioFallbacks.length) {
          bgAudio.src = audioFallbacks[audioTryIdx++];
        }
      };
    }
  }

  // --- Ambient Background Generator ---
  function createAmbientElements() {
    const shapes = ['❤️', '⭐', '🌸', '☁️', '✨'];
    const count = 15;
    
    for (let i = 0; i < count; i++) {
      const shape = document.createElement('div');
      shape.className = 'ambient-shape';
      shape.textContent = shapes[Math.floor(Math.random() * shapes.length)];
      shape.style.left = `${Math.random() * 100}vw`;
      shape.style.top = `${Math.random() * 100}vh`;
      shape.style.fontSize = `${Math.random() * 20 + 20}px`;
      
      // Random animation delay and duration
      const duration = Math.random() * 10 + 10;
      const delay = Math.random() * -20;
      shape.style.animation = `floatBackground ${duration}s ease-in-out ${delay}s infinite alternate`;
      
      ambientBg.appendChild(shape);
    }
  }

  // --- Canvas Particle Physics System ---
  function resizeCanvas() {
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor(x, y, type = 'sparkle', color = '#ff85a2') {
      this.x = x;
      this.y = y;
      this.type = type; // 'sparkle', 'heart', 'confetti', 'balloon'
      this.color = color;
      
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - (type === 'confetti' ? 3 : 1); // upwards bias
      
      this.size = Math.random() * 8 + 4;
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.015;
      this.gravity = type === 'confetti' ? 0.2 : 0.05;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.gravity;
      this.alpha -= this.decay;
      this.rotation += this.rotSpeed;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.color;

      if (this.type === 'sparkle') {
        // Draw 4-point star
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          ctx.lineTo(0, -this.size);
          ctx.lineTo(this.size/3, -this.size/3);
          ctx.rotate(Math.PI / 2);
        }
        ctx.closePath();
        ctx.fill();
      } else if (this.type === 'heart') {
        // Draw heart
        ctx.beginPath();
        const d = this.size;
        ctx.moveTo(0, d / 4);
        ctx.bezierCurveTo(-d/2, -d/2, -d, d/3, 0, d);
        ctx.bezierCurveTo(d, d/3, d/2, -d/2, 0, d/4);
        ctx.closePath();
        ctx.fill();
      } else if (this.type === 'confetti') {
        // Draw rectangle or circle
        ctx.beginPath();
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
      }
      
      ctx.restore();
    }
  }

  function spawnExplosion(x, y, count = 30, type = 'sparkle') {
    const colors = [websiteData.primaryColor, websiteData.secondaryColor, '#ffe5ec', '#ff7675', '#fdcb6e', '#55efc4'];
    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.push(new Particle(x, y, type, color));
    }
    if (!particleAnimationId) {
      animateParticles();
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    
    // Update and draw particles
    particles = particles.filter(p => p.alpha > 0);
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    if (particles.length > 0) {
      particleAnimationId = requestAnimationFrame(animateParticles);
    } else {
      particleAnimationId = null;
    }
  }

  // --- Character SVG Builders ---
  // Returns highly polished SVG graphics which can wiggling / animate in CSS
  function getCharacterSVG(character, expression) {
    const char = character || websiteData.characterTheme || 'bunny';
    
    // Set standard colors
    let mainColor = '#ffffff';
    let detailColor = '#ffccd5';
    let darkColor = '#4a4a4a';
    
    if (char === 'bear') {
      mainColor = '#f5dfbb';
      detailColor = '#e3b58c';
    } else if (char === 'kitten') {
      mainColor = '#f0f0f0';
      detailColor = '#ffc0cb';
    } else if (char === 'panda') {
      mainColor = '#ffffff';
      detailColor = '#2d3436';
    } else if (char === 'hamster') {
      mainColor = '#ffcb77';
      detailColor = '#ffe5b4';
    }

    // Dynamic eyes, mouth, tears, and accessories depending on expression
    let eyesSVG = '';
    let mouthSVG = '';
    let extraSVG = '';
    let animateClass = 'bounce-body';

    // Expressions: happy, sad, excited, shy, crying, hugging, blushing
    switch (expression) {
      case 'happy':
        eyesSVG = `
          <!-- Smiling Eyes -->
          <path d="M55,62 Q65,54 75,62" stroke="${darkColor}" stroke-width="4.5" stroke-linecap="round" fill="none" class="blink-eye" />
          <path d="M105,62 Q115,54 125,62" stroke="${darkColor}" stroke-width="4.5" stroke-linecap="round" fill="none" class="blink-eye" />
        `;
        mouthSVG = `<path d="M82,78 Q90,88 98,78" stroke="${darkColor}" stroke-width="4.5" stroke-linecap="round" fill="none" />`;
        break;
      case 'sad':
        eyesSVG = `
          <!-- Watery Sad Eyes -->
          <circle cx="65" cy="62" r="9" fill="${darkColor}" />
          <circle cx="115" cy="62" r="9" fill="${darkColor}" />
          <circle cx="62" cy="59" r="3.5" fill="#ffffff" />
          <circle cx="112" cy="59" r="3.5" fill="#ffffff" />
          <!-- Tear droplets starting -->
          <circle cx="68" cy="68" r="3.5" fill="#a29bfe" class="tears-flow" />
          <circle cx="118" cy="68" r="3.5" fill="#a29bfe" class="tears-flow" />
        `;
        mouthSVG = `<path d="M85,84 Q90,76 95,84" stroke="${darkColor}" stroke-width="4.5" stroke-linecap="round" fill="none" />`;
        animateClass = 'cry-shake';
        break;
      case 'excited':
        eyesSVG = `
          <!-- Heart Eyes -->
          <g fill="#ff7675" transform="translate(53, 50) scale(0.65)">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </g>
          <g fill="#ff7675" transform="translate(103, 50) scale(0.65)">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </g>
        `;
        mouthSVG = `
          <!-- Happy Open Mouth -->
          <path d="M82,78 Q90,95 98,78 Z" fill="#ff7675" stroke="${darkColor}" stroke-width="4" stroke-linejoin="round" />
        `;
        break;
      case 'shy':
        eyesSVG = `
          <!-- Simple Dots Looking Down -->
          <circle cx="67" cy="65" r="5.5" fill="${darkColor}" />
          <circle cx="113" cy="65" r="5.5" fill="${darkColor}" />
        `;
        mouthSVG = `<path d="M85,78 Q90,82 95,78" stroke="${darkColor}" stroke-width="3.5" stroke-linecap="round" fill="none" />`;
        // Extra blushing cheeks
        extraSVG = `
          <ellipse cx="53" cy="74" rx="10" ry="6" fill="#ffb3c6" opacity="0.8" />
          <ellipse cx="127" cy="74" rx="10" ry="6" fill="#ffb3c6" opacity="0.8" />
        `;
        break;
      case 'crying':
        eyesSVG = `
          <!-- Screwed Closed Crying Eyes -->
          <path d="M56,60 L68,66 L56,72" stroke="${darkColor}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          <path d="M124,60 L112,66 L124,72" stroke="${darkColor}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        `;
        mouthSVG = `<path d="M80,86 Q90,74 100,86" stroke="${darkColor}" stroke-width="4.5" stroke-linecap="round" fill="none" />`;
        extraSVG = `
          <!-- Heavy Streaming Tears -->
          <path d="M64,68 L64,105" stroke="#74b9ff" stroke-width="5" stroke-linecap="round" class="tears-flow" />
          <path d="M116,68 L116,105" stroke="#74b9ff" stroke-width="5" stroke-linecap="round" class="tears-flow" />
        `;
        animateClass = 'cry-shake';
        break;
      case 'hugging':
        eyesSVG = `
          <!-- Soft Smiling Closed Eyes -->
          <path d="M55,62 Q65,52 75,62" stroke="${darkColor}" stroke-width="4.5" stroke-linecap="round" fill="none" />
          <path d="M105,62 Q115,52 125,62" stroke="${darkColor}" stroke-width="4.5" stroke-linecap="round" fill="none" />
        `;
        mouthSVG = `<path d="M84,78 Q90,86 96,78" stroke="${darkColor}" stroke-width="4.5" stroke-linecap="round" fill="none" />`;
        // Hugging arms extended forward
        extraSVG = `
          <g class="wave-arm">
            <rect x="30" y="90" width="30" height="15" rx="7.5" fill="${char === 'panda' ? detailColor : mainColor}" stroke="${darkColor}" stroke-width="4" transform="rotate(-15, 30, 90)" />
            <rect x="120" y="90" width="30" height="15" rx="7.5" fill="${char === 'panda' ? detailColor : mainColor}" stroke="${darkColor}" stroke-width="4" transform="rotate(15, 120, 90)" />
          </g>
        `;
        break;
      case 'blushing':
        eyesSVG = `
          <circle cx="65" cy="62" r="8" fill="${darkColor}" class="blink-eye" />
          <circle cx="115" cy="62" r="8" fill="${darkColor}" class="blink-eye" />
          <circle cx="62" cy="59" r="3" fill="#ffffff" />
          <circle cx="112" cy="59" r="3" fill="#ffffff" />
        `;
        mouthSVG = `<path d="M82,78 Q90,88 98,78" stroke="${darkColor}" stroke-width="4" stroke-linecap="round" fill="none" />`;
        extraSVG = `
          <ellipse cx="53" cy="73" rx="12" ry="7" fill="#ffb3c6" opacity="0.9" />
          <ellipse cx="127" cy="73" rx="12" ry="7" fill="#ffb3c6" opacity="0.9" />
          <!-- Floating Heart Particles -->
          <g fill="#ff7675" opacity="0.9" class="sparkle-spark">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" transform="translate(25, 15) scale(0.6)" />
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" transform="translate(135, 15) scale(0.6)" />
          </g>
        `;
        break;
    }

    // Default blushing overlay for happy, excited, blushing
    if ((expression === 'happy' || expression === 'excited') && !extraSVG) {
      extraSVG = `
        <ellipse cx="53" cy="72" rx="9" ry="5.5" fill="#ffccd5" />
        <ellipse cx="127" cy="72" rx="9" ry="5.5" fill="#ffccd5" />
      `;
    }

    // Dynamic Character Base SVG Elements
    let earsSVG = '';
    let bodySVG = '';
    
    if (char === 'bunny') {
      earsSVG = `
        <!-- Bunny Ears -->
        <g class="wiggle-ear-left">
          <ellipse cx="55" cy="22" rx="14" ry="32" fill="${mainColor}" stroke="${darkColor}" stroke-width="4.5" />
          <ellipse cx="55" cy="25" rx="8" ry="24" fill="${detailColor}" />
        </g>
        <g class="wiggle-ear-right">
          <ellipse cx="125" cy="22" rx="14" ry="32" fill="${mainColor}" stroke="${darkColor}" stroke-width="4.5" />
          <ellipse cx="125" cy="25" rx="8" ry="24" fill="${detailColor}" />
        </g>
      `;
      bodySVG = `
        <!-- Bunny Head -->
        <circle cx="90" cy="70" r="48" fill="${mainColor}" stroke="${darkColor}" stroke-width="4.5" />
        <!-- Bunny Tiny Nose -->
        <polygon points="86,72 94,72 90,76" fill="#ff7675" />
      `;
    } else if (char === 'bear') {
      earsSVG = `
        <!-- Bear Ears -->
        <circle cx="50" cy="35" r="18" fill="${mainColor}" stroke="${darkColor}" stroke-width="4.5" />
        <circle cx="50" cy="35" r="10" fill="${detailColor}" />
        <circle cx="130" cy="35" r="18" fill="${mainColor}" stroke="${darkColor}" stroke-width="4.5" />
        <circle cx="130" cy="35" r="10" fill="${detailColor}" />
      `;
      bodySVG = `
        <!-- Bear Head -->
        <circle cx="90" cy="74" r="46" fill="${mainColor}" stroke="${darkColor}" stroke-width="4.5" />
        <!-- Bear Snout -->
        <ellipse cx="90" cy="80" rx="14" ry="10" fill="#ffffff" stroke="${darkColor}" stroke-width="3" />
        <ellipse cx="90" cy="77" rx="5.5" ry="3.5" fill="${darkColor}" />
        <!-- Flower Accessory -->
        <g transform="translate(125, 75) scale(0.85)">
          <path d="M0,0 L-10,12" stroke="#55efc4" stroke-width="3.5" />
          <circle cx="0" cy="0" r="6" fill="#fdcb6e" />
          <circle cx="-7" cy="-7" r="4.5" fill="#fffdf9" />
          <circle cx="7" cy="-7" r="4.5" fill="#fffdf9" />
          <circle cx="-7" cy="7" r="4.5" fill="#fffdf9" />
          <circle cx="7" cy="7" r="4.5" fill="#fffdf9" />
        </g>
      `;
    } else if (char === 'kitten') {
      earsSVG = `
        <!-- Kitten Ears -->
        <polygon points="40,46 55,16 75,44" fill="${mainColor}" stroke="${darkColor}" stroke-width="4.5" stroke-linejoin="round" />
        <polygon points="46,43 55,23 68,41" fill="${detailColor}" />
        <polygon points="140,46 125,16 105,44" fill="${mainColor}" stroke="${darkColor}" stroke-width="4.5" stroke-linejoin="round" />
        <polygon points="134,43 125,23 112,41" fill="${detailColor}" />
      `;
      bodySVG = `
        <!-- Kitten Head -->
        <ellipse cx="90" cy="74" rx="48" ry="42" fill="${mainColor}" stroke="${darkColor}" stroke-width="4.5" />
        <!-- Cat Whiskers -->
        <line x1="38" y1="74" x2="22" y2="72" stroke="${darkColor}" stroke-width="3" stroke-linecap="round" />
        <line x1="38" y1="80" x2="20" y2="82" stroke="${darkColor}" stroke-width="3" stroke-linecap="round" />
        <line x1="142" y1="74" x2="158" y2="72" stroke="${darkColor}" stroke-width="3" stroke-linecap="round" />
        <line x1="142" y1="80" x2="160" y2="82" stroke="${darkColor}" stroke-width="3" stroke-linecap="round" />
        <!-- Cute Nose -->
        <polygon points="87,75 93,75 90,78" fill="${detailColor}" />
      `;
    } else if (char === 'panda') {
      earsSVG = `
        <!-- Panda Ears -->
        <circle cx="52" cy="36" r="17" fill="${detailColor}" />
        <circle cx="128" cy="36" r="17" fill="${detailColor}" />
      `;
      bodySVG = `
        <!-- Panda Head -->
        <circle cx="90" cy="74" r="46" fill="${mainColor}" stroke="${darkColor}" stroke-width="4.5" />
        <!-- Panda Eye Patches -->
        <ellipse cx="65" cy="63" rx="13" ry="10" fill="${detailColor}" transform="rotate(-15, 65, 63)" />
        <ellipse cx="115" cy="63" rx="13" ry="10" fill="${detailColor}" transform="rotate(15, 115, 63)" />
        <!-- Snout -->
        <ellipse cx="90" cy="78" rx="10" ry="7" fill="#ffffff" stroke="${darkColor}" stroke-width="2.5" />
        <ellipse cx="90" cy="75" rx="4.5" ry="3" fill="${darkColor}" />
      `;
    } else if (char === 'hamster') {
      earsSVG = `
        <!-- Hamster Ears -->
        <circle cx="55" cy="34" r="14" fill="${mainColor}" stroke="${darkColor}" stroke-width="4.5" />
        <circle cx="55" cy="34" r="8" fill="${detailColor}" />
        <circle cx="125" cy="34" r="14" fill="${mainColor}" stroke="${darkColor}" stroke-width="4.5" />
        <circle cx="125" cy="34" r="8" fill="${detailColor}" />
      `;
      bodySVG = `
        <!-- Hamster Face -->
        <circle cx="90" cy="74" r="46" fill="${mainColor}" stroke="${darkColor}" stroke-width="4.5" />
        <!-- White Tummy Overlay -->
        <ellipse cx="90" cy="94" rx="26" ry="18" fill="#ffffff" />
        <!-- Hamster Nose -->
        <circle cx="90" cy="73" r="3" fill="#ff7675" />
        <!-- Seed holding paws -->
        <ellipse cx="90" cy="92" rx="7" ry="10" fill="#d2b48c" stroke="${darkColor}" stroke-width="2.5" />
      `;
    }

    // Assemble the complete animated SVG
    return `
      <svg class="character-svg ${animateClass}" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" flood-opacity="0.06"/>
          </filter>
        </defs>
        <g filter="url(#shadow)">
          <!-- Character Ears -->
          ${earsSVG}
          
          <!-- Cute Feet / Shadow Base -->
          <ellipse cx="62" cy="122" rx="15" ry="8" fill="${char === 'panda' ? detailColor : mainColor}" stroke="${darkColor}" stroke-width="4" />
          <ellipse cx="118" cy="122" rx="15" ry="8" fill="${char === 'panda' ? detailColor : mainColor}" stroke="${darkColor}" stroke-width="4" />
          
          <!-- Character Body/Base -->
          <ellipse cx="90" cy="105" rx="42" ry="30" fill="${char === 'panda' ? detailColor : mainColor}" stroke="${darkColor}" stroke-width="4.5" />
          
          <!-- Character Face Features -->
          ${bodySVG}
          
          <!-- Expression Eyes -->
          ${eyesSVG}
          
          <!-- Expression Mouth -->
          ${mouthSVG}
          
          <!-- Expression Extra Decorators (Blush/Tears) -->
          ${extraSVG}
          
          <!-- Small Cute Hands (Default overlay if not waving/hugging) -->
          ${expression !== 'hugging' ? `
            <circle cx="62" cy="102" r="8" fill="${char === 'panda' ? detailColor : mainColor}" stroke="${darkColor}" stroke-width="3.5" />
            <circle cx="118" cy="102" r="8" fill="${char === 'panda' ? detailColor : mainColor}" stroke="${darkColor}" stroke-width="3.5" />
          ` : ''}
        </g>
      </svg>
    `;
  }

  // --- Music Player Interactions ---
  function initMusicPlayer() {
    musicToggle.addEventListener('click', () => {
      // Initialize Audio Context on user click for autoplay compliance
      if (!audioContextInitialized) {
        audioContextInitialized = true;
      }
      
      if (bgAudio.paused) {
        bgAudio.play().then(() => {
          musicPlayer.classList.add('playing');
        }).catch(err => console.log("Audio play failed:", err));
      } else {
        bgAudio.pause();
        musicPlayer.classList.remove('playing');
      }
    });

    volumeSlider.addEventListener('input', (e) => {
      bgAudio.volume = e.target.value;
    });
  }

  // --- Landing Screen Navigation ---
  function initLandingScreen() {
    heartTrigger.addEventListener('click', (e) => {
      // Play Audio on first click
      if (websiteData.songUrl) {
        bgAudio.play().then(() => {
          musicPlayer.classList.add('playing');
        }).catch(err => console.log("Autoplay blocked/failed, waiting for next touch:", err));
      }
      
      // Explosion sparkles
      const rect = heartTrigger.getBoundingClientRect();
      spawnExplosion(rect.left + rect.width/2, rect.top + rect.height/2, 45, 'sparkle');
      spawnExplosion(rect.left + rect.width/2, rect.top + rect.height/2, 25, 'heart');

      // Heart expansion and transition
      heartTrigger.style.transform = 'scale(5)';
      heartTrigger.style.opacity = '0';
      landingScreen.classList.add('fade-out');
      
      setTimeout(() => {
        landingScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');
        // Render first page
        renderPage(0);
      }, 700);
    });
  }

  // --- Page Content Rendering ---
  function renderPage(index) {
    if (index < 0 || index >= websiteData.pages.length) return;
    currentPageIndex = index;
    evadeCount = 0; // reset runaway count on page loads
    
    const page = websiteData.pages[index];
    
    // Scale out card for transition
    storyCard.classList.remove('active');
    
    setTimeout(() => {
      // Set Theme Override if page specifies colors
      document.documentElement.style.setProperty('--primary-color', page.primaryColor || websiteData.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', page.secondaryColor || websiteData.secondaryColor);
      
      // Render Character SVG
      characterContainer.innerHTML = getCharacterSVG(page.character, page.expression);
      
      // Dialogue Bubble
      if (page.bubbleText) {
        bubbleContainer.classList.remove('hidden');
        bubbleText.textContent = page.bubbleText;
      } else {
        bubbleContainer.classList.add('hidden');
      }
      
      // Message
      cardMessage.textContent = page.message || "";
      
      // Render page specific features in the dynamic area
      renderDynamicArea(page);
      
      // Render Footer Buttons
      renderFooter(page);
      
      // Reactivate card with smooth bounce
      storyCard.classList.add('active');
    }, 200);
  }

  function renderDynamicArea(page) {
    dynamicContentArea.innerHTML = "";
    
    if (page.type === 'letter') {
      // Render Interactive Letter Envelope
      const envelopeWrap = document.createElement('div');
      envelopeWrap.className = 'envelope-container';
      envelopeWrap.innerHTML = `
        <div class="envelope" id="envelope">
          <div class="envelope-flap"></div>
          <div class="envelope-sides"></div>
          <div class="envelope-front"></div>
          <!-- Cute Seal Heart -->
          <svg class="heart-seal" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <div class="letter">
            <div style="transform: rotate(-3deg); padding: 5px;">
              ${page.envelopeLabel || "Tap to Open 💖"}
            </div>
          </div>
        </div>
      `;
      
      // Click handler to open envelope and trigger modal slide out
      envelopeWrap.addEventListener('click', () => {
        const envelope = envelopeWrap.querySelector('.envelope');
        envelopeWrap.classList.add('open');
        
        // Spawn small hearts around envelope on click
        const envelopeRect = envelopeWrap.getBoundingClientRect();
        spawnExplosion(envelopeRect.left + envelopeRect.width/2, envelopeRect.top + envelopeRect.height/2, 15, 'heart');
        
        setTimeout(() => {
          showLetterPopup(page.letterContent || "");
        }, 800);
      });
      
      dynamicContentArea.appendChild(envelopeWrap);
      
    } else if (page.type === 'photos') {
      // Render Polaroid Scrapbook
      const scrapbook = document.createElement('div');
      scrapbook.className = 'polaroid-scrapbook';
      
      const photos = page.photos || [];
      photos.forEach((photo, idx) => {
        const polWrap = document.createElement('div');
        polWrap.className = 'polaroid-wrapper';
        const num = idx + 1;
        polWrap.innerHTML = `
          <div class="polaroid-tape"></div>
          <img class="polaroid-image" src="${photo.url}" alt="${photo.caption}" data-num="${num}" data-try="0">
          <p class="polaroid-caption">${photo.caption}</p>
        `;
        
        const imgEl = polWrap.querySelector('img');
        imgEl.onerror = function() {
          const tryIndex = parseInt(this.getAttribute('data-try') || '0', 10);
          const candidates = [
            `picture${num}.jpg`,
            `picture${num}.png`,
            `Picture ${num}.jpg`,
            `Picture ${num}.png`,
            `picture${num}.jpeg`,
            `Picture ${num}.jpeg`,
            `Picture ${num}`,
            `picture${num}`
          ];
          if (tryIndex < candidates.length) {
            this.setAttribute('data-try', tryIndex + 1);
            this.src = candidates[tryIndex];
          }
        };

        polWrap.addEventListener('click', () => {
          showPhotoModal(imgEl.src, photo.caption);
        });
        
        scrapbook.appendChild(polWrap);
      });
      
      dynamicContentArea.appendChild(scrapbook);
      
    } else if (page.type === 'question') {
      // Render Question buttons with Runaway game
      const qContainer = document.createElement('div');
      qContainer.className = 'question-container';
      qContainer.innerHTML = `
        <div class="decision-buttons" id="decisionButtons">
          <button class="action-btn btn-yes" id="btnYes">${page.yesButtonText || "Yes"}</button>
          <button class="action-btn btn-no" id="btnNo">${page.noButtonText || "No"}</button>
        </div>
      `;
      
      const btnYes = qContainer.querySelector('#btnYes');
      const btnNo = qContainer.querySelector('#btnNo');
      const decisionWrapper = qContainer.querySelector('#decisionButtons');
      
      // YES Button Click
      btnYes.addEventListener('click', (e) => {
        // Confetti / Celebration explosion
        const rect = btnYes.getBoundingClientRect();
        spawnExplosion(rect.left + rect.width/2, rect.top + rect.height/2, 60, 'confetti');
        spawnExplosion(rect.left + rect.width/2, rect.top + rect.height/2, 40, 'heart');
        spawnExplosion(rect.left + rect.width/2, rect.top + rect.height/2, 30, 'sparkle');
        
        // Go to celebration ending screen
        renderEndingScreen();
      });
      
      // Runaway game logic
      const runAwayFunc = (e) => {
        const maxEvade = page.noRunawayCount || 5;
        if (evadeCount >= maxEvade) {
          // If exceeded max evades, allow clicking but trigger expression change
          btnNo.classList.remove('runaway');
          btnNo.style.position = 'static';
          btnNo.style.transform = 'none';
          return;
        }
        
        evadeCount++;
        btnNo.classList.add('runaway');
        
        // Calculate new coordinate bounds inside the container card safely
        const wrapRect = decisionWrapper.getBoundingClientRect();
        const btnRect = btnNo.getBoundingClientRect();
        
        // Allow escaping somewhat outside bounds or coordinates within relative spacing
        const minX = -40;
        const maxX = wrapRect.width - btnRect.width + 40;
        const minY = -120;
        const maxY = wrapRect.height - btnRect.height + 40;
        
        let randomX = Math.random() * (maxX - minX) + minX;
        let randomY = Math.random() * (maxY - minY) + minY;
        let rotation = (Math.random() - 0.5) * 20; // rotation up to 10 deg
        
        btnNo.style.left = `${randomX}px`;
        btnNo.style.top = `${randomY}px`;
        btnNo.style.transform = `rotate(${rotation}deg) scale(0.95)`;
        
        // Update character expression to sad / crying on evades
        if (evadeCount >= Math.floor(maxEvade / 2)) {
          characterContainer.innerHTML = getCharacterSVG(page.character, 'crying');
        } else {
          characterContainer.innerHTML = getCharacterSVG(page.character, 'sad');
        }
        
        // Update dialogue bubbles
        const comments = page.noRunawayDialogues || [];
        if (comments.length > 0) {
          const index = Math.min(evadeCount - 1, comments.length - 1);
          bubbleText.textContent = comments[index];
        }
        
        // Sparkles on movement
        const rectNo = btnNo.getBoundingClientRect();
        spawnExplosion(rectNo.left + rectNo.width/2, rectNo.top + rectNo.height/2, 5, 'sparkle');
      };
      
      btnNo.addEventListener('mouseenter', runAwayFunc);
      btnNo.addEventListener('touchstart', (e) => {
        e.preventDefault();
        runAwayFunc(e);
      });
      
      // If they click the NO button eventually
      btnNo.addEventListener('click', () => {
        // If clicked after several attempts
        bubbleText.textContent = page.noClickSadResponse || "Fine, you clicked No... 🥺";
        characterContainer.innerHTML = getCharacterSVG(page.character, 'crying');
        
        // Trigger sad particles
        const rectNo = btnNo.getBoundingClientRect();
        spawnExplosion(rectNo.left + rectNo.width/2, rectNo.top + rectNo.height/2, 20, 'sparkle');
        
        // Briefly delay then direct them to YES page or keep card
        setTimeout(() => {
          renderEndingScreen(true); // Sad ending flag
        }, 2200);
      });
      
      dynamicContentArea.appendChild(qContainer);
    }
  }

  function renderFooter(page) {
    cardFooter.innerHTML = "";
    
    // Hide footer default buttons on question page or special flow
    if (page.type === 'question') {
      cardFooter.style.display = 'none';
      return;
    }
    cardFooter.style.display = 'flex';
    cardFooter.style.justifyContent = 'space-between';
    
    // Back button (hide on page 0)
    if (currentPageIndex > 0) {
      const btnBack = document.createElement('button');
      btnBack.className = 'footer-btn footer-btn-secondary';
      btnBack.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      `;
      btnBack.addEventListener('click', () => {
        renderPage(currentPageIndex - 1);
      });
      cardFooter.appendChild(btnBack);
    }
    
    // Next/Continue button
    const btnNext = document.createElement('button');
    btnNext.className = 'footer-btn footer-btn-primary';
    btnNext.textContent = page.buttonText || "Continue ❤️";
    btnNext.addEventListener('click', (e) => {
      // Sparkles on click
      const rect = btnNext.getBoundingClientRect();
      spawnExplosion(rect.left + rect.width/2, rect.top + rect.height/2, 15, 'sparkle');
      
      renderPage(currentPageIndex + 1);
    });
    
    cardFooter.appendChild(btnNext);
  }

  // --- Envelope Pop-up Modals ---
  function showLetterPopup(content) {
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'letter-popup-overlay';
    popupOverlay.innerHTML = `
      <div class="letter-popup-card">
        <button class="letter-popup-close" id="popupClose">&times;</button>
        <p class="letter-popup-text">${content}</p>
      </div>
    `;
    
    document.body.appendChild(popupOverlay);
    
    // Animate open
    setTimeout(() => {
      popupOverlay.classList.add('active');
    }, 50);
    
    // Close button
    const closeBtn = popupOverlay.querySelector('#popupClose');
    closeBtn.addEventListener('click', () => {
      popupOverlay.classList.remove('active');
      setTimeout(() => {
        popupOverlay.remove();
      }, 400);
    });
    
    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) {
        closeBtn.click();
      }
    });
  }

  // --- Photo Scrapbook Modal Zoom ---
  function showPhotoModal(url, caption) {
    modalImage.src = url;
    modalCaption.textContent = caption;
    photoModal.classList.add('active');
    photoModal.classList.remove('hidden');
    
    // Sparkles on zoom
    spawnExplosion(window.innerWidth / 2, window.innerHeight / 2, 20, 'sparkle');
  }

  modalClose.addEventListener('click', () => {
    photoModal.classList.remove('active');
    setTimeout(() => {
      photoModal.classList.add('hidden');
    }, 400);
  });

  photoModal.addEventListener('click', (e) => {
    if (e.target === photoModal) {
      modalClose.click();
    }
  });

  // --- Ending / Celebration screen ---
  function renderEndingScreen(clickedNo = false) {
    const endingData = websiteData.ending;
    storyCard.classList.remove('active');
    
    setTimeout(() => {
      // Configure Theme Colors
      document.documentElement.style.setProperty('--primary-color', websiteData.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', websiteData.secondaryColor);
      
      // Update dialogue bubble
      bubbleContainer.classList.remove('hidden');
      bubbleText.textContent = clickedNo ? "Oh... 🥺💔" : (endingData.bubbleText || "Yay! 🎉❤️");
      
      // Character SVG
      const endingExpr = clickedNo ? 'sad' : (endingData.expression || 'blushing');
      characterContainer.innerHTML = getCharacterSVG(endingData.character, endingExpr);
      
      // Celebration messages
      cardMessage.textContent = clickedNo 
        ? (websiteData.pages[websiteData.pages.length - 1].noClickSadResponse || "Fine, you clicked No... But I still love you! 🥺❤️")
        : (endingData.message || "Thank you for saying YES! You've made me the happiest in the world.");
      
      // Clear dynamic area
      dynamicContentArea.innerHTML = "";
      
      // Balloon animation spawning
      if (!clickedNo) {
        startBalloonSpawning();
        // Mass explosion particles
        spawnExplosion(window.innerWidth / 2, window.innerHeight / 3, 80, 'confetti');
        spawnExplosion(window.innerWidth / 3, window.innerHeight / 2, 40, 'heart');
        spawnExplosion(window.innerWidth * 0.7, window.innerHeight / 2, 40, 'sparkle');
      }
      
      // Footer actions: Replay only
      cardFooter.style.display = 'flex';
      cardFooter.style.justifyContent = 'center';
      cardFooter.innerHTML = "";
      
      const btnReplay = document.createElement('button');
      btnReplay.className = 'footer-btn footer-btn-primary';
      btnReplay.innerHTML = `❤️ ${endingData.replayButtonText || 'Replay'}`;
      btnReplay.addEventListener('click', () => {
        // Reset everything
        stopBalloonSpawning();
        renderPage(0);
      });
      
      cardFooter.appendChild(btnReplay);
      
      storyCard.classList.add('active');
    }, 200);
  }

  // --- Balloon Overlay Spawner ---
  let balloonInterval = null;
  function startBalloonSpawning() {
    stopBalloonSpawning();
    
    const colors = ['#ff85a2', '#a29bfe', '#ffe5ec', '#ff7675', '#fdcb6e', '#55efc4', '#74b9ff'];
    const container = document.createElement('div');
    container.className = 'ending-balloon-container';
    container.id = 'balloonContainer';
    appContainer.appendChild(container);
    
    balloonInterval = setInterval(() => {
      const balloon = document.createElement('div');
      balloon.className = 'balloon';
      const color = colors[Math.floor(Math.random() * colors.length)];
      balloon.style.background = color;
      balloon.style.left = `${Math.random() * 85 + 5}%`;
      balloon.style.animationDuration = `${Math.random() * 4 + 5}s`;
      
      const string = document.createElement('div');
      string.className = 'balloon-string';
      balloon.appendChild(string);
      
      container.appendChild(balloon);
      
      // Remove balloon after animation ends
      setTimeout(() => {
        balloon.remove();
      }, 9000);
    }, 600);
  }

  function stopBalloonSpawning() {
    if (balloonInterval) {
      clearInterval(balloonInterval);
      balloonInterval = null;
    }
    const container = document.getElementById('balloonContainer');
    if (container) {
      container.remove();
    }
  }

  // --- Canvas Screenshot Generator ---
  function takeScreenshot(clickedNo) {
    const endingData = websiteData.ending;
    
    // Create export Canvas with 800x1000 resolution (Instagram sharing size)
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 800;
    exportCanvas.height = 1000;
    const c = exportCanvas.getContext('2d');
    
    // 1. Draw Gradient Background
    const gradient = c.createLinearGradient(0, 0, 800, 1000);
    gradient.addColorStop(0, '#ffe5ec');
    gradient.addColorStop(0.5, '#f0e6ff');
    gradient.addColorStop(1, '#e8f0fe');
    c.fillStyle = gradient;
    c.fillRect(0, 0, 800, 1000);
    
    // 2. Draw Floating Hearts and Sparkles on Background
    c.fillStyle = 'rgba(255, 133, 162, 0.15)';
    for (let i = 0; i < 12; i++) {
      drawHeart(c, Math.random() * 800, Math.random() * 1000, Math.random() * 20 + 15);
    }
    c.fillStyle = 'rgba(162, 155, 254, 0.15)';
    for (let i = 0; i < 12; i++) {
      drawStar(c, Math.random() * 800, Math.random() * 1000, Math.random() * 15 + 10);
    }
    
    // 3. Draw Story Card shape with glass shadow
    c.shadowColor = 'rgba(255, 133, 162, 0.12)';
    c.shadowBlur = 40;
    c.shadowOffsetX = 0;
    c.shadowOffsetY = 20;
    c.fillStyle = 'rgba(255, 255, 255, 0.85)';
    
    const cardX = 100;
    const cardY = 120;
    const cardW = 600;
    const cardH = 760;
    const radius = 40;
    
    c.beginPath();
    c.moveTo(cardX + radius, cardY);
    c.lineTo(cardX + cardW - radius, cardY);
    c.arcTo(cardX + cardW, cardY, cardX + cardW, cardY + cardH, radius);
    c.lineTo(cardX + cardW, cardY + cardH - radius);
    c.arcTo(cardX + cardW, cardY + cardH, cardX, cardY + cardH, radius);
    c.lineTo(cardX + radius, cardY + cardH);
    c.arcTo(cardX, cardY + cardH, cardX, cardY, radius);
    c.lineTo(cardX, cardY + radius);
    c.arcTo(cardX, cardY, cardX + cardW, cardY, radius);
    c.closePath();
    c.fill();
    
    // Reset shadow for drawing elements
    c.shadowColor = 'transparent';
    c.shadowBlur = 0;
    c.shadowOffsetX = 0;
    c.shadowOffsetY = 0;

    // 4. Render dialogue speech bubble
    c.fillStyle = '#ffffff';
    c.shadowColor = 'rgba(0, 0, 0, 0.04)';
    c.shadowBlur = 15;
    
    const bubbleX = 220;
    const bubbleY = 160;
    const bubbleW = 360;
    const bubbleH = 80;
    const bRad = 20;
    
    c.beginPath();
    c.moveTo(bubbleX + bRad, bubbleY);
    c.lineTo(bubbleX + bubbleW - bRad, bubbleY);
    c.arcTo(bubbleX + bubbleW, bubbleY, bubbleX + bubbleW, bubbleY + bubbleH, bRad);
    c.lineTo(bubbleX + bubbleW, bubbleY + bubbleH - bRad);
    c.arcTo(bubbleX + bubbleW, bubbleY + bubbleH, bubbleX, bubbleY + bubbleH, bRad);
    // Draw bubble tail down to the character head
    c.lineTo(bubbleX + bubbleW / 2 + 10, bubbleY + bubbleH);
    c.lineTo(bubbleX + bubbleW / 2, bubbleY + bubbleH + 12);
    c.lineTo(bubbleX + bubbleW / 2 - 10, bubbleY + bubbleH);
    c.lineTo(bubbleX + bRad, bubbleY + bubbleH);
    c.arcTo(bubbleX, bubbleY + bubbleH, bubbleX, bubbleY, bRad);
    c.lineTo(bubbleX, bubbleY + bRad);
    c.arcTo(bubbleX, bubbleY, bubbleX + bubbleW, bubbleY, bRad);
    c.closePath();
    c.fill();
    
    c.shadowColor = 'transparent';
    c.shadowBlur = 0;
    
    // Write dialogue bubble text
    c.font = '700 24px "Fredoka", "Quicksand", sans-serif';
    c.fillStyle = websiteData.primaryColor;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(
      clickedNo ? "Oh... 🥺💔" : (endingData.bubbleText || "Yay! 🎉❤️"), 
      bubbleX + bubbleW / 2, 
      bubbleY + bubbleH / 2
    );

    // 5. Draw customizable celebration message
    c.font = '500 26px "Quicksand", sans-serif';
    c.fillStyle = '#4a4a4a';
    c.textAlign = 'center';
    const messageText = clickedNo 
      ? (websiteData.pages[websiteData.pages.length - 1].noClickSadResponse || "Fine, you clicked No... But I still love you! 🥺❤️")
      : (endingData.message || "Thank you for saying YES!");
    
    wrapText(c, messageText, 400, 680, 500, 36);

    // 6. Draw little decorative watermark details
    c.font = '700 22px "Fredoka", sans-serif';
    c.fillStyle = 'rgba(255, 133, 162, 0.4)';
    c.fillText(websiteData.title || "My DigiMemo", 400, 810);
    
    c.font = '500 16px "Quicksand", sans-serif';
    c.fillStyle = 'rgba(0,0,0,0.15)';
    c.fillText("digimemo.love", 400, 835);

    // 7. Load and Draw Character SVG
    const endingExpr = clickedNo ? 'sad' : (endingData.expression || 'blushing');
    const svgString = getCharacterSVG(endingData.character, endingExpr);
    
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    
    img.onload = function () {
      c.drawImage(img, 250, 290, 300, 300);
      URL.revokeObjectURL(url);
      
      // 8. Download the finished canvas
      const link = document.createElement('a');
      link.download = `${(websiteData.title || 'DigiMemo').replace(/\s+/g, '_')}_Memo.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
      
      // Explosion sparkles on success
      spawnExplosion(window.innerWidth / 2, window.innerHeight / 2, 25, 'sparkle');
    };
    img.src = url;
  }

  // Draw Heart shape on Canvas helper
  function drawHeart(c, x, y, size) {
    c.beginPath();
    c.moveTo(x, y + size / 4);
    c.bezierCurveTo(x - size/2, y - size/2, x - size, y + size/3, x, y + size);
    c.bezierCurveTo(x + size, y + size/3, x + size/2, y - size/2, x, y + size/4);
    c.closePath();
    c.fill();
  }

  // Draw Star shape on Canvas helper
  function drawStar(c, x, y, size) {
    c.save();
    c.translate(x, y);
    c.beginPath();
    for (let i = 0; i < 4; i++) {
      c.lineTo(0, -size);
      c.lineTo(size/3, -size/3);
      c.rotate(Math.PI / 2);
    }
    c.closePath();
    c.fill();
    c.restore();
  }

  // Canvas wrap text utility helper
  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let testY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, testY);
        line = words[n] + ' ';
        testY += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, testY);
  }

  // --- Initial Launches ---
  initTheme();
  createAmbientElements();
  initMusicPlayer();
  initLandingScreen();
});
