"use strict";

const appState = {
  photos: [],
  stickers: [],
  selectedStickerId: null,
  currentTemplate: "classic",
  countdown: 3,
  isCapturing: false,
  stream: null,
  exportType: "image/png",
  filter: "clean",
  mode: localStorage.getItem("nessphotobooth-mode") || "dark",
  history: [],
  maxPhotos: 4,
  stickerSequence: 1,
  drag: null
};

const dom = {
  shell: document.querySelector(".app-shell"),
  video: document.getElementById("video"),
  captureCanvas: document.getElementById("captureCanvas"),
  collageCanvas: document.getElementById("collageCanvas"),
  cameraStatus: document.getElementById("cameraStatus"),
  shotProgress: document.getElementById("shotProgress"),
  cameraPlaceholder: document.getElementById("cameraPlaceholder"),
  countdown: document.getElementById("countdown"),
  flash: document.getElementById("flash"),
  filterLayer: document.getElementById("filterLayer"),
  templateGrid: document.getElementById("templateGrid"),
  templateName: document.getElementById("templateName"),
  filterControls: document.getElementById("filterControls"),
  filterName: document.getElementById("filterName"),
  stickerPalette: document.getElementById("stickerPalette"),
  stickerHint: document.getElementById("stickerHint"),
  rotateStickerLeft: document.getElementById("rotateStickerLeft"),
  rotateStickerRight: document.getElementById("rotateStickerRight"),
  shrinkSticker: document.getElementById("shrinkSticker"),
  growSticker: document.getElementById("growSticker"),
  removeSticker: document.getElementById("removeSticker"),
  shotGallery: document.getElementById("shotGallery"),
  historyGallery: document.getElementById("historyGallery"),
  photoCount: document.getElementById("photoCount"),
  emptyPreview: document.getElementById("emptyPreview"),
  toastStack: document.getElementById("toastStack"),
  startCameraBtn: document.getElementById("startCameraBtn"),
  stopCameraBtn: document.getElementById("stopCameraBtn"),
  captureBtn: document.getElementById("captureBtn"),
  retakeBtn: document.getElementById("retakeBtn"),
  downloadBtn: document.getElementById("downloadBtn"),
  saveHistoryBtn: document.getElementById("saveHistoryBtn"),
  clearHistoryBtn: document.getElementById("clearHistoryBtn"),
  themeToggle: document.getElementById("themeToggle"),
  fullscreenBtn: document.getElementById("fullscreenBtn"),
  pngBtn: document.getElementById("pngBtn"),
  jpgBtn: document.getElementById("jpgBtn")
};

const filters = {
  clean: { label: "Clean", css: "", canvas: "none" },
  peach: { label: "Peach", css: "warm", canvas: "warm" },
  angel: { label: "Angel", css: "rose", canvas: "soft" },
  blueberry: { label: "Blue", css: "cool", canvas: "cool" },
  film: { label: "Film", css: "", canvas: "film" },
  mono: { label: "Mono", css: "mono", canvas: "mono" }
};

const stickerTypes = {
  bow: { label: "Bow", color: "#ff8fbe", size: 118 },
  heart: { label: "Heart", color: "#ff6f9f", size: 92 },
  chromeStar: { label: "Chrome", color: "#dff8ff", size: 104 },
  butterfly: { label: "Butterfly", color: "#bfa0ff", size: 110 },
  lips: { label: "Lips", color: "#ff4c82", size: 98 },
  tape: { label: "Tape", color: "#f6dc9b", size: 156 },
  sparkle: { label: "Sparkle", color: "#fff1a8", size: 86 },
  flower: { label: "Flower", color: "#ffc6dc", size: 104 },
  pearl: { label: "Pearl", color: "#fffaf0", size: 88 },
  cloud: { label: "Cloud", color: "#d9f5ff", size: 120 }
};

const templates = {
  classic: {
    id: "classic",
    name: "Ness Classic",
    short: "Classic",
    width: 1080,
    height: 1920,
    background: "#fff8f1",
    text: "#2d2328",
    accent: "#ff80ad",
    font: "800 52px Trebuchet MS, Arial, sans-serif",
    scriptFont: "42px Comic Sans MS, Bradley Hand, cursive",
    requiredPhotos: 4,
    radius: 42,
    slots: [
      { x: 70, y: 92, w: 940, h: 360 },
      { x: 70, y: 508, w: 940, h: 360 },
      { x: 70, y: 924, w: 940, h: 360 },
      { x: 70, y: 1340, w: 940, h: 360 }
    ],
    caption: { x: 540, y: 1802, align: "center", text: "NESS PHOTO BOOTH" },
    notes: ["soft flash", "ness memories"],
    overlays: ["paper", "glitter"],
    decorations: [
      { type: "sparkle", x: 92, y: 1785, size: 32, color: "#ff9cc4" },
      { type: "heart", x: 972, y: 132, size: 34, color: "#ff80ad" },
      { type: "bow", x: 930, y: 1788, size: 70, color: "#ffc1d9" }
    ],
    date: true
  },
  korean: {
    id: "korean",
    name: "Ness Memories",
    short: "K-Booth",
    width: 1080,
    height: 1920,
    background: "#f9ede9",
    text: "#34252f",
    accent: "#b491ff",
    font: "900 54px Arial Rounded MT Bold, Trebuchet MS, sans-serif",
    scriptFont: "44px Comic Sans MS, Bradley Hand, cursive",
    requiredPhotos: 4,
    radius: 56,
    slots: [
      { x: 78, y: 110, w: 424, h: 548, r: -2 },
      { x: 578, y: 92, w: 424, h: 548, r: 2 },
      { x: 78, y: 718, w: 424, h: 548, r: 2 },
      { x: 578, y: 740, w: 424, h: 548, r: -2 }
    ],
    caption: { x: 540, y: 1535, align: "center", text: "Ness Memories" },
    notes: ["cute today", "four soft moments"],
    overlays: ["paper", "bloom"],
    decorations: [
      { type: "cloud", x: 150, y: 1600, size: 140, color: "#dff7ff" },
      { type: "flower", x: 918, y: 1545, size: 96, color: "#ffd0de" },
      { type: "sparkle", x: 946, y: 112, size: 36, color: "#fff1a8" }
    ],
    date: true
  },
  pink: {
    id: "pink",
    name: "Soft Pink Ness",
    short: "Pink",
    width: 1080,
    height: 1920,
    background: "#ffe6ef",
    text: "#452638",
    accent: "#ff78aa",
    font: "900 50px Trebuchet MS, Arial, sans-serif",
    scriptFont: "46px Comic Sans MS, Bradley Hand, cursive",
    requiredPhotos: 4,
    radius: 54,
    slots: [
      { x: 74, y: 102, w: 932, h: 354 },
      { x: 74, y: 518, w: 932, h: 354 },
      { x: 74, y: 934, w: 932, h: 354 },
      { x: 74, y: 1350, w: 932, h: 354 }
    ],
    caption: { x: 540, y: 1812, align: "center", text: "Ness Booth" },
    notes: ["pretty in pink", "xoxo"],
    overlays: ["bloom", "glitter"],
    decorations: [
      { type: "heart", x: 120, y: 1812, size: 42, color: "#ff6f9f" },
      { type: "heart", x: 960, y: 120, size: 34, color: "#ff9fc0" },
      { type: "pearl", x: 540, y: 52, size: 26, repeat: 18, gap: 46, horizontal: true }
    ],
    date: true
  },
  vintageFilm: {
    id: "vintageFilm",
    name: "Film Strip Vintage",
    short: "Film",
    width: 1080,
    height: 1920,
    background: "#efe1ca",
    text: "#3f3025",
    accent: "#8f6247",
    font: "900 48px Georgia, serif",
    scriptFont: "46px Comic Sans MS, Bradley Hand, cursive",
    requiredPhotos: 4,
    radius: 18,
    slots: [
      { x: 168, y: 90, w: 744, h: 366 },
      { x: 168, y: 514, w: 744, h: 366 },
      { x: 168, y: 938, w: 744, h: 366 },
      { x: 168, y: 1362, w: 744, h: 366 }
    ],
    caption: { x: 540, y: 1820, align: "center", text: "NESS CUTS" },
    notes: ["frame no. 04", "analog love"],
    overlays: ["grain", "scratches", "lightLeak"],
    filmHoles: true,
    decorations: [
      { type: "tape", x: 540, y: 70, size: 210, color: "#d8b67f", r: -4 },
      { type: "sparkle", x: 885, y: 1815, size: 32, color: "#8f6247" }
    ],
    date: true
  },
  couple: {
    id: "couple",
    name: "Cute Couple Booth",
    short: "Couple",
    width: 1080,
    height: 1920,
    background: "#fff1f4",
    text: "#4b2530",
    accent: "#ff5f98",
    font: "900 50px Arial Rounded MT Bold, Trebuchet MS, sans-serif",
    scriptFont: "50px Comic Sans MS, Bradley Hand, cursive",
    requiredPhotos: 4,
    radius: 44,
    slots: [
      { x: 88, y: 110, w: 904, h: 350, r: -1.5 },
      { x: 88, y: 520, w: 904, h: 350, r: 1.7 },
      { x: 88, y: 930, w: 904, h: 350, r: -1.2 },
      { x: 88, y: 1340, w: 904, h: 350, r: 1.3 }
    ],
    caption: { x: 540, y: 1810, align: "center", text: "Ness Love Booth" },
    notes: ["date night", "you + me"],
    overlays: ["paper", "glitter"],
    decorations: [
      { type: "lips", x: 910, y: 178, size: 76, color: "#ff437d", r: -12 },
      { type: "heart", x: 160, y: 1780, size: 48, color: "#ff5f98" },
      { type: "doodle", x: 820, y: 1780, text: "love ya", color: "#4b2530", r: -6 },
      { type: "sparkle", x: 140, y: 130, size: 30, color: "#ffc857" }
    ],
    date: true
  },
  coquette: {
    id: "coquette",
    name: "Coquette Ribbon",
    short: "Ribbon",
    width: 1080,
    height: 1920,
    background: "#fff0f5",
    text: "#513445",
    accent: "#f59abb",
    font: "900 48px Georgia, serif",
    scriptFont: "48px Comic Sans MS, Bradley Hand, cursive",
    requiredPhotos: 4,
    radius: 64,
    slots: [
      { x: 92, y: 130, w: 896, h: 338 },
      { x: 92, y: 548, w: 896, h: 338 },
      { x: 92, y: 966, w: 896, h: 338 },
      { x: 92, y: 1384, w: 896, h: 338 }
    ],
    caption: { x: 540, y: 1818, align: "center", text: "Ness Pearl Room" },
    notes: ["soft ribbon", "pearl flash"],
    overlays: ["lace", "bloom"],
    decorations: [
      { type: "bow", x: 540, y: 72, size: 142, color: "#f59abb" },
      { type: "pearl", x: 62, y: 120, size: 20, repeat: 36, gap: 48, vertical: true },
      { type: "pearl", x: 1018, y: 120, size: 20, repeat: 36, gap: 48, vertical: true },
      { type: "flower", x: 905, y: 1810, size: 70, color: "#ffd6e5" }
    ],
    date: true
  },
  kawaii: {
    id: "kawaii",
    name: "Kawaii Sticker Bomb",
    short: "Kawaii",
    width: 1080,
    height: 1920,
    background: "#fff7c9",
    text: "#343047",
    accent: "#ff8cc6",
    font: "900 50px Arial Rounded MT Bold, Trebuchet MS, sans-serif",
    scriptFont: "48px Comic Sans MS, Bradley Hand, cursive",
    requiredPhotos: 4,
    radius: 36,
    slots: [
      { x: 76, y: 120, w: 430, h: 520, r: -2 },
      { x: 575, y: 94, w: 430, h: 520, r: 3 },
      { x: 80, y: 730, w: 430, h: 520, r: 2.5 },
      { x: 575, y: 704, w: 430, h: 520, r: -2 }
    ],
    caption: { x: 540, y: 1590, align: "center", text: "Ness Kawaii Club" },
    notes: ["cutie cam", "sticker bomb"],
    overlays: ["glitter", "paper"],
    decorations: [
      { type: "bow", x: 125, y: 83, size: 74, color: "#ff8cc6" },
      { type: "smiley", x: 940, y: 82, size: 64, color: "#ffe766" },
      { type: "butterfly", x: 135, y: 1775, size: 82, color: "#a8d8ff" },
      { type: "flower", x: 912, y: 1780, size: 82, color: "#ffc9e2" },
      { type: "sparkle", x: 540, y: 1705, size: 46, color: "#b491ff" }
    ],
    date: true
  },
  scrapbook: {
    id: "scrapbook",
    name: "Scrapbook Journal",
    short: "Journal",
    width: 1080,
    height: 1500,
    background: "#f5ead9",
    text: "#453527",
    accent: "#e89a7d",
    font: "900 48px Georgia, serif",
    scriptFont: "52px Comic Sans MS, Bradley Hand, cursive",
    requiredPhotos: 4,
    radius: 20,
    slots: [
      { x: 88, y: 130, w: 420, h: 430, r: -5 },
      { x: 566, y: 115, w: 420, h: 430, r: 4 },
      { x: 120, y: 665, w: 420, h: 430, r: 4 },
      { x: 590, y: 650, w: 420, h: 430, r: -4 }
    ],
    caption: { x: 540, y: 1335, align: "center", text: "Ness Journal" },
    notes: ["today was cute", "taped memories"],
    overlays: ["paper", "grain"],
    decorations: [
      { type: "tape", x: 300, y: 105, size: 170, color: "#f0ca7e", r: -8 },
      { type: "tape", x: 760, y: 625, size: 170, color: "#dbd1ff", r: 9 },
      { type: "doodle", x: 150, y: 1225, text: "dear diary", color: "#453527", r: -8 },
      { type: "flower", x: 930, y: 1322, size: 82, color: "#f7b5a6" }
    ],
    date: true
  },
  cyberGirl: {
    id: "cyberGirl",
    name: "Cyber Y2K Girl",
    short: "Cyber",
    width: 1080,
    height: 1920,
    background: "#090716",
    text: "#fef7ff",
    accent: "#ff4fc3",
    font: "900 48px Arial Black, Trebuchet MS, sans-serif",
    scriptFont: "42px Trebuchet MS, Arial, sans-serif",
    requiredPhotos: 4,
    radius: 24,
    slots: [
      { x: 76, y: 104, w: 928, h: 360 },
      { x: 76, y: 526, w: 928, h: 360 },
      { x: 76, y: 948, w: 928, h: 360 },
      { x: 76, y: 1370, w: 928, h: 360 }
    ],
    caption: { x: 540, y: 1830, align: "center", text: "NESS.exe" },
    notes: ["chrome blush", "digital angel"],
    overlays: ["holographic", "glitter", "bloom"],
    decorations: [
      { type: "chromeStar", x: 128, y: 86, size: 70, color: "#e8fbff" },
      { type: "chromeStar", x: 950, y: 1810, size: 88, color: "#f9eaff" },
      { type: "sparkle", x: 968, y: 120, size: 34, color: "#13f7ff" }
    ],
    date: true
  },
  sakura: {
    id: "sakura",
    name: "Soft Sakura",
    short: "Sakura",
    width: 1080,
    height: 1920,
    background: "#fff3ec",
    text: "#44303a",
    accent: "#ff9db3",
    font: "900 50px Georgia, serif",
    scriptFont: "48px Comic Sans MS, Bradley Hand, cursive",
    requiredPhotos: 4,
    radius: 48,
    slots: [
      { x: 82, y: 100, w: 916, h: 360 },
      { x: 82, y: 516, w: 916, h: 360 },
      { x: 82, y: 932, w: 916, h: 360 },
      { x: 82, y: 1348, w: 916, h: 360 }
    ],
    caption: { x: 540, y: 1818, align: "center", text: "Ness Sakura" },
    notes: ["petal soft", "spring booth"],
    overlays: ["bloom", "paper"],
    decorations: [
      { type: "sakura", x: 135, y: 88, size: 76, color: "#ffb7c8", r: -20 },
      { type: "sakura", x: 935, y: 1755, size: 88, color: "#ffb7c8", r: 18 },
      { type: "petals", x: 0, y: 0, size: 1, color: "#ffb7c8" }
    ],
    date: true
  },
  mirror: {
    id: "mirror",
    name: "Mirror Selfie",
    short: "Mirror",
    width: 1080,
    height: 1920,
    background: "#e9eef9",
    text: "#202437",
    accent: "#ffffff",
    font: "900 50px Arial Rounded MT Bold, Trebuchet MS, sans-serif",
    scriptFont: "44px Comic Sans MS, Bradley Hand, cursive",
    requiredPhotos: 2,
    radius: 80,
    slots: [
      { x: 170, y: 120, w: 740, h: 760, r: -1 },
      { x: 170, y: 980, w: 740, h: 760, r: 1 }
    ],
    caption: { x: 540, y: 1840, align: "center", text: "Ness Mirror" },
    notes: ["flash on", "mirror fit"],
    overlays: ["flashReflection", "bloom"],
    decorations: [
      { type: "sparkle", x: 835, y: 155, size: 86, color: "#ffffff" },
      { type: "doodle", x: 142, y: 1810, text: "mirror check", color: "#202437", r: -8 }
    ],
    date: false
  },
  two: {
    id: "two",
    name: "Ness Two Cut",
    short: "Two Cut",
    width: 1080,
    height: 1500,
    background: "#fffdf8",
    text: "#332a31",
    accent: "#ff8db7",
    font: "900 48px Trebuchet MS, Arial, sans-serif",
    scriptFont: "46px Comic Sans MS, Bradley Hand, cursive",
    requiredPhotos: 2,
    radius: 42,
    slots: [
      { x: 88, y: 112, w: 904, h: 502, r: -1.4 },
      { x: 88, y: 708, w: 904, h: 502, r: 1.4 }
    ],
    caption: { x: 540, y: 1385, align: "center", text: "Ness Cuts" },
    notes: ["two sweet frames"],
    overlays: ["paper", "glitter"],
    decorations: [
      { type: "bow", x: 540, y: 64, size: 110, color: "#ffc1d9" },
      { type: "heart", x: 935, y: 1355, size: 42, color: "#ff8db7" }
    ],
    date: true
  }
};

const Utility = {
  sleep(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  },
  clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  },
  filename(extension) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    return `nessphotobooth-${stamp}.${extension}`;
  },
  canvasToBlob(canvas, type, quality = 0.92) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not export image."));
      }, type, quality);
    });
  },
  loadImageFromBlob(blob) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read captured photo."));
      };
      img.src = url;
    });
  }
};

const UI = {
  init() {
    dom.shell.dataset.mode = appState.mode;
    dom.themeToggle.textContent = appState.mode === "dark" ? "Moon" : "Sun";
    this.renderProgress();
    this.renderTemplates();
    this.renderFilters();
    this.renderStickerPalette();
    this.renderGallery();
    this.loadHistory();
    this.updateControls();
    this.bindEvents();
  },
  bindEvents() {
    dom.startCameraBtn.addEventListener("click", () => Camera.start());
    dom.stopCameraBtn.addEventListener("click", () => Camera.stop());
    dom.captureBtn.addEventListener("click", () => Capture.startSequence());
    dom.retakeBtn.addEventListener("click", () => Capture.retake());
    dom.downloadBtn.addEventListener("click", () => DownloadManager.download());
    dom.saveHistoryBtn.addEventListener("click", () => DownloadManager.saveCurrentToHistory());
    dom.clearHistoryBtn.addEventListener("click", () => this.clearHistory());
    dom.themeToggle.addEventListener("click", () => this.toggleTheme());
    dom.fullscreenBtn.addEventListener("click", () => Effects.toggleFullscreen());
    dom.pngBtn.addEventListener("click", () => this.setExportType("image/png"));
    dom.jpgBtn.addEventListener("click", () => this.setExportType("image/jpeg"));
    dom.rotateStickerLeft.addEventListener("click", () => StickerEngine.transformSelected({ rotation: -15 }));
    dom.rotateStickerRight.addEventListener("click", () => StickerEngine.transformSelected({ rotation: 15 }));
    dom.shrinkSticker.addEventListener("click", () => StickerEngine.transformSelected({ scale: 0.9 }));
    dom.growSticker.addEventListener("click", () => StickerEngine.transformSelected({ scale: 1.1 }));
    dom.removeSticker.addEventListener("click", () => StickerEngine.removeSelected());
    dom.collageCanvas.addEventListener("pointerdown", (event) => StickerEngine.pointerDown(event));
    dom.collageCanvas.addEventListener("pointermove", (event) => StickerEngine.pointerMove(event));
    dom.collageCanvas.addEventListener("pointerup", (event) => StickerEngine.pointerUp(event));
    dom.collageCanvas.addEventListener("pointercancel", (event) => StickerEngine.pointerUp(event));
    dom.collageCanvas.addEventListener("wheel", (event) => StickerEngine.wheel(event), { passive: false });
    window.addEventListener("beforeunload", () => Camera.stop());
    window.addEventListener("keydown", (event) => this.handleKeyboard(event));
  },
  handleKeyboard(event) {
    if (event.target && ["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;
    const key = event.key.toLowerCase();
    if (event.code === "Space") {
      event.preventDefault();
      if (!dom.captureBtn.disabled) Capture.startSequence();
    }
    if (key === "r" && !dom.retakeBtn.disabled) Capture.retake();
    if (key === "f") Effects.toggleFullscreen();
    if (key === "t") this.toggleTheme();
    if (key === "delete" || key === "backspace") StickerEngine.removeSelected();
    if (key === "[" || key === "]") StickerEngine.transformSelected({ rotation: key === "[" ? -8 : 8 });
  },
  renderTemplates() {
    dom.templateGrid.innerHTML = "";
    Object.values(templates).forEach((template) => {
      const button = document.createElement("button");
      button.className = `template-card ${template.id === appState.currentTemplate ? "active" : ""}`;
      button.type = "button";
      button.style.setProperty("--swatch", template.background);
      button.style.setProperty("--accent", template.accent);
      button.innerHTML = `
        <div class="template-swatch ${template.id}" aria-hidden="true">
          <i></i><i></i><i></i><i></i>
          <b></b><em></em>
        </div>
        <span>${template.name}</span>
        <small>${template.short}</small>
      `;
      button.addEventListener("click", () => TemplateEngine.select(template.id));
      dom.templateGrid.appendChild(button);
    });
    dom.templateName.textContent = templates[appState.currentTemplate].name;
  },
  renderFilters() {
    dom.filterControls.innerHTML = "";
    Object.entries(filters).forEach(([id, filter]) => {
      const button = document.createElement("button");
      button.className = `filter-chip ${id === appState.filter ? "active" : ""}`;
      button.type = "button";
      button.textContent = filter.label;
      button.addEventListener("click", () => TemplateEngine.setFilter(id));
      dom.filterControls.appendChild(button);
    });
    dom.filterName.textContent = filters[appState.filter].label;
    dom.filterLayer.className = `filter-layer ${filters[appState.filter].css}`;
  },
  renderStickerPalette() {
    dom.stickerPalette.innerHTML = "";
    Object.entries(stickerTypes).forEach(([id, sticker]) => {
      const button = document.createElement("button");
      button.className = `sticker-chip sticker-${id}`;
      button.type = "button";
      button.textContent = sticker.label;
      button.addEventListener("click", () => StickerEngine.add(id));
      dom.stickerPalette.appendChild(button);
    });
    this.updateStickerControls();
  },
  updateStickerControls() {
    const hasSelected = Boolean(appState.selectedStickerId);
    dom.rotateStickerLeft.disabled = !hasSelected;
    dom.rotateStickerRight.disabled = !hasSelected;
    dom.shrinkSticker.disabled = !hasSelected;
    dom.growSticker.disabled = !hasSelected;
    dom.removeSticker.disabled = !hasSelected;
    dom.stickerHint.textContent = hasSelected
      ? "Drag on the preview. Use wheel or +/- buttons to resize."
      : "Add a sticker, then drag it on the collage preview.";
  },
  renderProgress() {
    dom.shotProgress.innerHTML = "";
    const required = templates[appState.currentTemplate].requiredPhotos || appState.maxPhotos;
    for (let index = 0; index < required; index += 1) {
      const dot = document.createElement("span");
      dot.className = `progress-dot ${index < appState.photos.length ? "done" : ""}`;
      dom.shotProgress.appendChild(dot);
    }
    dom.photoCount.textContent = `${appState.photos.length} / ${required}`;
  },
  renderGallery() {
    dom.shotGallery.innerHTML = "";
    appState.photos.forEach((photo, index) => {
      const item = document.createElement("div");
      item.className = "shot-thumb";
      item.innerHTML = `<img src="${photo.previewUrl}" alt="Captured shot ${index + 1}"><span>${index + 1}</span>`;
      dom.shotGallery.appendChild(item);
    });
    this.renderProgress();
    this.updateControls();
  },
  updateControls() {
    const hasStream = Boolean(appState.stream);
    const hasPhotos = appState.photos.length > 0;
    dom.startCameraBtn.disabled = hasStream;
    dom.stopCameraBtn.disabled = !hasStream || appState.isCapturing;
    dom.captureBtn.disabled = !hasStream || appState.isCapturing;
    dom.retakeBtn.disabled = !hasPhotos || appState.isCapturing;
    dom.downloadBtn.disabled = !hasPhotos;
    dom.saveHistoryBtn.disabled = !hasPhotos;
    dom.emptyPreview.classList.toggle("hidden", hasPhotos);
  },
  setStatus(text, live = false) {
    dom.cameraStatus.classList.toggle("live", live);
    dom.cameraStatus.querySelector("span:last-child").textContent = text;
  },
  showToast(title, message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
    dom.toastStack.appendChild(toast);
    window.setTimeout(() => toast.remove(), 4300);
  },
  setExportType(type) {
    appState.exportType = type;
    dom.pngBtn.classList.toggle("active", type === "image/png");
    dom.jpgBtn.classList.toggle("active", type === "image/jpeg");
  },
  toggleTheme() {
    appState.mode = appState.mode === "dark" ? "light" : "dark";
    dom.shell.dataset.mode = appState.mode;
    dom.themeToggle.textContent = appState.mode === "dark" ? "Moon" : "Sun";
    localStorage.setItem("nessphotobooth-mode", appState.mode);
  },
  loadHistory() {
    try {
      appState.history = JSON.parse(localStorage.getItem("nessphotobooth-history") || "[]");
    } catch {
      appState.history = [];
    }
    this.renderHistory();
  },
  renderHistory() {
    dom.historyGallery.innerHTML = "";
    appState.history.forEach((src, index) => {
      const item = document.createElement("button");
      item.className = "history-thumb";
      item.type = "button";
      item.title = `History item ${index + 1}`;
      item.innerHTML = `<img src="${src}" alt="Saved NessPhotoBooth collage ${index + 1}">`;
      item.addEventListener("click", () => DownloadManager.downloadDataUrl(src));
      dom.historyGallery.appendChild(item);
    });
  },
  clearHistory() {
    appState.history = [];
    localStorage.removeItem("nessphotobooth-history");
    this.renderHistory();
  }
};

const Camera = {
  async start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      UI.showToast("Unsupported browser", "This browser cannot access a webcam with getUserMedia.");
      UI.setStatus("Unsupported");
      return;
    }

    try {
      UI.setStatus("Requesting camera");
      appState.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 960 }
        }
      });
      dom.video.srcObject = appState.stream;
      await dom.video.play();
      dom.cameraPlaceholder.classList.add("hidden");
      UI.setStatus("Camera live", true);
      UI.updateControls();
    } catch (error) {
      appState.stream = null;
      UI.setStatus("Camera blocked");
      UI.showToast("Camera unavailable", Camera.messageForError(error));
      UI.updateControls();
    }
  },
  stop() {
    if (appState.stream) {
      appState.stream.getTracks().forEach((track) => track.stop());
    }
    appState.stream = null;
    dom.video.srcObject = null;
    dom.cameraPlaceholder.classList.remove("hidden");
    UI.setStatus("Camera idle");
    UI.updateControls();
  },
  messageForError(error) {
    if (!error) return "Could not start the webcam.";
    if (error.name === "NotAllowedError") return "Permission was denied. Allow camera access and try again.";
    if (error.name === "NotFoundError") return "No webcam was found on this device.";
    if (error.name === "NotReadableError") return "The webcam is already in use by another app.";
    return "Could not start the webcam. Check browser permissions and device settings.";
  }
};

const Capture = {
  async startSequence() {
    if (appState.isCapturing || !appState.stream) return;

    const required = templates[appState.currentTemplate].requiredPhotos || appState.maxPhotos;
    appState.isCapturing = true;
    this.releasePhotoUrls();
    appState.photos = [];
    UI.renderGallery();
    UI.updateControls();

    try {
      for (let index = 0; index < required; index += 1) {
        await this.runCountdown();
        const photo = await this.captureFrame();
        appState.photos.push(photo);
        UI.renderGallery();
        await CollageEngine.render();
        await Utility.sleep(650);
      }
      UI.showToast("Ness strip ready", "Your aesthetic booth collage is ready to save.");
    } catch (error) {
      UI.showToast("Capture failed", error.message || "Could not capture photos.");
    } finally {
      appState.isCapturing = false;
      dom.countdown.classList.remove("show");
      dom.countdown.textContent = "";
      UI.updateControls();
    }
  },
  async runCountdown() {
    for (let value = appState.countdown; value > 0; value -= 1) {
      dom.countdown.textContent = value;
      dom.countdown.classList.remove("show");
      void dom.countdown.offsetWidth;
      dom.countdown.classList.add("show");
      await Effects.beep(value);
      await Utility.sleep(1000);
    }
  },
  async captureFrame() {
    const video = dom.video;
    if (!video.videoWidth || !video.videoHeight) {
      throw new Error("Camera video is not ready yet.");
    }

    const maxWidth = 1600;
    const ratio = video.videoWidth / video.videoHeight;
    const width = Math.min(maxWidth, video.videoWidth);
    const height = Math.round(width / ratio);
    const canvas = dom.captureCanvas;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: false });

    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();
    CollageEngine.applyFilter(ctx, width, height, filters[appState.filter].canvas);

    Effects.flash();
    Effects.shutterSound();

    const blob = await Utility.canvasToBlob(canvas, "image/jpeg", 0.9);
    const previewUrl = URL.createObjectURL(blob);
    const bitmap = window.createImageBitmap
      ? await createImageBitmap(blob)
      : await Utility.loadImageFromBlob(blob);
    return { blob, previewUrl, bitmap, width, height };
  },
  retake() {
    this.releasePhotoUrls();
    appState.photos = [];
    UI.renderGallery();
    CollageEngine.clear();
  },
  releasePhotoUrls() {
    appState.photos.forEach((photo) => {
      if (photo.previewUrl) URL.revokeObjectURL(photo.previewUrl);
      if (photo.bitmap && typeof photo.bitmap.close === "function") photo.bitmap.close();
    });
  }
};

const TemplateEngine = {
  select(id) {
    if (!templates[id]) return;
    appState.currentTemplate = id;
    const required = templates[id].requiredPhotos || appState.maxPhotos;
    if (appState.photos.length > required) {
      const removed = appState.photos.splice(required);
      removed.forEach((photo) => {
        URL.revokeObjectURL(photo.previewUrl);
        if (photo.bitmap && typeof photo.bitmap.close === "function") photo.bitmap.close();
      });
    }
    UI.renderTemplates();
    UI.renderGallery();
    CollageEngine.render();
  },
  setFilter(id) {
    if (!filters[id]) return;
    appState.filter = id;
    UI.renderFilters();
  }
};

const StickerEngine = {
  add(type) {
    const sticker = stickerTypes[type];
    if (!sticker) return;
    const template = templates[appState.currentTemplate];
    const offset = appState.stickerSequence * 18;
    const item = {
      id: `sticker-${appState.stickerSequence}`,
      type,
      x: template.width * 0.5 + (offset % 120) - 60,
      y: template.height * 0.5 + (offset % 160) - 80,
      size: sticker.size,
      rotation: (appState.stickerSequence % 5 - 2) * 7,
      color: sticker.color
    };
    appState.stickerSequence += 1;
    appState.stickers.push(item);
    appState.selectedStickerId = item.id;
    UI.updateStickerControls();
    CollageEngine.render();
  },
  getSelected() {
    return appState.stickers.find((sticker) => sticker.id === appState.selectedStickerId);
  },
  transformSelected(change) {
    const sticker = this.getSelected();
    if (!sticker) return;
    if (change.rotation) sticker.rotation += change.rotation;
    if (change.scale) sticker.size = Utility.clamp(sticker.size * change.scale, 36, 360);
    CollageEngine.render();
  },
  removeSelected() {
    if (!appState.selectedStickerId) return;
    appState.stickers = appState.stickers.filter((sticker) => sticker.id !== appState.selectedStickerId);
    appState.selectedStickerId = null;
    appState.drag = null;
    UI.updateStickerControls();
    CollageEngine.render();
  },
  pointerDown(event) {
    const point = this.canvasPoint(event);
    const sticker = this.hitTest(point.x, point.y);
    if (!sticker) {
      appState.selectedStickerId = null;
      UI.updateStickerControls();
      CollageEngine.render();
      return;
    }
    appState.selectedStickerId = sticker.id;
    appState.drag = {
      id: sticker.id,
      dx: point.x - sticker.x,
      dy: point.y - sticker.y
    };
    dom.collageCanvas.setPointerCapture(event.pointerId);
    UI.updateStickerControls();
    CollageEngine.render();
  },
  pointerMove(event) {
    if (!appState.drag) return;
    const sticker = this.getSelected();
    if (!sticker) return;
    const point = this.canvasPoint(event);
    const template = templates[appState.currentTemplate];
    sticker.x = Utility.clamp(point.x - appState.drag.dx, -120, template.width + 120);
    sticker.y = Utility.clamp(point.y - appState.drag.dy, -120, template.height + 120);
    CollageEngine.render();
  },
  pointerUp(event) {
    if (appState.drag && dom.collageCanvas.hasPointerCapture(event.pointerId)) {
      dom.collageCanvas.releasePointerCapture(event.pointerId);
    }
    appState.drag = null;
  },
  wheel(event) {
    const sticker = this.getSelected();
    if (!sticker) return;
    event.preventDefault();
    const scale = event.deltaY < 0 ? 1.07 : 0.93;
    sticker.size = Utility.clamp(sticker.size * scale, 36, 360);
    CollageEngine.render();
  },
  canvasPoint(event) {
    const rect = dom.collageCanvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (dom.collageCanvas.width / rect.width),
      y: (event.clientY - rect.top) * (dom.collageCanvas.height / rect.height)
    };
  },
  hitTest(x, y) {
    for (let i = appState.stickers.length - 1; i >= 0; i -= 1) {
      const sticker = appState.stickers[i];
      const half = sticker.size * 0.62;
      const angle = -sticker.rotation * Math.PI / 180;
      const dx = x - sticker.x;
      const dy = y - sticker.y;
      const rx = dx * Math.cos(angle) - dy * Math.sin(angle);
      const ry = dx * Math.sin(angle) + dy * Math.cos(angle);
      if (Math.abs(rx) <= half && Math.abs(ry) <= half) return sticker;
    }
    return null;
  }
};

const CollageEngine = {
  async render(options = {}) {
    const includeSelection = options.includeSelection !== false;
    const template = templates[appState.currentTemplate];
    const canvas = dom.collageCanvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    canvas.width = template.width;
    canvas.height = template.height;

    this.drawBackground(ctx, template);
    this.drawSlots(ctx, template);
    DecorationEngine.drawTemplateDecorations(ctx, template);
    this.drawText(ctx, template);
    OverlayEngine.apply(ctx, template);
    DecorationEngine.drawStickers(ctx, appState.stickers, includeSelection);

    dom.emptyPreview.classList.toggle("hidden", appState.photos.length > 0);
    UI.updateControls();
  },
  clear() {
    const canvas = dom.collageCanvas;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dom.emptyPreview.classList.remove("hidden");
    UI.updateControls();
  },
  drawBackground(ctx, template) {
    const gradient = ctx.createLinearGradient(0, 0, template.width, template.height);
    gradient.addColorStop(0, template.background);
    gradient.addColorStop(0.56, this.tint(template.background, 18));
    gradient.addColorStop(1, this.tint(template.accent, 48));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, template.width, template.height);

    ctx.globalAlpha = 0.14;
    ctx.fillStyle = "#ffffff";
    for (let y = 34; y < template.height; y += 86) {
      for (let x = 34; x < template.width; x += 86) {
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    if (template.filmHoles) this.drawFilmHoles(ctx, template);
  },
  drawFilmHoles(ctx, template) {
    ctx.save();
    ctx.fillStyle = "#1f1712";
    for (let y = 70; y < template.height - 80; y += 112) {
      this.roundRect(ctx, 48, y, 66, 46, 9);
      ctx.fill();
      this.roundRect(ctx, template.width - 114, y, 66, 46, 9);
      ctx.fill();
    }
    ctx.restore();
  },
  drawSlots(ctx, template) {
    template.slots.forEach((slot, index) => {
      this.withSlotTransform(ctx, slot, () => {
        const paperPad = slot.polaroid ? 34 : 16;
        ctx.save();
        ctx.shadowColor = "rgba(51, 36, 48, 0.26)";
        ctx.shadowBlur = 28;
        ctx.shadowOffsetY = 16;
        this.roundRect(ctx, slot.x - paperPad, slot.y - paperPad, slot.w + paperPad * 2, slot.h + paperPad * 2 + (slot.polaroid || 0), template.radius + 12);
        ctx.fillStyle = slot.paper || "rgba(255,255,255,0.88)";
        ctx.fill();
        ctx.restore();

        const photo = appState.photos[index];
        if (photo) {
          ctx.save();
          this.roundRect(ctx, slot.x, slot.y, slot.w, slot.h, template.radius);
          ctx.clip();
          this.coverImage(ctx, photo.bitmap, slot.x, slot.y, slot.w, slot.h);
          ctx.restore();
        } else {
          this.drawEmptySlot(ctx, slot, index + 1, template);
        }

        ctx.save();
        ctx.strokeStyle = template.accent;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = template.id === "cyberGirl" ? 5 : 2;
        this.roundRect(ctx, slot.x, slot.y, slot.w, slot.h, template.radius);
        ctx.stroke();
        ctx.restore();
      });
    });
  },
  withSlotTransform(ctx, slot, callback) {
    if (!slot.r) {
      callback();
      return;
    }
    const cx = slot.x + slot.w / 2;
    const cy = slot.y + slot.h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(slot.r * Math.PI / 180);
    ctx.translate(-cx, -cy);
    callback();
    ctx.restore();
  },
  drawEmptySlot(ctx, slot, number, template) {
    this.roundRect(ctx, slot.x, slot.y, slot.w, slot.h, template.radius);
    ctx.fillStyle = "rgba(255,255,255,0.26)";
    ctx.fill();
    ctx.fillStyle = template.text;
    ctx.globalAlpha = 0.38;
    ctx.font = "900 72px Trebuchet MS, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`NESS ${number}`, slot.x + slot.w / 2, slot.y + slot.h / 2);
    ctx.globalAlpha = 1;
  },
  drawText(ctx, template) {
    const now = new Date();
    const date = now.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
    ctx.save();
    ctx.fillStyle = template.text;
    ctx.font = template.font;
    ctx.textAlign = template.caption.align;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(template.caption.text, template.caption.x, template.caption.y);

    ctx.font = template.scriptFont;
    ctx.globalAlpha = 0.82;
    (template.notes || []).forEach((note, index) => {
      ctx.save();
      const x = index % 2 === 0 ? 110 : template.width - 110;
      const y = template.caption.y - 140 - index * 56;
      ctx.translate(x, y);
      ctx.rotate((index % 2 === 0 ? -8 : 7) * Math.PI / 180);
      ctx.textAlign = index % 2 === 0 ? "left" : "right";
      ctx.fillText(note, 0, 0);
      ctx.restore();
    });

    if (template.date) {
      ctx.font = "700 28px Trebuchet MS, Arial, sans-serif";
      ctx.globalAlpha = 0.68;
      ctx.fillText(date, template.caption.x, template.caption.y + 52);
    }
    ctx.restore();
  },
  coverImage(ctx, image, x, y, w, h) {
    const imageRatio = image.width / image.height;
    const boxRatio = w / h;
    let drawW = w;
    let drawH = h;
    let dx = x;
    let dy = y;

    if (imageRatio > boxRatio) {
      drawH = h;
      drawW = h * imageRatio;
      dx = x - (drawW - w) / 2;
    } else {
      drawW = w;
      drawH = w / imageRatio;
      dy = y - (drawH - h) / 2;
    }

    ctx.drawImage(image, dx, dy, drawW, drawH);
  },
  applyFilter(ctx, width, height, filter) {
    if (filter === "none") return;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      if (filter === "mono") {
        const avg = r * 0.299 + g * 0.587 + b * 0.114;
        r = g = b = avg;
      }
      if (filter === "warm") {
        r += 18;
        g += 8;
        b -= 8;
      }
      if (filter === "cool") {
        r -= 8;
        g += 7;
        b += 18;
      }
      if (filter === "soft") {
        r = r * 1.05 + 12;
        g = g * 1.03 + 7;
        b = b * 1.04 + 10;
      }
      if (filter === "film") {
        r = r * 1.04 + 12;
        g = g * 0.99 + 5;
        b = b * 0.92;
      }

      data[i] = Utility.clamp(r, 0, 255);
      data[i + 1] = Utility.clamp(g, 0, 255);
      data[i + 2] = Utility.clamp(b, 0, 255);
    }
    ctx.putImageData(imageData, 0, 0);
  },
  roundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  },
  tint(hex, amount) {
    const clean = hex.replace("#", "");
    const num = parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
    const r = Utility.clamp((num >> 16) + amount, 0, 255);
    const g = Utility.clamp(((num >> 8) & 255) + amount, 0, 255);
    const b = Utility.clamp((num & 255) + amount, 0, 255);
    return `rgb(${r}, ${g}, ${b})`;
  }
};

const DecorationEngine = {
  drawTemplateDecorations(ctx, template) {
    (template.decorations || []).forEach((decoration) => this.drawDecoration(ctx, decoration, template));
  },
  drawStickers(ctx, stickers, includeSelection) {
    stickers.forEach((sticker) => {
      this.drawDecoration(ctx, sticker, templates[appState.currentTemplate]);
      if (includeSelection && sticker.id === appState.selectedStickerId) {
        ctx.save();
        ctx.translate(sticker.x, sticker.y);
        ctx.rotate(sticker.rotation * Math.PI / 180);
        ctx.setLineDash([14, 10]);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
        ctx.strokeRect(-sticker.size * 0.58, -sticker.size * 0.58, sticker.size * 1.16, sticker.size * 1.16);
        ctx.restore();
      }
    });
  },
  drawDecoration(ctx, item, template) {
    if (item.repeat) {
      for (let i = 0; i < item.repeat; i += 1) {
        this.drawDecoration(ctx, {
          ...item,
          repeat: 0,
          x: item.x + (item.horizontal ? (i - item.repeat / 2) * item.gap : 0),
          y: item.y + (item.vertical ? i * item.gap : 0)
        }, template);
      }
      return;
    }

    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate((item.r || item.rotation || 0) * Math.PI / 180);
    ctx.fillStyle = item.color || template.accent;
    ctx.strokeStyle = item.color || template.accent;
    ctx.lineWidth = Math.max(2, (item.size || 60) / 24);

    const size = item.size || 60;
    const type = item.type;
    if (type === "heart") this.heart(ctx, size);
    if (type === "bow") this.bow(ctx, size);
    if (type === "sparkle") this.sparkle(ctx, size);
    if (type === "chromeStar") this.chromeStar(ctx, size);
    if (type === "butterfly") this.butterfly(ctx, size);
    if (type === "lips") this.lips(ctx, size);
    if (type === "tape") this.tape(ctx, size);
    if (type === "flower") this.flower(ctx, size);
    if (type === "pearl") this.pearl(ctx, size);
    if (type === "cloud") this.cloud(ctx, size);
    if (type === "smiley") this.smiley(ctx, size);
    if (type === "sakura") this.sakura(ctx, size);
    if (type === "petals") this.petals(ctx, template);
    if (type === "doodle") this.doodle(ctx, item);
    ctx.restore();
  },
  heart(ctx, size) {
    ctx.beginPath();
    ctx.moveTo(0, size * 0.34);
    ctx.bezierCurveTo(-size * 1.05, -size * 0.4, -size * 0.34, -size * 1.12, 0, -size * 0.42);
    ctx.bezierCurveTo(size * 0.34, -size * 1.12, size * 1.05, -size * 0.4, 0, size * 0.34);
    ctx.fill();
  },
  bow(ctx, size) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(-size * 0.25, 0, size * 0.28, size * 0.2, -0.35, 0, Math.PI * 2);
    ctx.ellipse(size * 0.25, 0, size * 0.28, size * 0.2, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
  sparkle(ctx, size) {
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.55);
    ctx.lineTo(size * 0.14, -size * 0.14);
    ctx.lineTo(size * 0.55, 0);
    ctx.lineTo(size * 0.14, size * 0.14);
    ctx.lineTo(0, size * 0.55);
    ctx.lineTo(-size * 0.14, size * 0.14);
    ctx.lineTo(-size * 0.55, 0);
    ctx.lineTo(-size * 0.14, -size * 0.14);
    ctx.closePath();
    ctx.fill();
  },
  chromeStar(ctx, size) {
    const gradient = ctx.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.35, "#bdeeff");
    gradient.addColorStop(0.7, "#ffa7f2");
    gradient.addColorStop(1, "#ffffff");
    ctx.fillStyle = gradient;
    this.star(ctx, size, 5);
    ctx.strokeStyle = "rgba(255,255,255,0.86)";
    ctx.stroke();
  },
  star(ctx, size, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i += 1) {
      const angle = -Math.PI / 2 + i * Math.PI / points;
      const radius = i % 2 === 0 ? size * 0.55 : size * 0.23;
      ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    ctx.closePath();
    ctx.fill();
  },
  butterfly(ctx, size) {
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.ellipse(-size * 0.18, -size * 0.12, size * 0.22, size * 0.32, 0.6, 0, Math.PI * 2);
    ctx.ellipse(size * 0.18, -size * 0.12, size * 0.22, size * 0.32, -0.6, 0, Math.PI * 2);
    ctx.ellipse(-size * 0.15, size * 0.18, size * 0.18, size * 0.23, -0.4, 0, Math.PI * 2);
    ctx.ellipse(size * 0.15, size * 0.18, size * 0.18, size * 0.23, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(80,50,90,0.55)";
    ctx.fillRect(-size * 0.035, -size * 0.34, size * 0.07, size * 0.68);
    ctx.restore();
  },
  lips(ctx, size) {
    ctx.beginPath();
    ctx.ellipse(-size * 0.19, -size * 0.05, size * 0.28, size * 0.14, -0.2, 0, Math.PI * 2);
    ctx.ellipse(size * 0.19, -size * 0.05, size * 0.28, size * 0.14, 0.2, 0, Math.PI * 2);
    ctx.ellipse(0, size * 0.12, size * 0.42, size * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.moveTo(-size * 0.42, size * 0.04);
    ctx.quadraticCurveTo(0, size * 0.14, size * 0.42, size * 0.04);
    ctx.stroke();
  },
  tape(ctx, size) {
    ctx.save();
    ctx.globalAlpha = 0.82;
    ctx.fillRect(-size * 0.5, -size * 0.14, size, size * 0.28);
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#ffffff";
    for (let x = -size * 0.44; x < size * 0.48; x += size * 0.12) {
      ctx.fillRect(x, -size * 0.14, size * 0.05, size * 0.28);
    }
    ctx.restore();
  },
  flower(ctx, size) {
    for (let i = 0; i < 6; i += 1) {
      ctx.save();
      ctx.rotate(i * Math.PI / 3);
      ctx.beginPath();
      ctx.ellipse(0, -size * 0.25, size * 0.16, size * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = "#fff0a8";
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
  },
  pearl(ctx, size) {
    const gradient = ctx.createRadialGradient(-size * 0.15, -size * 0.18, 2, 0, 0, size * 0.42);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#efdde8");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.36, 0, Math.PI * 2);
    ctx.fill();
  },
  cloud(ctx, size) {
    ctx.beginPath();
    ctx.arc(-size * 0.24, size * 0.08, size * 0.22, 0, Math.PI * 2);
    ctx.arc(-size * 0.02, -size * 0.08, size * 0.28, 0, Math.PI * 2);
    ctx.arc(size * 0.26, size * 0.08, size * 0.24, 0, Math.PI * 2);
    ctx.rect(-size * 0.43, size * 0.06, size * 0.86, size * 0.24);
    ctx.fill();
  },
  smiley(ctx, size) {
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.46, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3b3045";
    ctx.lineWidth = size * 0.045;
    ctx.beginPath();
    ctx.arc(-size * 0.16, -size * 0.12, size * 0.025, 0, Math.PI * 2);
    ctx.arc(size * 0.16, -size * 0.12, size * 0.025, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, size * 0.05, size * 0.22, 0.2, Math.PI - 0.2);
    ctx.stroke();
  },
  sakura(ctx, size) {
    for (let i = 0; i < 5; i += 1) {
      ctx.save();
      ctx.rotate(i * Math.PI * 2 / 5);
      ctx.beginPath();
      ctx.ellipse(0, -size * 0.24, size * 0.16, size * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = "#ffd972";
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  },
  petals(ctx, template) {
    ctx.globalAlpha = 0.52;
    for (let i = 0; i < 34; i += 1) {
      const x = (i * 173) % template.width;
      const y = (i * 251) % template.height;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((i * 21) * Math.PI / 180);
      ctx.beginPath();
      ctx.ellipse(0, 0, 13, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  },
  doodle(ctx, item) {
    ctx.font = item.font || "48px Comic Sans MS, Bradley Hand, cursive";
    ctx.fillText(item.text || "cute", 0, 0);
  }
};

const OverlayEngine = {
  apply(ctx, template) {
    (template.overlays || []).forEach((name) => {
      if (name === "grain") this.grain(ctx, template, 0.11);
      if (name === "paper") this.paper(ctx, template);
      if (name === "scratches") this.scratches(ctx, template);
      if (name === "lightLeak") this.lightLeak(ctx, template);
      if (name === "bloom") this.bloom(ctx, template);
      if (name === "holographic") this.holographic(ctx, template);
      if (name === "flashReflection") this.flashReflection(ctx, template);
      if (name === "glitter") this.glitter(ctx, template);
      if (name === "lace") this.lace(ctx, template);
    });
  },
  grain(ctx, template, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    for (let i = 0; i < 4200; i += 1) {
      const shade = 180 + (i % 70);
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      ctx.fillRect((i * 47) % template.width, (i * 91) % template.height, 1.5, 1.5);
    }
    ctx.restore();
  },
  paper(ctx, template) {
    ctx.save();
    ctx.globalAlpha = 0.075;
    ctx.strokeStyle = "#7c5f50";
    for (let y = 0; y < template.height; y += 18) {
      ctx.beginPath();
      ctx.moveTo(0, y + ((y / 18) % 2) * 2);
      ctx.lineTo(template.width, y + 5);
      ctx.stroke();
    }
    ctx.restore();
  },
  scratches(ctx, template) {
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = "#fff6e8";
    for (let i = 0; i < 22; i += 1) {
      const x = (i * 83) % template.width;
      ctx.beginPath();
      ctx.moveTo(x, (i * 131) % template.height);
      ctx.lineTo(x + 16, ((i * 131) % template.height) + 220);
      ctx.stroke();
    }
    ctx.restore();
  },
  lightLeak(ctx, template) {
    const gradient = ctx.createRadialGradient(template.width, 0, 20, template.width, 0, template.width * 0.7);
    gradient.addColorStop(0, "rgba(255, 115, 92, 0.42)");
    gradient.addColorStop(0.55, "rgba(255, 205, 112, 0.18)");
    gradient.addColorStop(1, "rgba(255, 205, 112, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, template.width, template.height);
  },
  bloom(ctx, template) {
    const gradient = ctx.createRadialGradient(template.width * 0.5, template.height * 0.18, 40, template.width * 0.5, template.height * 0.18, template.width * 0.8);
    gradient.addColorStop(0, "rgba(255,255,255,0.26)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, template.width, template.height);
  },
  holographic(ctx, template) {
    const gradient = ctx.createLinearGradient(0, 0, template.width, template.height);
    gradient.addColorStop(0, "rgba(19,247,255,0.20)");
    gradient.addColorStop(0.32, "rgba(255,79,195,0.16)");
    gradient.addColorStop(0.66, "rgba(255,241,168,0.15)");
    gradient.addColorStop(1, "rgba(191,160,255,0.18)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, template.width, template.height);
  },
  flashReflection(ctx, template) {
    ctx.save();
    ctx.globalAlpha = 0.58;
    ctx.fillStyle = "rgba(255,255,255,0.48)";
    ctx.beginPath();
    ctx.ellipse(template.width * 0.72, template.height * 0.15, 85, 220, -0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
  glitter(ctx, template) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    for (let i = 0; i < 90; i += 1) {
      ctx.fillStyle = i % 2 ? "rgba(255,255,255,0.8)" : template.accent;
      DecorationEngine.drawDecoration(ctx, {
        type: "sparkle",
        x: (i * 149) % template.width,
        y: (i * 233) % template.height,
        size: 8 + (i % 4) * 4,
        color: ctx.fillStyle
      }, template);
    }
    ctx.restore();
  },
  lace(ctx, template) {
    ctx.save();
    ctx.globalAlpha = 0.42;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    for (let x = 0; x < template.width; x += 36) {
      ctx.beginPath();
      ctx.arc(x, 26, 18, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, template.height - 26, 18, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
};

const DownloadManager = {
  async download() {
    if (!appState.photos.length) return;
    const previousSelection = appState.selectedStickerId;
    try {
      appState.selectedStickerId = null;
      await CollageEngine.render({ includeSelection: false });
      const type = appState.exportType;
      const extension = type === "image/png" ? "png" : "jpg";
      const blob = await Utility.canvasToBlob(dom.collageCanvas, type, 0.94);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = Utility.filename(extension);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      UI.showToast("Download failed", error.message || "Could not download the collage.");
    } finally {
      appState.selectedStickerId = previousSelection;
      UI.updateStickerControls();
      await CollageEngine.render();
    }
  },
  downloadDataUrl(src) {
    const link = document.createElement("a");
    link.href = src;
    link.download = Utility.filename("png");
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  saveCurrentToHistory() {
    if (!appState.photos.length) return;
    const selected = appState.selectedStickerId;
    appState.selectedStickerId = null;
    CollageEngine.render({ includeSelection: false }).then(() => {
      const dataUrl = dom.collageCanvas.toDataURL("image/png", 0.86);
      appState.selectedStickerId = selected;
      appState.history.unshift(dataUrl);
      appState.history = appState.history.slice(0, 8);
      try {
        localStorage.setItem("nessphotobooth-history", JSON.stringify(appState.history));
        UI.renderHistory();
        UI.updateStickerControls();
        CollageEngine.render();
        UI.showToast("Saved locally", "The NessPhotoBooth preview is stored in this browser.");
      } catch {
        appState.history.pop();
        UI.showToast("Storage full", "Browser storage could not save another preview.");
      }
    });
  }
};

const Effects = {
  audioContext: null,
  getAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!this.audioContext) this.audioContext = new AudioContextClass();
    return this.audioContext;
  },
  async beep(value) {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") await ctx.resume();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.frequency.value = value === 1 ? 880 : 520;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.14);
  },
  shutterSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * 0.09;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = 0.14;
    noise.buffer = buffer;
    noise.connect(gain).connect(ctx.destination);
    noise.start();
  },
  flash() {
    dom.flash.classList.remove("active");
    void dom.flash.offsetWidth;
    dom.flash.classList.add("active");
  },
  async toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      UI.showToast("Fullscreen unavailable", "The browser blocked fullscreen mode.");
    }
  }
};

async function bootstrap() {
  UI.init();
  await CollageEngine.render();
  if (!window.isSecureContext && location.protocol !== "file:") {
    UI.showToast("Camera requires HTTPS", "Use HTTPS or open this file locally for webcam access.");
  }
}

bootstrap();
