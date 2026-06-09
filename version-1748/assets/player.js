(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(function (box) {
      var video = box.querySelector('video');
      var cover = box.querySelector('.player-cover');
      var stream = box.getAttribute('data-stream');
      var prepared = false;
      var hlsInstance = null;

      function setStream() {
        if (!video || !stream || prepared) {
          return Promise.resolve();
        }

        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return Promise.resolve();
        }

        return loadHlsLibrary().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
          } else {
            video.src = stream;
          }
        }).catch(function () {
          video.src = stream;
        });
      }

      function start() {
        setStream().then(function () {
          if (cover) {
            cover.classList.add('is-hidden');
          }

          var playResult = video.play();

          if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {});
          }
        });
      }

      if (cover) {
        cover.addEventListener('click', start);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            start();
          }
        });

        video.addEventListener('play', function () {
          if (cover) {
            cover.classList.add('is-hidden');
          }
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
