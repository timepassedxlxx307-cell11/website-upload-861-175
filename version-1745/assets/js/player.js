(function () {
    window.bootPlayer = function (videoId, buttonId, coverId, url) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var cover = document.getElementById(coverId);
        var started = false;
        var hlsInstance = null;

        if (!video || !button || !cover || !url) {
            return;
        }

        var begin = function () {
            if (!started) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = url;
                }
                started = true;
            }
            cover.classList.add("is-hidden");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        };

        button.addEventListener("click", begin);
        cover.addEventListener("click", begin);
        video.addEventListener("click", function () {
            if (video.paused) {
                begin();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();
