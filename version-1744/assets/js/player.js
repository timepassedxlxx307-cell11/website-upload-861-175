(function() {
  function setupMoviePlayer(options) {
    var video = document.querySelector(options.videoSelector);
    var button = document.querySelector(options.buttonSelector);
    var overlay = document.querySelector(options.overlaySelector);
    var hls = null;
    var attached = false;

    if (!video || !button || !options.source) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = options.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(options.source);
        hls.attachMedia(video);
      } else {
        video.src = options.source;
      }
    }

    function play() {
      attach();
      video.controls = true;

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function() {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    button.addEventListener("click", play);

    if (overlay && overlay !== button) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function() {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener("pagehide", function() {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
