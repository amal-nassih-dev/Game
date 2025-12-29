let audioCtx = null;
let notificationGain = null;
let notificationPlayedPreEnd = false;

let bgAudioEl = null;
// Track created object URLs so we can revoke them later
let bgObjectUrls = [];

function getAudioCtx() {
    if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        audioCtx = new AC();
    }
    return audioCtx;
}

// Call this from any user click to unlock audio
function enableAudio() {
    try {
        const ctx = getAudioCtx();
        if (ctx && ctx.state === "suspended") ctx.resume();
    } catch (e) { }
}

// Notification beeps (pre-end and end)
function playNotification(type) {
    if (!appConfig.sound?.notifications) return;
    const ctx = getAudioCtx();
    if (!ctx) return; // not supported or blocked

    // Attempt resume just in case
    if (ctx.state === "suspended") {
        ctx.resume().catch(() => { });
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = (type === "end") ? 660 : 440;
    gain.gain.value = Math.max(0, Math.min(1, appConfig.sound?.volume ?? 0.5));

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    setTimeout(() => {
        try { osc.stop(); } catch (e) { }
    }, 220);
}

// Background audio utilities
function initBgAudio() {
    if (bgAudioEl) return bgAudioEl;
    bgAudioEl = new Audio();
    bgAudioEl.loop = true;
    bgAudioEl.volume = appConfig.bgAudio?.volume ?? 0.35;
    // iOS needs preload set sometimes
    bgAudioEl.preload = "auto";
    return bgAudioEl;
}
function setBgMode(mode) {
    appConfig.bgAudio.mode = mode || "none";
}
function setBgVolume(v) {
    const el = initBgAudio();
    const vol = Math.max(0, Math.min(1, parseFloat(v) || 0));
    appConfig.bgAudio.volume = vol;
    el.volume = vol;
}
function setBgPlaylist(mode, urls) {
    if (!Array.isArray(urls)) return;
    appConfig.bgAudio.playlists[mode] = urls;
}
function pickTrackForMode(mode) {
    const list = (appConfig.bgAudio.playlists?.[mode] || []).filter(Boolean);
    if (!list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
}
function stopBg() {
    if (bgAudioEl) {
        try { bgAudioEl.pause(); bgAudioEl.src = ""; } catch (e) { }
    }
}
function playBg() {
    if (!appConfig.bgAudio?.enabled) return;
    const mode = appConfig.bgAudio.mode || "none";
    if (mode === "none") return;

    // Ensure audio is unlocked by a prior user gesture
    enableAudio();

    const url = pickTrackForMode(mode);
    if (!url) return;

    const el = initBgAudio();
    if (el.src !== url) el.src = url;
    el.play().catch(() => { /* user must click play/pause if blocked */ });
}
function toggleBgPlay() {
    const el = initBgAudio();
    // Ensure context unlocked on click
    enableAudio();
    if (!el.src) {
        playBg();
        return;
    }
    if (el.paused) el.play().catch(() => { });
    else el.pause();
}

// Handle local uploads as background tracks
function addUploadedFilesToPlaylist(mode, files) {
    if (!files || !files.length) return;
    const urls = [];
    for (const f of files) {
        const u = URL.createObjectURL(f);
        bgObjectUrls.push(u);
        urls.push(u);
    }
    const existing = appConfig.bgAudio.playlists[mode] || [];
    setBgPlaylist(mode, existing.concat(urls));
}
// Revoke object URLs on page unload
window.addEventListener("beforeunload", () => {
    bgObjectUrls.forEach(u => {
        try { URL.revokeObjectURL(u); } catch (e) { }
    });
    bgObjectUrls = [];
});

// Expose globals
window.enableAudio = enableAudio;
window.playNotification = playNotification;
window.setBgMode = setBgMode;
window.setBgVolume = setBgVolume;
window.setBgPlaylist = setBgPlaylist;
window.stopBg = stopBg;
window.playBg = playBg;
window.toggleBgPlay = toggleBgPlay;
window.addUploadedFilesToPlaylist = addUploadedFilesToPlaylist;