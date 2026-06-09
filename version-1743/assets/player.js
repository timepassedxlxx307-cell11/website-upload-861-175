(function () {
    window.setupMoviePlayer = function (videoId, buttonId, source) {
        const video = document.getElementById(videoId);
        const button = document.getElementById(buttonId);
        const Hls = window.Hls;
        if (!video || !button || !source) {
            return;
        }
        let ready = false;
        let hls = null;
        const play = function () {
            const playNow = function () {
                video.setAttribute('controls', 'controls');
                button.classList.add('is-hidden');
                video.play().catch(function () {});
            };
            if (ready) {
                playNow();
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                ready = true;
                playNow();
                return;
            }
            if (Hls && Hls.isSupported()) {
                hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    ready = true;
                    playNow();
                });
                return;
            }
            video.src = source;
            ready = true;
            playNow();
        };
        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
}());
