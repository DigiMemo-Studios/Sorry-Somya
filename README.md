# 💖 DigiMemo - Interactive Cute Kawaii Story Website

An adorable, interactive, mobile-first storytelling website featuring customizable animated cartoon characters, floating bubbles, polaroid scrapbooks, hand-written sliding letters, and a runaway button game. 

This project is built using pure **HTML**, **CSS**, and **vanilla JavaScript** (no external framework dependencies), making it extremely fast, responsive, and easy to deploy.

---

## 🚀 Quick Start

1. Make sure you have [Node.js](https://nodejs.org/) installed.
2. Open your terminal in this project directory.
3. Run the development command:
   ```bash
   npm run dev
   ```
4. Your browser will automatically open to `http://localhost:3000` to view the website!

---

## 📁 Project Structure

- `index.html` - The webpage markup shell and containers.
- `style.css` - Custom styling rules, variables, layout systems, glassmorphism, and inline SVG keyframe animations.
- `config.js` - **The only file you need to edit!** Customizes the title, music, color themes, character selections, and slide pages.
- `script.js` - App core engine (animations, canvas-based physics particles, custom SVGs generator, runaway button tracking, and PNG screenshot renderer).
- `package.json` - Defines NPM package scripts.

---

## ⚙️ Customization Guide

Open [`config.js`](file:///c:/Users/bhatt/OneDrive/Desktop/DigiMemo-Sorry/config.js) to configure the entire website data object. Below is an overview of the key properties:

### 🎨 Color & Aesthetic Theme
```javascript
const websiteData = {
  title: "My Cute DigiMemo",
  songUrl: "https://.../music.mp3", // Background music MP3 url
  primaryColor: "#ff85a2",          // Main pastel pink color
  secondaryColor: "#a29bfe",        // Lavender borders / highlights
  characterTheme: "bunny",          // Default character: bunny, bear, kitten, panda, hamster
}
```

### 🐾 Character Models & Expressions
You can set or override characters and their emotional states on each page.
- **Available Characters**: `bunny`, `bear`, `kitten`, `panda`, `hamster`
- **Available Expressions**:
  - `😊 happy` - Smiling winking eyes and small cute smile.
  - `🥺 sad` - Shaking head, watery eyes, and down-turned mouth.
  - `😍 excited` - Floating heart-shaped eyes and wide open smile.
  - `😳 shy` - Blush cheeks with tiny dot eyes looking downwards.
  - `😭 crying` - Screwed eyes with streaming animated tear lines.
  - `🤗 hugging` - Smiling closed eyes with paws reaching out.
  - `🥰 blushing` - Soft smiling eyes, heavy cheek blush, and floating hearts.

---

### 📄 Page Flow Types
Add, edit, or reorder entries inside the `pages` array in `config.js`. Each page supports a specific layout:

#### 1. Standard Story Page (`type: "story"`)
Displays a character bubble, text message, and action button.
```javascript
{
  type: "story",
  character: "bunny",
  expression: "happy",
  bubbleText: "Hi there! ✨",
  message: "I made this tiny space just for you...",
  buttonText: "Continue ❤️"
}
```

#### 2. Envelope Letter Page (`type: "letter"`)
Displays an interactive envelope. Tapping it triggers a wax-seal pop-up and slides up a handwriting-styled card letter.
```javascript
{
  type: "letter",
  character: "kitten",
  expression: "hugging",
  bubbleText: "Read me! ✉️",
  message: "Click the cute envelope below to read what's inside.",
  envelopeLabel: "For My Favorite Person 💖",
  letterContent: "Write your custom heartfelt letter here...",
  buttonText: "Keep going 🌟"
}
```

#### 3. Scrapbook Polaroid Page (`type: "photos"`)
Renders a modern scrapbook display with randomly rotated polaroids. Clicking a photo opens it in a fullscreen zoom overlay with captioning.
```javascript
{
  type: "photos",
  character: "panda",
  expression: "excited",
  bubbleText: "Our memories! 📸",
  photos: [
    { url: "images/photo1.jpg", caption: "Caption 1 💕" },
    { url: "images/photo2.jpg", caption: "Caption 2 😊" }
  ],
  buttonText: "One more thing... 👉"
}
```

#### 4. Runaway Decision Page (`type: "question"`)
Presents a "Will you stay with me?" prompt. The **NO** button runs away and rotates programmatically when approached. The character cries and dialogue updates as they persist. After a configured threshold of evasions, the **NO** button becomes clickable.
```javascript
{
  type: "question",
  character: "hamster",
  expression: "shy",
  yesButtonText: "Yes, forever! 🥰",
  noButtonText: "No... 🥺",
  noRunawayCount: 5,
  noRunawayDialogues: [
    "Wait, are you sure? 🥺",
    "Don't click that! 😭",
    "Try clicking YES instead! 😍"
  ],
  noClickSadResponse: "Fine, you clicked No... But I still love you! 🥺❤️"
}
```

---

## 📸 Screen Captures
At the ending screen, clicking the **Save Memo 📸** button programmatically constructs an HD PNG file containing the custom cartoon theme, dialogue bubble, and congratulations message, saving it straight to your device for easy social media sharing!

## 🌐 Free Deployment
To share this with your friends:
1. Push this folder to a new repository on [GitHub](https://github.com).
2. Go to repository Settings -> **GitHub Pages**, set Source to `main` branch, and click Save.
3. Your site is now live at `https://<username>.github.io/<repo-name>/`!
