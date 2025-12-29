let YT_READY = false;
let ytPlayer = null;

// Called by YouTube iframe API
function onYouTubeIframeAPIReady() {
    YT_READY = true;
}

// Parse YouTube URL or ID
function parseYouTubeId(input) {
    if (!input) return null;
    const str = String(input).trim();

    // Match typical YouTube URLs: v=ID, youtu.be/ID, embed/ID
    const regex = /(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/;
    const m = str.match(regex);
    if (m && m[1]) return m[1];

    // Accept direct 11-char IDs
    if (/^[A-Za-z0-9_-]{11}$/.test(str)) return str;

    return null;
}

// Create or reuse YouTube player
function ensureYtPlayer(containerId, videoId) {
    if (!YT_READY) {
        console.warn("YouTube API not ready yet.");
        return null;
    }
    if (ytPlayer) return ytPlayer;

    const origin = (location.origin && location.origin.startsWith("http")) ? location.origin : undefined;

    ytPlayer = new YT.Player(containerId, {
        height: "200",
        width: "356",
        videoId,
        host: "https://www.youtube-nocookie.com", // removed trailing space
        playerVars: {
            controls: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            origin: origin
        },
        events: {
            onReady: ev => {
                try {
                    // Allow autoplay when user clicks Play in your UI
                    const iframe = ev.target.getIframe();
                    iframe.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture");
                } catch (e) {}
            },
            onError: ev => {
                console.warn("YouTube player error:", ev.data);
                // 101/150/153 => embedding disabled/blocked
            }
        }
    });

    return ytPlayer;
}

// Play video by ID or URL
function ytPlay(videoId) {
    const id = parseYouTubeId(videoId);
    if (!id) return;

    if (!ytPlayer) {
        ensureYtPlayer("yt-container", id);
        // Autoplay only allowed via user gesture
        setTimeout(() => {
            ytPlayer && ytPlayer.playVideo && ytPlayer.playVideo();
        }, 0);
    } else {
        ytPlayer.loadVideoById(id);
        ytPlayer.playVideo();
    }
}

// Pause video
function ytPause() {
    if (ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo();
}

// Set volume (0..1)
function ytSetVolume(v) {
    if (ytPlayer && ytPlayer.setVolume) {
        const vol = Math.max(0, Math.min(100, Math.round((parseFloat(v) || 0) * 100)));
        ytPlayer.setVolume(vol);
    }
}

// Expose globally
window.ytPlay = ytPlay;
window.ytPause = ytPause;
window.ytSetVolume = ytSetVolume;
